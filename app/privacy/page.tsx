import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Plain-English privacy information for FlightVsLight, a browser-based flight daylight visualization tool.",
};

const sections = [
  {
    title: "No Account Required",
    body:
      "FlightVsLight does not require you to create an account, sign in, or provide personal information to use the tool.",
  },
  {
    title: "Browser-Based Route Inputs",
    body:
      "The route, aircraft, departure time, duration, and arrival inputs are used to generate the visualization in your browser. Shareable URLs may include those route settings so you can revisit or send the same setup to someone else.",
  },
  {
    title: "No Live Tracking or Booking Data",
    body:
      "FlightVsLight is not connected to airline reservations, airport systems, air traffic control, or live flight tracking feeds. It does not know who you are flying with or whether you booked a ticket.",
  },
  {
    title: "Future Analytics or Ads",
    body:
      "If analytics, advertising, affiliate links, or other third-party services are added later, this policy should be updated before those services are used. Any future tracking should be explained clearly and kept appropriate for a small public tool site.",
  },
  {
    title: "Contact",
    body:
      "Questions about privacy can be sent to hello@flightvslight.com once the public contact inbox is active.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
          <p className="text-lg leading-8 text-slate-300">
            FlightVsLight is currently a small browser-based tool. This page
            explains, in plain English, how the site is intended to handle route
            inputs and privacy as it moves toward public launch.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            >
              <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
              <p className="leading-8 text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-sm leading-7 text-slate-400">
          This privacy page is informational and should be reviewed before the
          site is launched publicly, especially if new services, analytics,
          ads, forms, or hosting features are added.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
