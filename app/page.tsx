import Link from "next/link";
import type { Metadata } from "next";
import { FlightTool } from "@/components/FlightTool";
import { SectionCard } from "@/components/SectionCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "FlightVsLight - Flight Daylight and Darkness Visualizer",
  description:
    "See whether your flight is likely to be in daylight, twilight, night, or all three along the route.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main>
        <section className="border-b border-slate-900 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_38%),radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.12),transparent_26%),#020617]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200">See how flight timing, daylight, sunset, and night line up on any route</div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">See whether your flight stays in daylight, crosses sunset, or chases the night.</h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">Enter your airports, departure time, and either a duration, arrival time, or aircraft speed estimate. The map animates your route against Earth’s day and night cycle.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/tool" className="rounded-2xl bg-sky-500 px-5 py-3 font-medium text-slate-950 hover:bg-sky-400">Try the tool</Link>
                <Link href="/faq" className="rounded-2xl border border-slate-700 px-5 py-3 font-medium text-white hover:bg-slate-900">How it works</Link>
              </div>
            </div>
            <div className="rounded-[32px] border border-slate-800 bg-slate-900/75 p-6 shadow-2xl">
              <div className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">What this site helps answer</div>
              <div className="space-y-3 text-slate-200">
                <div className="rounded-2xl bg-slate-800/80 p-4">Will my flight be mostly in daylight or darkness?</div>
                <div className="rounded-2xl bg-slate-800/80 p-4">Will I see sunrise or sunset during the trip?</div>
                <div className="rounded-2xl bg-slate-800/80 p-4">How does eastbound vs westbound travel change the experience?</div>
                <div className="rounded-2xl bg-slate-800/80 p-4">What duration is realistic if I only know route and aircraft type?</div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-12 md:py-16"><FlightTool /></section>
        <section className="mx-auto max-w-7xl px-6 py-6 md:py-10"><div className="grid gap-6 lg:grid-cols-3"><SectionCard title="1. Enter your route">Choose departure and arrival airports, then set a departure date and local time.</SectionCard><SectionCard title="2. Choose timing mode">Enter a duration, arrival time, or estimate block time from aircraft speed and typical winds aloft.</SectionCard><SectionCard title="3. Watch the flight vs. the sun">Play the route forward and see local times, changing light conditions, and how the aircraft moves relative to the terminator line.</SectionCard></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
