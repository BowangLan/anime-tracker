"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ListChecks, Route } from "lucide-react";
import type { AiringAnime } from "@/lib/anilist";
import { useNow } from "@/hooks/use-now";
import { useFollows } from "@/stores/follows-store";
import { buildBoardModel } from "@/features/dashboard/lib/board-model";
import { BoardSkeleton } from "@/features/dashboard/components/board-skeleton";
import { FavoritesSwitch } from "@/features/dashboard/components/layout/favorites-switch";
import { PageHeader } from "@/components/app-shell/page-header";
import { cn } from "@/lib/utils";
import { AgendaView } from "./agenda-view";
import { TracksView } from "./tracks-view";
import { QueueView } from "./queue-view";

type ScheduleView = "agenda" | "tracks" | "queue";

const views: { value: ScheduleView; label: string; icon: typeof CalendarDays }[] = [
  { value: "agenda", label: "Agenda", icon: CalendarDays },
  { value: "tracks", label: "Tracks", icon: Route },
  { value: "queue", label: "Queue", icon: ListChecks },
];

export function SchedulePage({ anime }: { anime: AiringAnime[] }) {
  const now = useNow();
  const following = useFollows((state) => state.following);
  const [onlyFollowing, setOnlyFollowing] = useState(false);
  const [view, setView] = useState<ScheduleView>("agenda");
  const model = useMemo(
    () =>
      now == null
        ? null
        : buildBoardModel(anime, now, onlyFollowing, following),
    [anime, following, now, onlyFollowing],
  );

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden">
      <PageHeader
        eyebrow="Calendar"
        title="Airing schedule"
        description="Release times use your local timezone"
        action={
          <FavoritesSwitch
            checked={onlyFollowing}
            onCheckedChange={setOnlyFollowing}
          />
        }
      />
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--fr-hairline-soft)] px-5 py-2.5 sm:px-7">
        <div className="flex rounded-[9px] bg-[var(--fr-surface-1)] p-1" role="group" aria-label="Schedule view">
          {views.map((option) => {
            const Icon = option.icon;
            const active = view === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setView(option.value)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)] sm:px-3",
                  active ? "bg-white text-black shadow-sm" : "text-white/50 hover:text-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        <p className="hidden text-[11px] text-[var(--fr-ink-muted)] md:block">
          {view === "agenda" ? "Episodes grouped by release date" : view === "tracks" ? "Shows mapped across the week" : "The next unwatched episode per show"}
        </p>
      </div>

      {model == null ? (
        <BoardSkeleton />
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden">
          {model.total === 0 ? (
            <div className="grid h-full place-items-center px-6 text-center">
              <div><p className="text-[15px] font-medium">No followed shows yet</p><button type="button" onClick={() => setOnlyFollowing(false)} className="mt-3 text-[12px] text-[var(--fr-accent-blue)] hover:underline">Show the full schedule</button></div>
            </div>
          ) : view === "agenda" ? (
            <div className="h-full overflow-y-auto"><AgendaView model={model} now={now!} /></div>
          ) : view === "tracks" ? (
            <TracksView model={model} now={now!} />
          ) : (
            <div className="h-full overflow-y-auto"><QueueView model={model} now={now!} /></div>
          )}
        </div>
      )}
    </main>
  );
}
