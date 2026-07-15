import type { AnimeDetail } from "@/lib/anilist";
import { SectionHeading } from "./section-heading";

export function Themes({ anime }: { anime: AnimeDetail }) {
  if (anime.tags.length === 0) return null;

  return (
    <section aria-labelledby="themes-heading">
      <SectionHeading id="themes-heading" eyebrow="AniList community tags" title="Themes & motifs" />
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {anime.tags.filter((tag) => !tag.isMediaSpoiler).slice(0, 16).map((tag) => (
          <div key={tag.id} className="flex items-center gap-4 rounded-[12px] border border-white/8 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium">{tag.name}</span>
              <span className="mt-0.5 block truncate text-[11px] text-white/38">{tag.category}</span>
            </span>
            <span className="text-[12px] tabular-nums text-white/45">{tag.rank}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
