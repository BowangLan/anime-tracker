import type { AnimeDetail } from "@/lib/anilist";
import { countryName, dateRange, label } from "./format";

export function FactPanel({ anime, mainStudio }: { anime: AnimeDetail; mainStudio?: string }) {
  const country = anime.countryOfOrigin ? countryName(anime.countryOfOrigin) : null;
  const facts = [
    ["Format", label(anime.format)], ["Episodes", anime.episodes], ["Duration", anime.duration ? `${anime.duration} minutes` : null],
    ["Status", label(anime.status)], ["Aired", dateRange(anime.startDate, anime.endDate)], ["Season", anime.seasonYear ? `${label(anime.season)} ${anime.seasonYear}` : null],
    ["Studio", mainStudio], ["Source", label(anime.source)], ["Origin", country], ["Licensed", anime.isLicensed ? "Yes" : "No"],
    ["Mean score", anime.meanScore ? `${anime.meanScore}%` : null], ["Favourites", anime.favourites.toLocaleString()],
  ].filter((fact) => fact[1] != null);

  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.025] p-5">
      <p className="fr-eyebrow">At a glance</p>
      <dl className="mt-4 divide-y divide-white/8">
        {facts.map(([term, value]) => (
          <div key={String(term)} className="flex justify-between gap-5 py-2.5 text-[12px]">
            <dt className="text-white/38">{term}</dt>
            <dd className="text-right text-white/76">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-white/8 pt-4 text-[10px] leading-relaxed text-white/30">
        AniList #{anime.id}{anime.idMal ? ` · MyAnimeList #${anime.idMal}` : ""}<br />
        Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(anime.updatedAt * 1000)}
      </div>
    </div>
  );
}
