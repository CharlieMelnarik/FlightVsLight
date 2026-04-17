"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightLeft, Pause, Plane, Play, RotateCcw } from "lucide-react";
import { geoEquirectangular, geoGraticule10, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import countries110m from "world-atlas/countries-110m.json";
import { AIRCRAFT } from "@/data/aircraft";
import { AIRPORTS, type Airport } from "@/data/airports";
import { greatCircleDistanceNm, interpolateGreatCircle, LatLon, splitWrappedPath } from "@/lib/geo";
import { estimatedDurationMinutes, estimatedDurationWithTypicalWindsMinutes, typicalAlongTrackWindKts } from "@/lib/winds";
import { lightingLabel, solarAltitude, solarDeclinationDegrees, solarSubLon } from "@/lib/solar";
import { formatDuration, formatTime, toLocalInputValue, zonedDateTimeToUtc } from "@/lib/time";

const WIDTH = 1200;
const HEIGHT = 620;
type SearchOption = {
  value: string;
  label: string;
  searchText: string;
  code?: string;
  iata?: string;
  icao?: string;
  city?: string;
  name?: string;
  country?: string;
  aliases?: string[];
  priority?: number;
};

const MAJOR_AIRPORTS = new Set([
  "ATL", "PEK", "PVG", "CAN", "ORD", "DFW", "DEN", "LAX", "JFK", "SFO",
  "SEA", "LAS", "MCO", "MIA", "CLT", "PHX", "IAH", "BOS", "EWR", "YYZ",
  "YVR", "MEX", "GRU", "BOG", "LHR", "LGW", "CDG", "AMS", "FRA", "MAD",
  "BCN", "IST", "FCO", "MUC", "ZRH", "VIE", "CPH", "ARN", "OSL", "DUB",
  "DXB", "DOH", "AUH", "JED", "DEL", "BOM", "BLR", "SIN", "BKK", "KUL",
  "HKG", "TPE", "ICN", "NRT", "HND", "KIX", "MNL", "CGK", "SYD", "MEL",
  "BNE", "AKL", "JNB", "CPT", "ADD", "NBO",
]);
const HUB_PRIORITY: Record<string, number> = {
  ATL: 900,
  PEK: 850,
  PVG: 850,
  DXB: 850,
  LHR: 850,
  CDG: 800,
  AMS: 800,
  FRA: 800,
  IST: 800,
  DFW: 800,
  DEN: 780,
  ORD: 780,
  LAX: 780,
  JFK: 760,
  SFO: 740,
  SIN: 780,
  HKG: 760,
  ICN: 760,
  HND: 760,
  NRT: 720,
  SYD: 740,
  MEL: 650,
  YYZ: 700,
  GRU: 700,
  MEX: 680,
};

const countriesGeo = feature(countries110m as any, (countries110m as any).objects.countries);
const projection = geoEquirectangular().rotate([-180, 0]).translate([WIDTH / 2, HEIGHT / 2]).scale(WIDTH / (2 * Math.PI));
const pathGenerator = geoPath(projection);
const graticulePath = pathGenerator(geoGraticule10());

function projectLonLat(lon: number, lat: number) {
  const p = projection([lon, lat]);
  return p ? { x: p[0], y: p[1] } : { x: 0, y: 0 };
}
function toPacificX(lon: number) { return projectLonLat(lon, 0).x; }
function toY(lat: number) { return projectLonLat(0, lat).y; }

function scoreOption(option: SearchOption, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return option.priority ?? 0;

  let score = option.priority ?? 0;
  const code = option.code?.toLowerCase();
  const iata = option.iata?.toLowerCase();
  const icao = option.icao?.toLowerCase();
  const city = option.city?.toLowerCase();
  const name = option.name?.toLowerCase();
  const country = option.country?.toLowerCase();
  if (q === code || q === iata) score += 10000;
  if (q === icao) score += 9000;
  if (code?.startsWith(q) || iata?.startsWith(q)) score += 7000;
  if (icao?.startsWith(q)) score += 6200;
  if (city === q) score += 5200;
  if (name === q) score += 5000;
  if (city?.startsWith(q)) score += 3600;
  if (name?.startsWith(q)) score += 3200;
  if (country === q) score += 1800;

  for (const alias of option.aliases ?? []) {
    const normalizedAlias = alias.toLowerCase();
    if (normalizedAlias === q) score += 6500;
    else if (normalizedAlias.startsWith(q)) score += 4300;
    else if (normalizedAlias.includes(q)) score += 1900;
  }

  if (q.length > 3 && option.searchText.includes(q)) score += 300;
  return score;
}

function SearchableCombobox({ label, value, onChange, options, placeholder }:{
  label:string; value:string; onChange:(v:string)=>void;
  options:SearchOption[]; placeholder:string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value) ?? null;
  useEffect(() => { setQuery(selectedOption?.label ?? ""); }, [selectedOption?.label]);
  useEffect(() => {
    const handle = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(selectedOption?.label ?? "");
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [selectedOption?.label]);

  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options.slice(0, 12);
    return options
      .map((opt) => ({ option: opt, score: scoreOption(opt, needle) }))
      .filter(
        ({ option, score }) =>
          score > (option.priority ?? 0) ||
          (needle.length > 3 && option.searchText.includes(needle)),
      )
      .sort((a, b) => b.score - a.score || a.option.label.localeCompare(b.option.label))
      .slice(0, 12)
      .map(({ option }) => option);
  }, [options, query]);

  return (
    <div ref={rootRef} className="relative flex flex-col gap-2 text-sm">
      <span className="text-slate-300">{label}</span>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
      />
      {open && (
        <div className="absolute top-full z-20 mt-1 max-h-72 w-full overflow-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
          {filteredOptions.length ? filteredOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setQuery(opt.label); setOpen(false); }}
              className="w-full border-b border-slate-800 px-4 py-3 text-left text-white hover:bg-slate-800 last:border-b-0"
            >
              {opt.label}
            </button>
          )) : <div className="px-4 py-3 text-slate-400">No matches found</div>}
        </div>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, min = 0, max = 999 }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="text-slate-300">{label}</span>
      <input type="number" min={min} max={max} value={value} onChange={onChange} className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none" />
    </label>
  );
}

