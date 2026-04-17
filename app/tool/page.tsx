import type { Metadata } from "next";
import { FlightTool } from "@/components/FlightTool";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Flight Daylight Tool",
  description:
    "Enter airports, departure time, and duration to visualize daylight, darkness, twilight, and time zones along a flight route.",
};

export default function ToolPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <FlightTool />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
