import "./globals.css";
import type { Metadata } from "next";

const siteUrl = "https://flightvslight.com";
const siteTitle = "FlightVsLight";
const siteDescription = "See your flight vs daylight and night";
const socialImage = `${siteUrl}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "flight daylight",
    "flight darkness",
    "sunrise flight",
    "sunset flight",
    "flight time zones",
    "flight route map",
    "aviation tool",
    "FlightVsLight",
  ],
  applicationName: "FlightVsLight",
  authors: [{ name: "FlightVsLight" }],
  creator: "FlightVsLight",
  publisher: "FlightVsLight",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "FlightVsLight flight daylight and night preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}
