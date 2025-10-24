import type { Metadata } from "next";
import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-serif" });

export const metadata = {
  title: "TrendNest Media — Digital Marketing for Local Businesses",
  description:
    "Helping small businesses grow with social media marketing, Google Ads, SEO, and web development. Book a free discovery call today.",
  keywords: [
    "local business marketing",
    "SEO",
    "Google Ads",
    "web design",
    "social media management",
    "small business marketing agency",
  ],
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} bg-canvas text-ink antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
