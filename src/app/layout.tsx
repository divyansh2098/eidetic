import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eidetic — Precision AI Brand Studio",
  description: "Tactile Industrial Visual Engine. Generate consistent, brand-calibrated graphics powered by conversational AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#0c0e12] text-[#eef1f7] antialiased selection:bg-[#4edea3] selection:text-black font-sans">
        {children}
      </body>
    </html>
  );
}
