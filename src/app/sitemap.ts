import type { MetadataRoute } from "next";
import { fetchAiringAnime } from "@/lib/anilist";
import { animePath, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL.href, changeFrequency: "daily", priority: 1 },
    {
      url: new URL("/discover", SITE_URL).href,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: new URL("/schedule", SITE_URL).href,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const anime = await fetchAiringAnime().catch(() => []);
  const animeEntries: MetadataRoute.Sitemap = anime.map((show) => ({
    url: new URL(animePath(show.id, show.title), SITE_URL).href,
    changeFrequency: "weekly",
    priority: 0.8,
    images: show.coverImage ? [show.coverImage] : undefined,
  }));

  return [...staticEntries, ...animeEntries];
}
