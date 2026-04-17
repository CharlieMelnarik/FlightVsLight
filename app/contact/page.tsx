import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact FlightVsLight with bug reports, airport suggestions, aircraft suggestions, and feature requests.",
};

const topics = [
  "Bug reports or confusing results",
  "Airport additions or corrections",
  "Aircraft suggestions",
  "Feature requests for route sharing, timing, or visualization",
  "Feedback from travelers, pilots, photographers, and avgeeks",
];

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
          <p className="text-lg leading-8 text-slate-300">
            Have a route that looks wrong, an airport that should be added, or
            an idea that would make FlightVsLight more useful? Send a note.
          </p>
        </div>

        <section className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <h2 className="mb-3 text-2xl font-semibold">Email</h2>
          <p className="leading-8 text-slate-300">
            The public contact address is{" "}
            <a
              href="mailto:hello@flightvslight.com"
              className="font-medium text-sky-200 hover:text-sky-100"
            >
              hello@flightvslight.com
            </a>
            . If that inbox is not active yet, treat it as the launch placeholder
            for support, corrections, and feedback.
          </p>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <h2 className="mb-4 text-2xl font-semibold">Good Reasons To Reach Out</h2>
          <div className="grid gap-3">
            {topics.map((topic) => (
              <div
                key={topic}
                className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 text-slate-300"
              >
                {topic}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <h2 className="mb-3 text-2xl font-semibold">What Helps</h2>
          <p className="leading-8 text-slate-300">
            For bug reports, include the departure airport, arrival airport,
            departure time, timing mode, aircraft type, and what seemed off. For
            airport suggestions, include the airport code, city, airport name,
            and time zone if you know it. Clear details make it much easier to
            improve the tool.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
