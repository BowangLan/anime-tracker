import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import type { AnimeDetail } from "@/lib/anilist";
import { FollowButton } from "./follow-button";
import { compact, label, trailerUrl } from "./format";

export function DetailHero({
  anime,
  accent,
  title,
  subtitle,
}: {
  anime: AnimeDetail;
  accent: string;
  title: string;
  subtitle: string | null;
}) {
  return (
    <>
      <header className="absolute inset-x-0 top-0 z-30 mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3.5 py-2 text-[12px] font-medium text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--detail-accent)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Weekly board
        </Link>
        <a
          href={anime.siteUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/65 transition hover:text-white"
        >
          View on AniList <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </header>

      <section className="relative min-h-[590px] border-b border-white/10 lg:min-h-[640px]">
        <div className="absolute inset-0">
          {anime.bannerImage ? (
            <Image src={anime.bannerImage} alt="" fill priority sizes="100vw" className="object-cover opacity-55" />
          ) : (
            <Image src={anime.coverImage.extraLarge} alt="" fill priority sizes="100vw" className="scale-110 object-cover opacity-35 blur-2xl" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,9,.98)_0%,rgba(9,9,9,.78)_43%,rgba(9,9,9,.3)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#090909_0%,transparent_55%,rgba(0,0,0,.38)_100%)]" />
          <div
            className="absolute -left-40 bottom-0 h-[520px] w-[620px] opacity-30 blur-[110px]"
            style={{ background: accent }}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[590px] max-w-[1320px] items-end px-5 pb-9 pt-24 sm:px-8 lg:min-h-[640px] lg:px-10 lg:pb-11">
          <div className="grid w-full items-end gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-9">
            <div className="relative mx-auto aspect-[2/3] w-[155px] overflow-hidden rounded-[16px] border border-white/15 bg-white/5 shadow-2xl shadow-black/60 sm:w-[180px] lg:mx-0 lg:w-[200px]">
              <Image src={anime.coverImage.extraLarge} alt={`${title} cover`} fill priority sizes="250px" className="object-cover" />
            </div>

            <div className="max-w-5xl">
              <div className="mb-3.5 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/65">
                <span className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 backdrop-blur">{label(anime.format)}</span>
                <span>{label(anime.status)}</span>
                {anime.seasonYear && <><span className="text-white/25">/</span><span>{label(anime.season)} {anime.seasonYear}</span></>}
              </div>
              <h1 className="max-w-[960px] text-balance text-[clamp(2.5rem,6.2vw,6rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-white">
                {title}
              </h1>
              {subtitle && <p className="mt-3 text-[13px] text-white/55 sm:text-[15px]">{subtitle}</p>}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <FollowButton id={anime.id} />
                {anime.trailer && (
                  <a
                    href={trailerUrl(anime.trailer)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 text-[13px] font-medium text-white backdrop-blur transition hover:bg-white/10"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Watch trailer
                  </a>
                )}
              </div>

              <div className="mt-7 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-white/10 bg-white/10 sm:grid-cols-4">
                <HeroStat value={anime.averageScore ? `${anime.averageScore}%` : "—"} label="AniList score" />
                <HeroStat value={anime.episodes ?? "—"} label="Episodes" />
                <HeroStat value={anime.duration ? `${anime.duration}m` : "—"} label="Runtime" />
                <HeroStat value={compact(anime.popularity)} label="Members" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroStat({ value, label: caption }: { value: string | number; label: string }) {
  return (
    <div className="bg-black/35 px-3.5 py-3 backdrop-blur">
      <div className="text-[17px] font-semibold tracking-[-0.035em]">{value}</div>
      <div className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-white/42">{caption}</div>
    </div>
  );
}
