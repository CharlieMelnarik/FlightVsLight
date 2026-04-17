import type { MetadataRoute } from "next";

const siteUrl = "https://flightvslight.com";

const routes = ["/", "/tool", "/faq", "/about", "/privacy", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "/" || route === "/tool" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/tool" ? 0.9 : 0.5,
  }));
}
