import { Star, Users } from "lucide-react";
import type { AnimeDetail } from "@/lib/anilist";
import { SectionHeading } from "./section-heading";
import { compact, label } from "./format";

export function Community({ anime }: { anime: AnimeDetail }) {
  const scores = anime.stats?.scoreDistribution ?? [];
  const statuses = anime.stats?.statusDistribution ?? [];
  if (scores.length === 0 && statuses.length === 0 && anime.trends.nodes.length === 0) return null;
  const maxScore = Math.max(1, ...scores.map((score) => score.amount));
  const maxStatus = Math.max(1, ...statuses.map((status) => status.amount));

  return (
    <section aria-labelledby="community-heading">
      <SectionHeading id="community-heading" eyebrow={`${compact(anime.popularity)} members`} title="Community pulse" />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {scores.length > 0 && (
          <div className="rounded-[16px] border border-white/8 p-5">
            <div className="flex items-center gap-2 text-[12px] font-medium"><Star className="h-4 w-4" /> Score spread</div>
            <div className="mt-6 flex h-32 items-end gap-1">
              {scores.map((score) => (
                <div key={score.score} className="group flex h-full flex-1 flex-col justify-end gap-2">
                  <div title={`${score.score}: ${score.amount.toLocaleString()} votes`} className="min-h-px rounded-t-sm bg-[var(--detail-accent)] opacity-75 transition group-hover:opacity-100" style={{ height: `${(score.amount / maxScore) * 100}%` }} />
                  <span className="text-center text-[9px] text-white/30">{score.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {statuses.length > 0 && (
          <div className="rounded-[16px] border border-white/8 p-5">
            <div className="flex items-center gap-2 text-[12px] font-medium"><Users className="h-4 w-4" /> Watch status</div>
            <div className="mt-6 space-y-4">
              {statuses.map((status) => (
                <div key={status.status}>
                  <div className="mb-1.5 flex justify-between text-[10px]">
                    <span className="text-white/50">{label(status.status)}</span>
                    <span className="tabular-nums text-white/30">{status.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-white/70" style={{ width: `${(status.amount / maxStatus) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
