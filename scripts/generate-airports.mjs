import { readFileSync, writeFileSync } from "node:fs";

const inputPath = process.argv[2] ?? "/tmp/flightvslight-airports.dat";
const outputPath = process.argv[3] ?? "data/airports.ts";
const routesPath = process.argv[4] ?? "/tmp/flightvslight-routes.dat";

function parseCsvLine(line) {
  const fields = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      fields.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  fields.push(value);
  return fields.map((field) => (field === "\\N" ? "" : field.trim()));
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isUsefulTravelerAirport(row) {
  const [
    ,
    name,
    city,
    ,
    iata,
    icao,
    lat,
    lon,
    ,
    ,
    ,
    timezone,
    type,
  ] = row;

  if (type !== "airport") return false;
  if (!/^[A-Z0-9]{3}$/.test(iata)) return false;
  if (icao && !/^[A-Z0-9]{4}$/.test(icao)) return false;
  if (!name || !city || !timezone || !timezone.includes("/")) return false;
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return false;

  const haystack = `${name} ${city}`.toLowerCase();
  const militaryOnlyPatterns = [
    /\bair base\b/,
    /\bair force base\b/,
    /\bafb\b/,
    /\barmy air(?:field| field)\b/,
    /\bmilitary\b/,
    /\bnaval air\b/,
    /\bnas\b/,
    /\braf\b/,
  ];
  if (militaryOnlyPatterns.some((pattern) => pattern.test(haystack))) return false;

  const privatePatterns = [
    /\bheliport\b/,
    /\bhelipad\b/,
    /\bprivate\b/,
    /\bprivate strip\b/,
    /\branch airport\b/,
    /\bfarm airport\b/,
  ];
  if (privatePatterns.some((pattern) => pattern.test(haystack))) return false;

  return true;
}

function readRouteAirportCodes(path) {
  try {
    const codes = new Set();
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      if (!line) continue;
      const fields = parseCsvLine(line);
      const source = fields[2];
      const destination = fields[4];
      if (/^[A-Z0-9]{3}$/.test(source)) codes.add(source);
      if (/^[A-Z0-9]{3}$/.test(destination)) codes.add(destination);
    }
    return codes;
  } catch {
    return null;
  }
}

const routedAirportCodes = readRouteAirportCodes(routesPath);

const rows = readFileSync(inputPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map(parseCsvLine)
  .filter(isUsefulTravelerAirport)
  .filter((row) => !routedAirportCodes || routedAirportCodes.has(row[4]));

const byIata = new Map();

for (const row of rows) {
  const [, name, city, country, iata, icao, lat, lon, , , , timezone] = row;
  const airport = {
    code: iata,
    iata,
    icao,
    name: cleanText(name),
    city: cleanText(city),
    country: cleanText(country),
    lat: Number(Number(lat).toFixed(6)),
    lon: Number(Number(lon).toFixed(6)),
    tz: timezone,
  };

  const existing = byIata.get(iata);
  if (!existing || (airport.icao && !existing.icao)) {
    byIata.set(iata, airport);
  }
}

const airports = [...byIata.values()].sort((a, b) => {
  const country = a.country.localeCompare(b.country);
  if (country !== 0) return country;
  const city = a.city.localeCompare(b.city);
  if (city !== 0) return city;
  return a.name.localeCompare(b.name);
});

const output = `// Generated from OpenFlights airports.dat and routes.dat.
// Airport source: https://github.com/jpatokal/openflights/blob/master/data/airports.dat
// Route source: https://github.com/jpatokal/openflights/blob/master/data/routes.dat
// Filtered to public-facing airport records with IATA codes, IANA time zones,
// and matching OpenFlights route records where route data is available.
export type Airport = {
  code: string;
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  tz: string;
};

export const AIRPORTS: Airport[] = ${JSON.stringify(airports, null, 2)};
`;

writeFileSync(outputPath, output);
console.log(`Wrote ${airports.length} airports to ${outputPath}`);
