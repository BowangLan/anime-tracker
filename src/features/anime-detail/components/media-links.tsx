import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AnimeDetail } from "@/lib/anilist";
import { SectionHeading } from "./section-heading";
import { label } from "../lib/format";

interface MediaLinkItem {
  id: number;
  href: string;
  title: string;
  meta: string;
}

export function RelatedTitles({ anime }: { anime: AnimeDetail }) {
  if (anime.relations.edges.length === 0) return null;
  const items = anime.relations.edges.map((edge) => ({
    id: edge.node.id,
    href: edge.node.type === "ANIME" ? `/anime/${edge.node.id}` : edge.node.siteUrl,
    title: edge.node.title.userPreferred,
    meta: `${label(edge.relationType)} · ${label(edge.node.format)}`,
  }));
  return <MediaLinks title="Related titles" eyebrow="Series map" items={items} />;
}

export function Recommendations({ anime }: { anime: AnimeDetail }) {
  if (!anime.recommendations.nodes.some((item) => item.mediaRecommendation)) return null;
  const items = anime.recommendations.nodes
    .filter((item) => item.mediaRecommendation)
    .slice(0, 12)
    .map((item) => ({
      id: item.mediaRecommendation!.id,
      href:
        item.mediaRecommendation!.type === "ANIME"
          ? `/anime/${item.mediaRecommendation!.id}`
          : item.mediaRecommendation!.siteUrl,
      title: item.mediaRecommendation!.title.userPreferred,
      meta: `${label(item.mediaRecommendation!.format)} · +${item.rating}`,
    }));
  return <MediaLinks title="More like this" eyebrow="AniList recommendations" items={items} />;
}

function MediaLinks({
  title,
  eyebrow,
  items,
}: {
  title: string;
  eyebrow: string;
  items: MediaLinkItem[];
}) {
  const id = title.toLowerCase().replaceAll(" ", "-");
  return (
    <section aria-labelledby={id}>
      <SectionHeading id={id} eyebrow={eyebrow} title={title} />
      <div className="mt-6 grid gap-px overflow-hidden rounded-[14px] border border-white/8 bg-white/8 sm:grid-cols-2">
        {items.map((item) => (
          <Link key={`${item.id}-${item.meta}`} href={item.href} className="group flex min-h-20 items-center justify-between gap-4 bg-[var(--fr-canvas)] p-4 transition hover:bg-white/[0.035]">
            <span>
              <span className="block text-[13px] font-medium leading-snug">{item.title}</span>
              <span className="mt-1.5 block text-[9px] uppercase tracking-[0.07em] text-white/35">{item.meta}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition group-hover:text-white" />
          </Link>
        ))}
      </div>
    </section>
  );
}
