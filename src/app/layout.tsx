import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eidetic — Modern AI Brand Studio",
  description: "Brand graphics that look like you made them. Teach Eidetic your colors, type and voice once, then generate posters and social graphics on brand every time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#f7f9ff] text-[#181c20] antialiased selection:bg-[#5046e5] selection:text-white">
        {children}
      </body>
    </html>
  );
}
