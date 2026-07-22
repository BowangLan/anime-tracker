import { ArrowUpRight, Trophy } from "lucide-react";
import type { AnimeDetail } from "@/lib/anilist";
import { FactPanel } from "./fact-panel";

export function DetailAside({
  anime,
  mainStudio,
  aniwavesUrl,
}: {
  anime: AnimeDetail;
  mainStudio?: string;
  aniwavesUrl?: string;
}) {
  const links = anime.externalLinks.filter((link) => !link.isDisabled);

  return (
    <aside className="space-y-8 lg:sticky lg:top-16 lg:self-start">
      <FactPanel anime={anime} mainStudio={mainStudio} />

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

      {links.length > 0 && (
        <div>
          <p className="fr-eyebrow">Official & streaming</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {links.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[10px] border border-white/8 px-3 py-2.5 text-[11px] text-white/62 transition hover:border-white/20 hover:text-white">
                <span className="truncate">{link.site}</span><ArrowUpRight className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {aniwavesUrl && (
        <div>
          <p className="fr-eyebrow">Catalog sources</p>
          <a
            href={aniwavesUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-between rounded-[10px] border border-white/8 px-3 py-2.5 text-[11px] text-white/62 transition hover:border-white/20 hover:text-white"
          >
            <span>Aniwaves</span><ArrowUpRight className="h-3 w-3 shrink-0" />
          </a>
        </div>
      )}
    </aside>
  );
}
