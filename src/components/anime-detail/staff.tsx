import Image from "next/image";
import type { AnimeDetail } from "@/lib/anilist";
import { SectionHeading } from "./section-heading";

export function Staff({ anime }: { anime: AnimeDetail }) {
  if (anime.staff.edges.length === 0) return null;

  return (
    <section aria-labelledby="staff-heading">
      <SectionHeading
        id="staff-heading"
        eyebrow={`${anime.staff.pageInfo.total ?? anime.staff.edges.length} credited`}
        title="Production staff"
      />
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
  );
}