function OceanAndLighting({ subsolarLon, declinationDeg }: { subsolarLon: number; declinationDeg: number }) {
  const cols = [];
  for (let i = 0; i < 360; i++) {
    const lon = -180 + i;
    const x1 = projectLonLat(lon, 0).x;
    const x2Raw = projectLonLat(lon + 1, 0).x;
    const wrapped = Math.abs(x2Raw - x1) > WIDTH * 0.5;
    const x2 = wrapped ? x1 + WIDTH / 360 : x2Raw;
    const left = Math.min(x1, x2);
    const width = Math.max(1.2, Math.abs(x2 - x1) + 0.6);

    const bands = [];
    let currentBand: null | { type: string; start: number } = null;
    for (let lat = 90; lat >= -90; lat -= 1.5) {
      const alt = solarAltitude(lat, lon, subsolarLon, declinationDeg);
      let band = "night";
      if (alt > 0) band = "day";
      else if (alt > -6) band = "civil";
      else if (alt > -12) band = "nautical";
      else if (alt > -18) band = "astro";
      if (!currentBand) currentBand = { type: band, start: lat };
      else if (currentBand.type !== band) { bands.push({ ...currentBand, end: lat + 1.5 }); currentBand = { type: band, start: lat }; }
    }
    if (currentBand) bands.push({ ...currentBand, end: -90 });

    cols.push(<g key={i}>{bands.map((b: any, idx: number) => {
      const y1 = toY(b.start), y2 = toY(b.end);
      const fill = b.type === "day" ? "#7cc8ff" : b.type === "civil" ? "#f7b267" : b.type === "nautical" ? "#556fb5" : b.type === "astro" ? "#243864" : "#07111f";
      return <rect key={idx} x={left} y={Math.min(y1, y2)} width={width} height={Math.abs(y2 - y1)} fill={fill} />;
    })}</g>);
  }
  return (
    <g>
      {cols}
      <path d={graticulePath || ""} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <line x1={toPacificX(180)} y1={0} x2={toPacificX(180)} y2={HEIGHT} stroke="rgba(255,255,255,0.3)" strokeDasharray="6 8" />
    </g>
  );
}

