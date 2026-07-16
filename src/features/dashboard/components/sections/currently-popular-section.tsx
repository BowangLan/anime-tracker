import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AiringAnime } from "@/lib/anilist";
import { deriveAiring } from "@/lib/schedule";
import { SectionHeader } from "./section-header";

export function CurrentlyPopularSection({ anime, now }: { anime: AiringAnime[]; now: number }) {
  const popular = anime.slice(0, 7).map((show) => ({ anime: show, airing: deriveAiring(show, now) }));

  return (
    <section className="flex min-h-0 min-w-0 flex-col" aria-labelledby="currently-popular-heading">
      <SectionHeader id="currently-popular-heading" title="Popular this season" description="By AniList popularity" />
      <ol className="border-t border-[var(--fr-hairline-soft)] xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
        {popular.map(({ anime: show, airing }, index) => (
          <li key={show.id} className="border-b border-[var(--fr-hairline-soft)]">
            <Link href={`/anime/${show.id}`} className="group grid grid-cols-[22px_46px_minmax(0,1fr)_16px] items-center gap-3 py-3 outline-none transition hover:bg-[var(--fr-surface-1)] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--fr-accent-blue)]">
              <span className="text-center text-[12px] font-normal leading-[1.2] tabular-nums tracking-[-0.12px] text-[var(--fr-ink-muted)]">{String(index + 1).padStart(2, "0")}</span>
              <span className="relative block h-[61px] w-[46px] overflow-hidden rounded-[6px] bg-[var(--fr-surface-1)]">
                {show.coverImage && <Image src={show.coverImage} alt="" fill loading={index < 5 ? "eager" : "lazy"} sizes="46px" className="object-cover transition duration-300 group-hover:scale-105" />}
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-[13px] font-medium leading-[1.2] tracking-[-0.13px] text-[var(--fr-ink)]">{show.title}</span>
                <span className="mt-2 block truncate text-[12px] font-normal leading-[1.2] tracking-[-0.12px] text-[var(--fr-ink-muted)]">Ep {airing.latestAired || "—"}{show.totalEpisodes ? ` of ${show.totalEpisodes}` : ""} · {show.studio}</span>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--fr-ink-muted)] opacity-0 transition group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
