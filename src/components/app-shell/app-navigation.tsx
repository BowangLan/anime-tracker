"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Compass, House, Star, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFollows } from "@/stores/follows-store";

const items = [
  { href: "/", label: "Home", icon: House },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
];

export function AppNavigation() {
  const pathname = usePathname();
  const followingCount = useFollows((state) => state.following.length);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--fr-hairline-soft)] bg-[var(--fr-surface-1)]/40 px-4 py-5 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 rounded-[8px] px-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--fr-ink)] text-[var(--fr-canvas)]">
            <Tv className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.03em]">Anime Tracker</span>
        </Link>

        <p className="fr-eyebrow mt-8 px-1">Your season</p>
        <nav aria-label="Primary navigation" className="mt-2 flex flex-col gap-1">
          {items.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-[9px] px-2.5 py-2.5 text-[13px] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60",
                  active
                    ? "bg-white/[0.07] font-medium text-[var(--fr-ink)]"
                    : "text-[var(--fr-ink-muted)] hover:bg-white/[0.04] hover:text-[var(--fr-ink)]",
                )}
              >
                <span className="flex items-center gap-2.5"><Icon className={cn("h-4 w-4", active && item.href === "/favorites" && "fill-current")} />{item.label}</span>
                {item.href === "/favorites" && followingCount > 0 && (
                  <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] tabular-nums text-[var(--fr-ink-muted)]">{followingCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--fr-hairline-soft)] px-1 pt-4 text-[11px] leading-relaxed text-[var(--fr-ink-muted)]">
          <p>Find a show. Follow it. Know when the next episode lands.</p>
          <p className="mt-3">Data by <a href="https://anilist.co" target="_blank" rel="noreferrer" className="text-[var(--fr-accent-blue)] hover:underline">AniList</a></p>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-[var(--fr-hairline-soft)] bg-[var(--fr-canvas)]/90 px-4 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--fr-ink)] text-[var(--fr-canvas)]"><Tv className="h-4 w-4" strokeWidth={2.5} /></span>
          <span className="text-[14px] font-semibold tracking-[-0.03em]">Anime Tracker</span>
        </Link>
      </header>

      <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-50 grid h-[68px] grid-cols-4 border-t border-[var(--fr-hairline)] bg-[var(--fr-surface-1)]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-1 text-[10px] outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--fr-accent-blue)]/60", active ? "text-[var(--fr-ink)]" : "text-[var(--fr-ink-muted)]")}>
              <Icon className={cn("h-[18px] w-[18px]", active && item.href === "/favorites" && "fill-current")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
