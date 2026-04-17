import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About",
  description:
    "About FlightVsLight, a browser tool for understanding daylight, darkness, route direction, and time zones in flight.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            About FlightVsLight
          </h1>
          <p className="text-lg leading-8 text-slate-300">
            FlightVsLight is a standalone browser tool for seeing how a flight
            lines up with daylight, darkness, twilight, time zones, and route
            direction.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-3 text-2xl font-semibold">What It Does</h2>
            <p className="leading-8 text-slate-300">
              Enter a departure airport, arrival airport, departure time, and a
              timing estimate. FlightVsLight draws the route on a world map and
              shows where the aircraft is likely to be in daylight, twilight, or
              night as the trip progresses. It is designed to make an itinerary
              feel understandable at a glance, especially when time zones and
              date changes make the flight hard to picture.
            </p>
          </section>

          <section className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-3 text-2xl font-semibold">Who It Is For</h2>
            <p className="leading-8 text-slate-300">
              The tool is built for travelers choosing flights, aviation
              enthusiasts comparing routes, photographers hoping for golden-hour
              windows, and curious people who want to understand what actually
              happens between departure and arrival. It can help answer whether
              a route stays mostly in daylight, crosses sunset, wakes into
              sunrise, or spends most of the trip in darkness.
            </p>
          </section>

          <section className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-3 text-2xl font-semibold">How It Works</h2>
            <p className="leading-8 text-slate-300">
              FlightVsLight runs in the browser using airport data, great-circle
              route geometry, time-zone formatting, solar position math, and a
              simple typical winds-aloft model for estimate mode. It is not a
              live tracking system or weather service. The goal is a fast,
              visual planning experience that helps you reason about the shape
              and light of a flight before you take it.
            </p>
          </section>

          <section className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-3 text-2xl font-semibold">Why It Exists</h2>
            <p className="leading-8 text-slate-300">
              Flight itineraries are full of local times, date changes, and
              durations, but they rarely explain what the trip will feel like.
              FlightVsLight turns those details into a visual timeline so you
              can see the relationship between the aircraft, the sun, and the
              planet underneath. It is meant to be quick to use, easy to share,
              and clear enough for both casual travelers and avgeeks.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
