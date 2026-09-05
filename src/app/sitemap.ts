import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://pathpilot.ai",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
