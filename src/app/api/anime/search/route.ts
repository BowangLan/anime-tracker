import { searchAnime } from "@/lib/anilist";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (!query) return Response.json({ results: [] });
  if (query.length > 100) {
    return Response.json({ error: "Search queries must be 100 characters or fewer." }, { status: 400 });
  }

  try {
    return Response.json({ results: await searchAnime(query) });
  } catch (error) {
    console.error("AniList search failed", error);
    return Response.json(
      { error: "AniList search is unavailable right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
