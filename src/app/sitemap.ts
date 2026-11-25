import type { MetadataRoute } from "next";

/** AUD-13: só a landing é pública — é a única URL que faz sentido num sitemap. */
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://manutflow.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
