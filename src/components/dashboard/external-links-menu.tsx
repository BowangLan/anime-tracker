"use client";

import Image from "next/image";
import { Menu } from "@base-ui/react/menu";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import type { AnimeExternalLink } from "@/lib/anilist";

export function ExternalLinksMenu({ links }: { links: AnimeExternalLink[] }) {
  if (links.length === 0) return null;

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="External links"
        title="External links"
        data-cuelume-press
        className="grid h-6 w-6 place-items-center rounded-full text-[var(--fr-ink-muted)] opacity-70 transition hover:bg-white/[0.06] hover:text-[var(--fr-ink)] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60 data-popup-open:bg-white/[0.08] data-popup-open:text-[var(--fr-ink)] data-popup-open:opacity-100"
      >
        <ExternalLinkIcon className="h-3.5 w-3.5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50 outline-none">
          <Menu.Popup className="w-64 origin-[var(--transform-origin)] rounded-[12px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-2)] p-1.5 text-[var(--fr-ink)] shadow-2xl shadow-black/50 outline-none transition-[transform,opacity] duration-100 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            <Menu.Group>
              <Menu.GroupLabel className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--fr-ink-muted)]">
                Available links
              </Menu.GroupLabel>
              {links.map((link) => (
                <Menu.LinkItem
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  label={link.site}
                  closeOnClick
                  className="flex min-w-0 items-center gap-2.5 rounded-[8px] px-2 py-2 outline-none transition-colors data-highlighted:bg-white/[0.07]"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-[7px] border border-[var(--fr-hairline)] bg-black/20">
                    {link.icon ? (
                      <Image src={link.icon} alt="" width={18} height={18} className="object-contain" />
                    ) : (
                      <ExternalLinkIcon className="h-3.5 w-3.5 text-[var(--fr-ink-muted)]" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium">{link.site}</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-[var(--fr-ink-muted)]">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: link.color ?? "var(--fr-ink-muted)" }}
                      />
                      <span className="truncate">
                        {[formatLinkType(link.type), link.language, link.notes]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </span>
                  <ExternalLinkIcon className="h-3 w-3 shrink-0 text-[var(--fr-ink-muted)]" />
                </Menu.LinkItem>
              ))}
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function formatLinkType(type: string | null): string {
  if (!type) return "External";
  return type.charAt(0) + type.slice(1).toLowerCase();
}