function LandMasses() {
  return <g>{countriesGeo.features.map((featureItem: any, idx: number) => {
    const d = pathGenerator(featureItem);
    return d ? <path key={idx} d={d} fill="rgba(88,117,92,0.96)" stroke="rgba(233,245,233,0.34)" strokeWidth="0.65" /> : null;
  })}</g>;
}

function Route({ routeSegments, flownSegments }: { routeSegments: LatLon[][]; flownSegments: LatLon[][] }) {
  return <g>
    {routeSegments.map((segment, idx) => <path key={idx} d={segment.map((p, i) => { const pt = projectLonLat(p.lon, p.lat); return `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`; }).join(" ")} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeDasharray="7 7" />)}
    {flownSegments.map((segment, idx) => <path key={`f-${idx}`} d={segment.map((p, i) => { const pt = projectLonLat(p.lon, p.lat); return `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`; }).join(" ")} fill="none" stroke="rgba(255,199,95,0.95)" strokeWidth="4.5" strokeLinecap="round" />)}
  </g>;
}

function AircraftMarker({ routePoints, progress }: { routePoints: LatLon[]; progress: number }) {
  const idx = Math.min(routePoints.length - 1, Math.max(1, Math.round(progress * (routePoints.length - 1))));
  const p = routePoints[idx];
  const prev = routePoints[Math.max(0, idx - 1)];
  const pt = projectLonLat(p.lon, p.lat), prevPt = projectLonLat(prev.lon, prev.lat);
  const angle = Math.atan2(pt.y - prevPt.y, pt.x - prevPt.x) * (180 / Math.PI);
  return (
    <g transform={`translate(${pt.x}, ${pt.y}) rotate(${angle})`}>
      <circle r="22" fill="rgba(255,255,255,0.10)" />
      <path d="M 24 0 L 15 -2.2 L 5 -3.2 L -4 -12 L -7 -12 L -6 -3.4 L -16 -3.4 L -21 -10 L -24 -10 L -21 -1.8 L -21 1.8 L -24 10 L -21 10 L -16 3.4 L -6 3.4 L -7 12 L -4 12 L 5 3.2 L 15 2.2 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.4" />
    </g>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><span className="text-slate-400">{label}:</span> <span className="font-medium">{value}</span></div>;
}

function airportLabel(airport: Airport) {
  return `${airport.code} - ${airport.city}`;
}

function airportPriority(airport: Airport) {
  let priority = 0;
  priority += HUB_PRIORITY[airport.iata] ?? 0;
  if (MAJOR_AIRPORTS.has(airport.iata)) priority += 3000;
  if (/international/i.test(airport.name)) priority += 900;
  if (/airport/i.test(airport.name)) priority += 250;
  if (/regional|municipal|county/i.test(airport.name)) priority -= 250;
  return priority;
}

export function FlightTool() {
  const defaultDepartureAirport = AIRPORTS.find((a) => a.code === "SFO") ?? AIRPORTS[0];
  const defaultArrivalAirport = AIRPORTS.find((a) => a.code === "SYD") ?? AIRPORTS[1];
  const defaultAircraft = AIRCRAFT.find((a) => a.code === "B789") ?? AIRCRAFT[0];

  const [departureCode, setDepartureCode] = useState(defaultDepartureAirport.code);
  const [arrivalCode, setArrivalCode] = useState(defaultArrivalAirport.code);
  const [aircraftCode, setAircraftCode] = useState(defaultAircraft.code);
  const [timingMode, setTimingMode] = useState("duration");
  const [adjustTypicalWinds, setAdjustTypicalWinds] = useState(true);
  const [durationHours, setDurationHours] = useState(14);
  const [durationMinutes, setDurationMinutes] = useState(55);
  const [departureLocalInput, setDepartureLocalInput] = useState(toLocalInputValue(new Date(Date.parse("2026-06-10T06:00:00Z")), defaultDepartureAirport.tz));
  const [arrivalLocalInput, setArrivalLocalInput] = useState("2026-06-11T07:55");
  const [minutes, setMinutes] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const departureAirport = AIRPORTS.find((a) => a.code === departureCode) ?? AIRPORTS[0];
  const arrivalAirport = AIRPORTS.find((a) => a.code === arrivalCode) ?? AIRPORTS[1];
  const aircraft = AIRCRAFT.find((a) => a.code === aircraftCode) ?? AIRCRAFT[0];

  const departureUtcMs = useMemo(() => zonedDateTimeToUtc(departureLocalInput, departureAirport.tz), [departureLocalInput, departureAirport.tz]);
  const routeDistanceNm = useMemo(() => greatCircleDistanceNm(departureAirport, arrivalAirport), [departureAirport, arrivalAirport]);
  const routePoints = useMemo(() => Array.from({ length: 221 }, (_, i) => interpolateGreatCircle(departureAirport, arrivalAirport, i / 220)), [departureAirport, arrivalAirport]);
  const stillAirDurationMin = useMemo(() => estimatedDurationMinutes(routeDistanceNm, aircraft.typicalCruiseKts), [routeDistanceNm, aircraft.typicalCruiseKts]);
  const typicalAlongTrackWind = useMemo(() => typicalAlongTrackWindKts(routePoints, departureUtcMs), [routePoints, departureUtcMs]);
  const estimatedDurationMin = useMemo(() => adjustTypicalWinds ? estimatedDurationWithTypicalWindsMinutes(routeDistanceNm, aircraft.typicalCruiseKts, typicalAlongTrackWind) : stillAirDurationMin, [adjustTypicalWinds, routeDistanceNm, aircraft.typicalCruiseKts, typicalAlongTrackWind, stillAirDurationMin]);
  const manualDurationMin = Math.max(1, Number(durationHours) * 60 + Number(durationMinutes));
  const arrivalUtcFromManual = useMemo(() => departureUtcMs + manualDurationMin * 60000, [departureUtcMs, manualDurationMin]);

  useEffect(() => {
    if (timingMode === "arrival") return;
    const sourceArrivalUtc = timingMode === "estimate" ? departureUtcMs + estimatedDurationMin * 60000 : arrivalUtcFromManual;
    setArrivalLocalInput(toLocalInputValue(new Date(sourceArrivalUtc), arrivalAirport.tz));
  }, [timingMode, arrivalUtcFromManual, estimatedDurationMin, departureUtcMs, arrivalAirport.tz]);

  const arrivalUtcMs = useMemo(() => timingMode === "arrival" ? zonedDateTimeToUtc(arrivalLocalInput, arrivalAirport.tz) : arrivalUtcFromManual, [timingMode, arrivalLocalInput, arrivalAirport.tz, arrivalUtcFromManual]);
  const durationTotalMin = useMemo(() => timingMode === "arrival" ? Math.max(1, Math.round((arrivalUtcMs - departureUtcMs) / 60000)) : timingMode === "estimate" ? estimatedDurationMin : manualDurationMin, [timingMode, arrivalUtcMs, departureUtcMs, estimatedDurationMin, manualDurationMin]);
  const routeSegments = useMemo(() => splitWrappedPath(routePoints, projectLonLat, WIDTH), [routePoints]);
  const flownCount = Math.max(2, Math.floor(routePoints.length * (minutes / durationTotalMin)));
  const flownSegments = useMemo(() => splitWrappedPath(routePoints.slice(0, flownCount), projectLonLat, WIDTH), [routePoints, flownCount]);

  useEffect(() => { setMinutes((m) => Math.min(m, durationTotalMin)); }, [durationTotalMin]);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setMinutes((m) => (m >= durationTotalMin ? 0 : Math.min(durationTotalMin, m + 3))), 80);
    return () => clearInterval(id);
  }, [playing, durationTotalMin]);

  const progress = minutes / durationTotalMin;
  const nowUtc = new Date(departureUtcMs + minutes * 60000);
  const arrivalUtc = new Date(arrivalUtcMs);
  const subsolarLon = solarSubLon(nowUtc.getTime());
  const declinationDeg = solarDeclinationDegrees(nowUtc.getTime());
  const plane = routePoints[Math.min(routePoints.length - 1, Math.round(progress * (routePoints.length - 1)))];
  const planeLight = lightingLabel(plane.lat, plane.lon, subsolarLon, declinationDeg);

  const airportOptions = useMemo(
    () =>
      AIRPORTS.map((airport) => ({
        value: airport.code,
        label: `${airport.iata} — ${airport.city}, ${airport.country} (${airport.name})`,
        searchText:
          `${airport.iata} ${airport.icao} ${airport.city} ${airport.country} ${airport.name}`.toLowerCase(),
        code: airport.code,
        iata: airport.iata,
        icao: airport.icao,
        city: airport.city,
        name: airport.name,
        country: airport.country,
        priority: airportPriority(airport),
      })),
    [],
  );
  const aircraftOptions = useMemo(
    () =>
      AIRCRAFT.map((item) => ({
        value: item.code,
        label: `${item.label} (${item.code})`,
        searchText: `${item.code} ${item.label} ${item.aliases.join(" ")}`.toLowerCase(),
        code: item.code,
        name: item.label,
        aliases: item.aliases,
        priority: item.code === "B789" ? 120 : item.code === "A321" ? 110 : item.code === "B738" ? 100 : 0,
      })),
    [],
  );

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("from", departureCode);
    params.set("to", arrivalCode);
    params.set("aircraft", aircraftCode);
    params.set("depart", departureLocalInput);
    params.set("mode", timingMode);
    params.set("winds", adjustTypicalWinds ? "1" : "0");
    params.set("duration", `${String(durationHours).padStart(2, "0")}:${String(durationMinutes).padStart(2, "0")}`);
    if (timingMode === "arrival") params.set("arrive", arrivalLocalInput);
    return `https://flightvslight.com/tool?${params.toString()}`;
  }, [departureCode, arrivalCode, aircraftCode, departureLocalInput, timingMode, adjustTypicalWinds, durationHours, durationMinutes, arrivalLocalInput]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="space-y-4 rounded-[28px] border border-slate-800 bg-slate-900 p-5">
          <SearchableCombobox label="Departure airport" value={departureCode} onChange={setDepartureCode} options={airportOptions} placeholder="Search airport by code, city, or name" />
          <div className="flex justify-center">
            <button onClick={() => { setDepartureCode(arrivalCode); setArrivalCode(departureCode); }} className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 hover:bg-slate-700"><ArrowRightLeft size={18} /> Swap airports</button>
          </div>
          <SearchableCombobox label="Arrival airport" value={arrivalCode} onChange={setArrivalCode} options={airportOptions} placeholder="Search airport by code, city, or name" />
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-slate-300">Departure date and time ({departureAirport.code} local time)</span>
            <input type="datetime-local" value={departureLocalInput} onChange={(e) => setDepartureLocalInput(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none" />
          </label>
          <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-3">
            <div className="text-sm text-slate-300">Flight timing input</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <button onClick={() => setTimingMode("duration")} className={`rounded-2xl border px-3 py-2 ${timingMode==="duration"?"border-slate-500 bg-slate-700":"border-slate-700 bg-slate-800 text-slate-300"}`}>Enter duration</button>
              <button onClick={() => setTimingMode("arrival")} className={`rounded-2xl border px-3 py-2 ${timingMode==="arrival"?"border-slate-500 bg-slate-700":"border-slate-700 bg-slate-800 text-slate-300"}`}>Enter arrival time</button>
              <button onClick={() => setTimingMode("estimate")} className={`rounded-2xl border px-3 py-2 ${timingMode==="estimate"?"border-slate-500 bg-slate-700":"border-slate-700 bg-slate-800 text-slate-300"}`}>Estimate from speed</button>
            </div>
            {timingMode === "duration" ? <div className="grid grid-cols-2 gap-3"><NumberField label="Duration hours" value={durationHours} onChange={(e)=>setDurationHours(Number(e.target.value))} min={0} max={30} /><NumberField label="Duration minutes" value={durationMinutes} onChange={(e)=>setDurationMinutes(Number(e.target.value))} min={0} max={59} /></div> : timingMode === "arrival" ? <label className="flex flex-col gap-2 text-sm"><span className="text-slate-300">Arrival date and time ({arrivalAirport.code} local time)</span><input type="datetime-local" value={arrivalLocalInput} onChange={(e)=>setArrivalLocalInput(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none" /></label> : <div className="space-y-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-4 text-sm text-slate-300"><div><span className="text-slate-400">Selected aircraft speed:</span> <span className="text-white">{aircraft.typicalCruiseKts} kt</span></div><div><span className="text-slate-400">Great-circle distance:</span> <span className="text-white">{Math.round(routeDistanceNm).toLocaleString()} nm</span></div><label className="flex items-center gap-3"><input type="checkbox" checked={adjustTypicalWinds} onChange={(e)=>setAdjustTypicalWinds(e.target.checked)} className="h-4 w-4" /><span>Adjust for typical winds aloft</span></label><div><span className="text-slate-400">Typical along-track wind:</span> <span className="text-white">{typicalAlongTrackWind >= 0 ? "+" : ""}{Math.round(typicalAlongTrackWind)} kt</span></div><div><span className="text-slate-400">Estimated block time:</span> <span className="text-white">{formatDuration(estimatedDurationMin)}</span></div></div>}
          </div>
          <SearchableCombobox label="Aircraft type" value={aircraftCode} onChange={setAircraftCode} options={aircraftOptions} placeholder="Search aircraft by code or type" />
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900 p-4 shadow-2xl">
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full rounded-[22px] bg-slate-950">
              <OceanAndLighting subsolarLon={subsolarLon} declinationDeg={declinationDeg} />
              <LandMasses />
              <Route routeSegments={routeSegments} flownSegments={flownSegments} />
              <AircraftMarker routePoints={routePoints} progress={progress} />
            </svg>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_370px]">
            <div className="space-y-4 rounded-[28px] border border-slate-800 bg-slate-900 p-5">
              <input type="range" min={0} max={durationTotalMin} value={minutes} onChange={(e)=>setMinutes(Number(e.target.value))} className="w-full" />
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setPlaying((p) => !p)} className="flex items-center gap-2 rounded-2xl bg-slate-700 px-4 py-2 hover:bg-slate-600">{playing ? <Pause size={18} /> : <Play size={18} />}{playing ? "Pause" : "Play"}</button>
                <button onClick={() => { setMinutes(0); setPlaying(false); }} className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 hover:bg-slate-700"><RotateCcw size={18} /> Reset</button>
                <button onClick={() => setMinutes(Math.round(durationTotalMin * 0.5))} className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 hover:bg-slate-700"><Plane size={18} /> Mid-flight</button>
              </div>
              <div className="text-sm leading-6 text-slate-300">Drag the slider or press play to follow the aircraft while the day/night boundary moves with Earth’s rotation.</div>
              <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                <div className="text-sm text-slate-300">Share this exact route setup</div>
                <div className="break-all rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300">{shareUrl}</div>
                <button onClick={async()=>{try{await navigator.clipboard.writeText(shareUrl);setShareCopied(true);setTimeout(()=>setShareCopied(false),1600);}catch{}}} className="rounded-2xl bg-sky-500 px-4 py-2 font-medium text-slate-950 hover:bg-sky-400">{shareCopied ? "Link copied" : "Copy share link"}</button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <Info label="Route" value={`${airportLabel(departureAirport)} → ${airportLabel(arrivalAirport)}`} />
              <Info label="Aircraft" value={aircraft.label} />
              <Info label="Route distance" value={`${Math.round(routeDistanceNm).toLocaleString()} nm`} />
              <Info label="Calculated total duration" value={formatDuration(durationTotalMin)} />
              <Info label="Departure local" value={formatTime(new Date(departureUtcMs), departureAirport.tz)} />
              <Info label="Arrival local" value={formatTime(arrivalUtc, arrivalAirport.tz)} />
              <Info label="Aircraft lighting" value={planeLight} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
