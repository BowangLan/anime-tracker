import { getAnimeBySourceId, searchAnime } from "@/lib/aniwaves/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const sourceId = parseInteger(params.get("sourceId"));

  if (sourceId != null) {
    const result = getAnimeBySourceId(sourceId);
    return result
      ? Response.json({ result }, { headers: cacheHeaders() })
      : Response.json({ error: "Aniwaves title not found." }, { status: 404 });
  }

  const query = params.get("q")?.trim() ?? "";
  if (!query) return Response.json({ error: "Provide q or sourceId." }, { status: 400 });
  if (query.length > 100) return Response.json({ error: "q must be 100 characters or fewer." }, { status: 400 });

  const year = parseInteger(params.get("year"));
  const limit = Math.min(parseInteger(params.get("limit")) ?? 20, 50);
  return Response.json(
    { results: searchAnime(query, { year, limit }) },
    { headers: cacheHeaders() },
  );
}

function parseInteger(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function cacheHeaders(): HeadersInit {
  return { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" };
}
