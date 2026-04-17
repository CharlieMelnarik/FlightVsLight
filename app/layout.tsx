import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://flightvslight.com"),
  title: {
    default: "FlightVsLight - See Daylight and Darkness Along Your Flight",
    template: "%s | FlightVsLight",
  },
  description:
    "Plan flights around daylight, darkness, twilight, time zones, and route direction with a fast visual flight-light map.",
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
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "FlightVsLight",
    description:
      "Visualize whether a flight is likely to be in daylight, twilight, night, or a mix of all three.",
    url: "https://flightvslight.com",
    siteName: "FlightVsLight",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FlightVsLight",
    description:
      "See daylight, darkness, twilight, and time zones along a flight route.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}
