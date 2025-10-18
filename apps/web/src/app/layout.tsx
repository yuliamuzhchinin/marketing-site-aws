import type { Metadata } from "next";
import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-serif" });

export const metadata: Metadata = {
  title: "TrendNest Media — Social Media & Google Ads for Local Businesses",
  description: "We help local businesses win more customers with social media and Google Ads.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} bg-canvas text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
