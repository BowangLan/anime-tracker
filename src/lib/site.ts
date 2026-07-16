export const SITE_NAME = "Anime Tracker";
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    "https://anime-tracker-phi-two.vercel.app",
);

export function animeSlug(id: number, title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/g, "");

  return slug ? `${id}-${slug}` : String(id);
}

export function animePath(id: number, title: string): string {
  return `/anime/${animeSlug(id, title)}`;
}
