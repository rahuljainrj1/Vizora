import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import { QueryProvider } from "@/components/app/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-vizora-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Digital Catalogues That Close More Showroom Sales",
    template: "%s | Vizora",
  },
  description:
    "A lightweight showroom catalog workflow for fabrication and interiors vendors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ink">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
