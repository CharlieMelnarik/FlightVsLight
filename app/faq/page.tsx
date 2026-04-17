import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Learn how FlightVsLight estimates daylight, darkness, twilight, timing modes, and route direction for flights.",
};

const faqs = [
  {
    question: "Does FlightVsLight use real-time weather or live flight tracking?",
    answer:
      "No. FlightVsLight is a planning and visualization tool, not a live operations product. It does not pull real-time weather, aircraft positions, airline schedules, or air traffic control routing. The tool uses airport coordinates, route geometry, solar position math, time zones, and a simple typical winds model to show how a flight may line up with daylight and darkness.",
  },
  {
    question: "How accurate is estimate mode?",
    answer:
      "Estimate mode is meant to give a reasonable planning estimate when you know the route and aircraft type but do not know the exact block time. It uses great-circle distance, a typical cruise speed, basic block-time padding, and optional typical winds aloft. Real flights can differ because of routing, runway flow, taxi time, airspace restrictions, seasonal winds, aircraft weight, and airline scheduling choices.",
  },
  {
    question: "What do the three timing modes mean?",
    answer:
      "Enter duration lets you provide the total scheduled or expected flight time. Enter arrival time lets you set both the departure and arrival local times, which is useful when copying an itinerary. Estimate from speed calculates a rough duration from the selected aircraft and route, with an optional adjustment for typical winds.",
  },
  {
    question: "Why is the map Pacific-centered?",
    answer:
      "Many long-haul routes cross the Pacific or approach the international date line, where a standard Atlantic-centered world map can split the route awkwardly across both edges. A Pacific-centered map keeps routes like North America to Asia, Hawaii, Australia, and New Zealand easier to read.",
  },
  {
    question: "Why can eastbound and westbound flights feel so different?",
    answer:
      "Direction changes how your flight moves relative to Earth rotation, time zones, and the day-night boundary. An eastbound flight may race through local time zones and shorten the apparent night, while a westbound flight can stretch daylight or make the same clock hour feel like it lasts longer. Winds aloft also tend to favor one direction on many routes.",
  },
  {
    question: "Does it work for both long-haul and short-haul flights?",
    answer:
      "Yes. Short flights can show whether takeoff, cruise, or landing happens near sunrise or sunset. Long-haul flights are where the tool becomes especially useful because daylight, darkness, route direction, date changes, and time zones can all interact in ways that are hard to picture from an itinerary alone.",
  },
  {
    question: "Can this tell me whether I will personally see sunrise or sunset?",
    answer:
      "It can show when the aircraft position is likely to be in daylight, twilight, or night along the route. Your actual view depends on seat side, window shade, cloud cover, aircraft attitude, cabin lighting, and the exact route flown. Treat it as a visual guide rather than a guarantee.",
  },
  {
    question: "Why are twilight categories included?",
    answer:
      "The experience outside the window is not just day or night. Civil, nautical, and astronomical twilight help show the transition periods when the horizon may glow, the sky may remain blue, or stars may become visible before full darkness.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">FAQ</h1>
          <p className="text-lg leading-8 text-slate-300">
            Answers to common questions about how FlightVsLight estimates route
            timing, daylight, darkness, twilight, and the feel of flying across
            time zones.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item) => (
            <section
              key={item.question}
              className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            >
              <h2 className="mb-3 text-xl font-semibold text-white">
                {item.question}
              </h2>
              <p className="leading-8 text-slate-300">{item.answer}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
