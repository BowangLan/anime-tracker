import { fetchFavoriteAnime } from "@/lib/anilist";

export async function GET(request: Request) {
  const rawIds = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = rawIds.split(",").filter(Boolean).map(Number);
  if (ids.length > 50 || ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    return Response.json({ error: "Provide up to 50 valid anime ids." }, { status: 400 });
  }

  try {
    return Response.json({ anime: await fetchFavoriteAnime(ids) });
  } catch (error) {
    console.error("AniList favorites request failed", error);
    return Response.json({ error: "Your favorites could not be loaded right now." }, { status: 502 });
  }
}
