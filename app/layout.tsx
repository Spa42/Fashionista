import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beauty AI - AI Skin Consultation",
  description: "Get personalized skin care recommendations with our AI-powered consultation tool.",
  keywords: "beauty, skincare, AI, consultation, skin analysis",
  authors: [{ name: "Beauty AI Team" }],
  creator: "Beauty AI",
  publisher: "Beauty AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://beauty-ai.example.com",
    title: "Beauty AI - Personalized AI Skin Consultation",
    description: "Get personalized skin care recommendations with our AI-powered consultation tool.",
    siteName: "Beauty AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beauty AI - AI Skin Consultation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beauty AI - Personalized AI Skin Consultation",
    description: "Get personalized skin care recommendations with our AI-powered consultation tool.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
