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
  title: "Dr. Bashar Clinic - AI Skin Consultant",
  description: "Get personalized skincare recommendations with our AI-powered skin analysis.",
  keywords: "skincare, dermatology, AI, consultation, skin analysis, personalized treatments",
  authors: [{ name: "Dr. Bashar Clinic Team" }],
  creator: "Dr. Bashar Clinic",
  publisher: "Dr. Bashar Clinic",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://drbashar.example.com",
    title: "Dr. Bashar Clinic - AI Skin Consultant",
    description: "Get personalized skincare recommendations with our AI-powered skin analysis.",
    siteName: "Dr. Bashar Clinic",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dr. Bashar Clinic - AI Skin Consultant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Bashar Clinic - AI Skin Consultant",
    description: "Get personalized skincare recommendations with our AI-powered skin analysis.",
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
