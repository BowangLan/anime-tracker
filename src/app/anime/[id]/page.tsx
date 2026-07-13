import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Play,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { FollowButton } from "@/components/follow-button";
import { fetchAnimeDetail, plainText, type AniDate, type AnimeDetail } from "@/lib/anilist";

export const revalidate = 3600;

type DetailPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const id = parseId((await params).id);
  if (id == null) return { title: "Anime not found — Airing" };
  const anime = await fetchAnimeDetail(id).catch(() => null);
  if (!anime) return { title: "Anime not found — Airing" };
  const title = anime.title.english || anime.title.userPreferred;
  return {
    title: `${title} — Airing`,
    description: plainText(anime.description).slice(0, 155),
    openGraph: {
      title,
      description: plainText(anime.description).slice(0, 155),
      images: anime.bannerImage ? [anime.bannerImage] : [anime.coverImage.extraLarge],
    },
  };
}

export default async function AnimeDetailPage({ params }: DetailPageProps) {
  const id = parseId((await params).id);
  if (id == null) notFound();
  const anime = await fetchAnimeDetail(id).catch(() => null);
  if (!anime) notFound();

  const accent = anime.coverImage.color || "#6a4cf5";
  const title = anime.title.english || anime.title.userPreferred;
  const subtitle = anime.title.romaji !== title ? anime.title.romaji : anime.title.native;
  const mainStudio = anime.studios.edges.find((studio) => studio.isMain)?.node;
  const detailStyle = { "--detail-accent": accent } as CSSProperties;

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--fr-canvas)]" style={detailStyle}>
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

      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:py-18">
        <div className="min-w-0 space-y-14">
          <section aria-labelledby="story-heading">
            <SectionHeading id="story-heading" eyebrow="The story" title="Synopsis" />
            <p className="mt-5 max-w-3xl text-pretty text-[clamp(1rem,1.5vw,1.3rem)] leading-[1.55] tracking-[-0.018em] text-white/75">
              {plainText(anime.description) || "No synopsis is available yet."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {anime.genres.map((genre) => <span key={genre} className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-white/65">{genre}</span>)}
            </div>
          </section>

          {anime.nextAiringEpisode && <NextEpisode episode={anime.nextAiringEpisode.episode} airingAt={anime.nextAiringEpisode.airingAt} />}

          <EpisodeGuide anime={anime} />

          {anime.characters.edges.length > 0 && (
            <section aria-labelledby="cast-heading">
              <SectionHeading id="cast-heading" eyebrow={`${anime.characters.pageInfo.total ?? anime.characters.edges.length} credited`} title="Characters & voices" />
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {anime.characters.edges.slice(0, 18).map((edge) => {
                  const actor = edge.voiceActors[0];
                  return (
                    <div key={edge.id} className="group flex min-w-0 items-center gap-3 rounded-[14px] border border-white/8 bg-white/[0.025] p-2 transition hover:border-white/15 hover:bg-white/[0.045]">
                      <a href={edge.node.siteUrl} target="_blank" rel="noreferrer" className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[9px] bg-white/5">
                        <Image src={edge.node.image.large} alt="" fill sizes="48px" className="object-cover" />
                      </a>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{edge.node.name.userPreferred}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-white/38">{label(edge.role)}</p>
                      </div>
                      {actor && (
                        <a href={actor.siteUrl} target="_blank" rel="noreferrer" title={`${actor.name.userPreferred} · ${actor.languageV2 ?? "Voice actor"}`} className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 opacity-75 transition group-hover:opacity-100">
                          <Image src={actor.image.large} alt={actor.name.userPreferred} fill sizes="40px" className="object-cover" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {anime.staff.edges.length > 0 && (
            <section aria-labelledby="staff-heading">
              <SectionHeading id="staff-heading" eyebrow={`${anime.staff.pageInfo.total ?? anime.staff.edges.length} credited`} title="Production staff" />
              <div className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {anime.staff.edges.slice(0, 20).map((edge) => (
                  <a key={edge.id} href={edge.node.siteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 border-b border-white/8 py-3 transition hover:border-white/20">
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white/5">
                      <Image src={edge.node.image.large} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">{edge.node.name.userPreferred}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-white/42">{edge.role}</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {anime.tags.length > 0 && (
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
          )}

          <Community anime={anime} />

          {anime.relations.edges.length > 0 && (
            <MediaLinks title="Related titles" eyebrow="Series map" items={anime.relations.edges.map((edge) => ({ id: edge.node.id, href: edge.node.type === "ANIME" ? `/anime/${edge.node.id}` : edge.node.siteUrl, title: edge.node.title.userPreferred, meta: `${label(edge.relationType)} · ${label(edge.node.format)}` }))} />
          )}

          {anime.recommendations.nodes.some((item) => item.mediaRecommendation) && (
            <MediaLinks title="More like this" eyebrow="AniList recommendations" items={anime.recommendations.nodes.filter((item) => item.mediaRecommendation).slice(0, 12).map((item) => ({ id: item.mediaRecommendation!.id, href: item.mediaRecommendation!.type === "ANIME" ? `/anime/${item.mediaRecommendation!.id}` : item.mediaRecommendation!.siteUrl, title: item.mediaRecommendation!.title.userPreferred, meta: `${label(item.mediaRecommendation!.format)} · +${item.rating}` }))} />
          )}

          {anime.reviews.nodes.length > 0 && (
            <section aria-labelledby="reviews-heading">
              <SectionHeading id="reviews-heading" eyebrow={`${anime.reviews.pageInfo.total ?? anime.reviews.nodes.length} community reviews`} title="What viewers say" />
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {anime.reviews.nodes.slice(0, 4).map((review) => (
                  <a key={review.id} href={review.siteUrl} target="_blank" rel="noreferrer" className="rounded-[16px] border border-white/8 bg-white/[0.025] p-5 transition hover:border-white/18">
                    <p className="text-[15px] font-medium leading-snug">{review.summary}</p>
                    <div className="mt-6 flex items-center justify-between text-[11px] text-white/42">
                      <span>@{review.user.name}</span><span>{review.rating}/{review.ratingAmount} helpful</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-6 lg:self-start">
          <FactPanel anime={anime} mainStudio={mainStudio?.name} />
          {anime.rankings.length > 0 && (
            <div>
              <p className="fr-eyebrow">Rankings</p>
              <div className="mt-3 space-y-2">
                {anime.rankings.slice(0, 5).map((ranking) => (
                  <div key={ranking.id} className="flex items-center gap-3 rounded-[12px] border border-white/8 p-3">
                    <Trophy className="h-4 w-4 text-[var(--detail-accent)]" />
                    <p className="text-[12px]"><strong className="mr-1 text-white">#{ranking.rank}</strong><span className="text-white/48">{ranking.context}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {anime.externalLinks.filter((link) => !link.isDisabled).length > 0 && (
            <div>
              <p className="fr-eyebrow">Official & streaming</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {anime.externalLinks.filter((link) => !link.isDisabled).map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[10px] border border-white/8 px-3 py-2.5 text-[11px] text-white/62 transition hover:border-white/20 hover:text-white">
                    <span className="truncate">{link.site}</span><ArrowUpRight className="h-3 w-3 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function HeroStat({ value, label: caption }: { value: string | number; label: string }) {
  return <div className="bg-black/35 px-3.5 py-3 backdrop-blur"><div className="text-[17px] font-semibold tracking-[-0.035em]">{value}</div><div className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-white/42">{caption}</div></div>;
}

function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return <div><p className="fr-eyebrow">{eyebrow}</p><h2 id={id} className="mt-1.5 text-[clamp(1.65rem,3vw,2.5rem)] font-semibold leading-none tracking-[-0.045em]">{title}</h2></div>;
}

function NextEpisode({ episode, airingAt }: { episode: number; airingAt: number }) {
  return (
    <section className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[var(--detail-accent)] p-5 text-black sm:p-6">
      <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] opacity-55">Next broadcast</p><h2 className="mt-1.5 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.055em]">Episode {episode}</h2></div>
        <div className="text-left sm:text-right"><p className="text-[13px] font-semibold">{new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(airingAt * 1000)}</p><p className="mt-1 text-[11px] opacity-60">{new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(airingAt * 1000)}</p></div>
      </div>
    </section>
  );
}

interface EpisodeRow {
  number: number;
  title: string | null;
  url: string | null;
  site: string | null;
  airingAt: number | null;
  isUpcoming: boolean;
}

function EpisodeGuide({ anime }: { anime: AnimeDetail }) {
  const episodes = buildEpisodeRows(anime);
  if (episodes.length === 0) return null;

  return (
    <section aria-labelledby="episodes-heading">
      <SectionHeading
        id="episodes-heading"
        eyebrow={`${episodes.length}${anime.episodes && episodes.length < anime.episodes ? ` of ${anime.episodes}` : ""} episodes`}
        title="Episode guide"
      />
      <div className="mt-6 overflow-hidden rounded-[14px] border border-white/10">
        {episodes.map((episode) => {
          const future = episode.isUpcoming;
          const content = (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-[11px] font-medium tabular-nums text-white/60">
                {String(episode.number).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-white/85">
                  {episode.title || `Episode ${episode.number}`}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-white/38">
                  {episode.airingAt && <span>{future ? "Airs" : "Aired"} {episodeDate(episode.airingAt)}</span>}
                  {episode.site && <span>{episode.site}</span>}
                </span>
              </span>
              {episode.url ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1.5 text-[10px] font-medium text-white/55 transition group-hover:border-white/20 group-hover:text-white">
                  <Play className="h-2.5 w-2.5 fill-current" /> Watch
                </span>
              ) : future ? (
                <span className="shrink-0 text-[10px] font-medium text-[var(--detail-accent)]">Upcoming</span>
              ) : null}
            </>
          );

          const rowClass = "group flex min-h-15 items-center gap-3 border-b border-white/8 px-3.5 py-3 transition last:border-b-0 hover:bg-white/[0.035] sm:px-4";
          return episode.url ? (
            <a key={episode.number} href={episode.url} target="_blank" rel="noreferrer" className={rowClass}>
              {content}
            </a>
          ) : (
            <div key={episode.number} className={rowClass}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}

function buildEpisodeRows(anime: AnimeDetail): EpisodeRow[] {
  const rows = new Map<number, EpisodeRow>();

  for (const stream of anime.streamingEpisodes) {
    const match = stream.title.match(/^Episode\s+(\d+)(?:\s*[-–—:]\s*)?(.*)$/i);
    if (!match) continue;
    const number = Number(match[1]);
    rows.set(number, {
      number,
      title: match[2]?.trim() || null,
      url: stream.url,
      site: stream.site,
      airingAt: null,
      isUpcoming: false,
    });
  }

  for (const scheduled of anime.airingSchedule.nodes) {
    const existing = rows.get(scheduled.episode);
    rows.set(scheduled.episode, {
      number: scheduled.episode,
      title: existing?.title ?? null,
      url: existing?.url ?? null,
      site: existing?.site ?? null,
      airingAt: scheduled.airingAt,
      isUpcoming: scheduled.timeUntilAiring > 0,
    });
  }

  if (anime.episodes && anime.episodes <= 100) {
    for (let number = 1; number <= anime.episodes; number++) {
      if (!rows.has(number)) rows.set(number, { number, title: null, url: null, site: null, airingAt: null, isUpcoming: false });
    }
  }

  return [...rows.values()].sort((a, b) => a.number - b.number);
}

function episodeDate(airingAt: number): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(airingAt * 1000);
}

function FactPanel({ anime, mainStudio }: { anime: AnimeDetail; mainStudio?: string }) {
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
        {facts.map(([term, value]) => <div key={String(term)} className="flex justify-between gap-5 py-2.5 text-[12px]"><dt className="text-white/38">{term}</dt><dd className="text-right text-white/76">{value}</dd></div>)}
      </dl>
      <div className="mt-4 border-t border-white/8 pt-4 text-[10px] leading-relaxed text-white/30">AniList #{anime.id}{anime.idMal ? ` · MyAnimeList #${anime.idMal}` : ""}<br />Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(anime.updatedAt * 1000)}</div>
    </div>
  );
}

function Community({ anime }: { anime: AnimeDetail }) {
  const scores = anime.stats?.scoreDistribution ?? [];
  const statuses = anime.stats?.statusDistribution ?? [];
  if (scores.length === 0 && statuses.length === 0 && anime.trends.nodes.length === 0) return null;
  const maxScore = Math.max(1, ...scores.map((score) => score.amount));
  const maxStatus = Math.max(1, ...statuses.map((status) => status.amount));
  return (
    <section aria-labelledby="community-heading">
      <SectionHeading id="community-heading" eyebrow={`${compact(anime.popularity)} members`} title="Community pulse" />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {scores.length > 0 && <div className="rounded-[16px] border border-white/8 p-5"><div className="flex items-center gap-2 text-[12px] font-medium"><Star className="h-4 w-4" /> Score spread</div><div className="mt-6 flex h-32 items-end gap-1">{scores.map((score) => <div key={score.score} className="group flex h-full flex-1 flex-col justify-end gap-2"><div title={`${score.score}: ${score.amount.toLocaleString()} votes`} className="min-h-px rounded-t-sm bg-[var(--detail-accent)] opacity-75 transition group-hover:opacity-100" style={{ height: `${(score.amount / maxScore) * 100}%` }} /><span className="text-center text-[9px] text-white/30">{score.score}</span></div>)}</div></div>}
        {statuses.length > 0 && <div className="rounded-[16px] border border-white/8 p-5"><div className="flex items-center gap-2 text-[12px] font-medium"><Users className="h-4 w-4" /> Watch status</div><div className="mt-6 space-y-4">{statuses.map((status) => <div key={status.status}><div className="mb-1.5 flex justify-between text-[10px]"><span className="text-white/50">{label(status.status)}</span><span className="tabular-nums text-white/30">{status.amount.toLocaleString()}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-white/70" style={{ width: `${(status.amount / maxStatus) * 100}%` }} /></div></div>)}</div></div>}
      </div>
    </section>
  );
}

function MediaLinks({ title, eyebrow, items }: { title: string; eyebrow: string; items: { id: number; href: string; title: string; meta: string }[] }) {
  const id = title.toLowerCase().replaceAll(" ", "-");
  return <section aria-labelledby={id}><SectionHeading id={id} eyebrow={eyebrow} title={title} /><div className="mt-6 grid gap-px overflow-hidden rounded-[14px] border border-white/8 bg-white/8 sm:grid-cols-2">{items.map((item) => <Link key={`${item.id}-${item.meta}`} href={item.href} className="group flex min-h-20 items-center justify-between gap-4 bg-[var(--fr-canvas)] p-4 transition hover:bg-white/[0.035]"><span><span className="block text-[13px] font-medium leading-snug">{item.title}</span><span className="mt-1.5 block text-[9px] uppercase tracking-[0.07em] text-white/35">{item.meta}</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition group-hover:text-white" /></Link>)}</div></section>;
}

function parseId(value: string): number | null { const id = Number(value); return Number.isInteger(id) && id > 0 ? id : null; }
function label(value: string | null | undefined): string { return value ? value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—"; }
function compact(value: number): string { return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value); }
function trailerUrl(trailer: NonNullable<AnimeDetail["trailer"]>): string { return trailer.site.toLowerCase() === "youtube" ? `https://www.youtube.com/watch?v=${trailer.id}` : `https://${trailer.site}.com/${trailer.id}`; }
function formatDate(date: AniDate): string | null { if (!date.year) return null; return new Intl.DateTimeFormat("en", { year: "numeric", month: date.month ? "short" : undefined, day: date.day ? "numeric" : undefined, timeZone: "UTC" }).format(new Date(Date.UTC(date.year, (date.month ?? 1) - 1, date.day ?? 1))); }
function dateRange(start: AniDate, end: AniDate): string | null { const from = formatDate(start); const to = formatDate(end); return from ? `${from}${to ? ` — ${to}` : ""}` : null; }
function countryName(code: string): string { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code; } catch { return code; } }
