import { CalendarClock, Clapperboard, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoardModel } from "./model";

/** The KPI widget row shown above the week board. */
export function Stats({ model }: { model: BoardModel }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Stat
        icon={<Clapperboard className="h-4 w-4" />}
        label="Airing this season"
        value={model.total}
      />
      <Stat
        icon={<CalendarClock className="h-4 w-4" />}
        label="Updating today"
        value={model.todayCount}
        accent
      />
      <Stat icon={<Star className="h-4 w-4" />} label="Favorites" value={model.followingCount} />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-[14px] border p-4",
        accent
          ? "border-[var(--fr-accent-blue)]/30 bg-[var(--fr-accent-blue)]/[0.07]"
          : "border-[var(--fr-hairline)] bg-[var(--fr-surface-1)]",
      )}
    >
      <div className="flex items-center gap-2 text-[var(--fr-ink-muted)]">
        {icon}
        <span className="text-[12px]">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p
          className="text-[28px] font-semibold leading-none tabular-nums text-[var(--fr-ink)]"
          style={{ letterSpacing: "-0.02em" }}
        >
          {value}
        </p>
        {sub && <span className="text-[12px] text-[var(--fr-ink-muted)]">{sub}</span>}
      </div>
    </div>
  );
}
