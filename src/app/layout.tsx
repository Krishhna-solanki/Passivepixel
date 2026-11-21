import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Passive Pixel | Creative Technology & Digital Growth Studio",
  description:
    "Passive Pixel helps businesses build a powerful digital presence through creative design, modern websites, branding and smart technology.",
  openGraph: {
    title: "Passive Pixel | Think Digital. Grow Bigger.",
    description:
      "Creative design, modern websites, branding and smart technology for growing businesses.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080D",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}>
      <body className="min-h-screen bg-obsidian text-white">{children}</body>
    </html>
  );
}
