import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";
import type { AnimeDetail } from "@/lib/anilist";
import { FollowButton } from "./follow-button";
import { compact, label, trailerUrl } from "../lib/format";

export function DetailHero({
  anime,
  title,
  subtitle,
}: {
  anime: AnimeDetail;
  title: string;
  subtitle: string | null;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[var(--fr-surface-1)] flex-none">
      <div className="absolute inset-0">
        {anime.bannerImage ? (
          <Image src={anime.bannerImage} alt="" fill priority sizes="(min-width: 1024px) 1180px, 100vw" className="object-cover opacity-20" />
        ) : (
          <Image src={anime.coverImage.extraLarge} alt="" fill priority sizes="100vw" className="scale-110 object-cover opacity-15 blur-2xl" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--fr-surface-1)_0%,rgba(20,20,20,.9)_52%,rgba(20,20,20,.62)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--fr-surface-1),transparent_70%)]" />
      </div>

      <div className="relative mx-auto grid max-w-[1180px] gap-5 px-5 py-6 sm:grid-cols-[128px_minmax(0,1fr)] sm:px-8 lg:grid-cols-[144px_minmax(0,1fr)_auto] lg:items-end lg:px-8 lg:py-8">
        <div className="relative mx-auto aspect-[2/3] w-28 overflow-hidden rounded-[12px] border border-white/12 bg-white/5 shadow-xl shadow-black/30 sm:mx-0 sm:w-32 lg:w-36">
          <Image src={anime.coverImage.extraLarge} alt={`${title} cover`} fill priority sizes="144px" className="object-cover" />
        </div>

        <div className="min-w-0 h-full flex flex-col gap-2.5">
          <div>
            <span className="text-2xl sm:text-3xl line-clamp-2 tracking-tight font-medium leading-tight text-foreground">{title}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/52">
            <span>{label(anime.format)}</span><span className="text-white/20">·</span><span>{label(anime.status)}</span>
            {anime.seasonYear && <><span className="text-white/20">·</span><span>{label(anime.season)} {anime.seasonYear}</span></>}
          </div>
          {subtitle && <p className="truncate text-xs font-medium text-white/60">{subtitle}</p>}
          <div className="flex-1"></div>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <FollowButton id={anime.id} />
            {anime.trailer && <a href={trailerUrl(anime.trailer)} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-white/15 bg-black/15 px-3.5 text-[12px] font-medium text-white transition hover:bg-white/8"><Play className="h-3.5 w-3.5 fill-current" /> Trailer</a>}
            <a href={anime.siteUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 px-2 text-[12px] font-medium text-white/48 transition hover:text-white">AniList <ArrowUpRight className="h-3.5 w-3.5" /></a>
          </div>
        </div>

        <dl className="col-span-full grid grid-cols-2 divide-x divide-y divide-white/8 overflow-hidden rounded-[12px] border border-white/8 bg-black/15 sm:col-start-2 sm:grid-cols-4 lg:col-span-1 lg:col-start-auto lg:w-[292px] lg:divide-y-0">
          <HeroStat value={anime.averageScore ? `${anime.averageScore}%` : "—"} label="Score" />
          <HeroStat value={anime.episodes ?? "—"} label="Episodes" />
          <HeroStat value={anime.duration ? `${anime.duration}m` : "—"} label="Runtime" />
          <HeroStat value={compact(anime.popularity)} label="Members" />
        </dl>
      </div>
    </section>
  );
}

function HeroStat({ value, label: caption }: { value: string | number; label: string }) {
  return (
    <div className="px-3 py-3">
      <dt className="text-[9px] uppercase tracking-[0.08em] text-white/35">{caption}</dt>
      <dd className="mt-1 text-[14px] font-semibold tracking-[-0.025em]">{value}</dd>
    </div>
  );
}
