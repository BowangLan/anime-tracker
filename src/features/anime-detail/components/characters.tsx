import Image from "next/image";
import type { AnimeDetail } from "@/lib/anilist";
import { SectionHeading } from "./section-heading";
import { label } from "../lib/format";

export function Characters({ anime }: { anime: AnimeDetail }) {
  if (anime.characters.edges.length === 0) return null;

  return (
    <section aria-labelledby="cast-heading">
      <SectionHeading
        id="cast-heading"
        eyebrow={`${anime.characters.pageInfo.total ?? anime.characters.edges.length} credited`}
        title="Characters & voices"
      />
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
  );
}
