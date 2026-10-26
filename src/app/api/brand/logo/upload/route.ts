import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const brandId = (formData.get("brandId") as string) || "default-brand";
    const previousPath = formData.get("previousPath") as string | null;
    const previousRasterPath = formData.get("previousRasterPath") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed limit of 5 MB.` },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const bucket = "brand-assets";

    // Ensure bucket exists
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.some((b: any) => b.id === bucket)) {
      await admin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
      });
    }

    // Purge previous logo objects if requested
    const toPurge: string[] = [];
    if (previousPath) toPurge.push(previousPath);
    if (previousRasterPath) toPurge.push(previousRasterPath);
    if (toPurge.length > 0) {
      try {
        await admin.storage.from(bucket).remove(toPurge);
      } catch (purgeErr) {
        console.warn("[LogoUploadAPI] Could not purge old logo objects:", purgeErr);
      }
    }

    const timestamp = Date.now();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

    if (isSvg) {
      const svgPath = `${brandId}/logos/logo-original-${timestamp}.svg`;
      const { error: uploadErr } = await admin.storage
        .from(bucket)
        .upload(svgPath, fileBuffer, {
          contentType: "image/svg+xml",
          upsert: true,
        });

      if (uploadErr) {
        throw uploadErr;
      }

      const { data: urlData } = admin.storage.from(bucket).getPublicUrl(svgPath);

      return NextResponse.json({
        logo_storage_path: svgPath,
        logo_raster_storage_path: null,
        public_url: urlData.publicUrl,
      });
    } else {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const storagePath = `${brandId}/logos/logo-${timestamp}.${ext}`;

      const { error: uploadErr } = await admin.storage
        .from(bucket)
        .upload(storagePath, fileBuffer, {
          contentType: file.type || "image/png",
          upsert: true,
        });

      if (uploadErr) {
        throw uploadErr;
      }

      const { data: urlData } = admin.storage.from(bucket).getPublicUrl(storagePath);

      return NextResponse.json({
        logo_storage_path: storagePath,
        logo_raster_storage_path: null,
        public_url: urlData.publicUrl,
      });
    }
  } catch (err: any) {
    console.error("[LogoUploadAPI] Server upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload logo." },
      { status: 500 }
    );
  }
}
