"use client";

import { useMemo, useState } from "react";
import type { AiringAnime } from "@/lib/anilist";
import { useNow } from "@/hooks/use-now";
import { useFollows } from "@/stores/follows-store";
import { buildBoardModel } from "@/features/dashboard/lib/board-model";
import { WeekBoard } from "@/features/dashboard/components/sections/week-board";
import { BoardSkeleton } from "@/features/dashboard/components/board-skeleton";
import { FavoritesSwitch } from "@/features/dashboard/components/layout/favorites-switch";
import { PageHeader } from "@/components/app-shell/page-header";

export function SchedulePage({ anime }: { anime: AiringAnime[] }) {
  const now = useNow();
  const following = useFollows((state) => state.following);
  const [onlyFollowing, setOnlyFollowing] = useState(false);
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
      {model == null ? (
        <BoardSkeleton />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4 sm:px-8 lg:px-7">
            <WeekBoard
              model={model}
              now={now!}
              onlyFollowing={onlyFollowing}
              hasQuery={false}
              onClear={() => setOnlyFollowing(false)}
              showHeader={false}
            />
          </div>
        </div>
      )}
    </main>
  );
}
