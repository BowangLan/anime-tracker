"use client";

import { usePathname } from "next/navigation";
import { AppNavigation } from "./app-navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locksViewport = pathname === "/schedule";

  return (
    <div
      className={
        locksViewport
          ? "flex h-screen min-h-0 overflow-hidden bg-[var(--fr-canvas)]"
          : "flex min-h-screen bg-[var(--fr-canvas)]"
      }
    >
      <AppNavigation />
      <div
        className={
          locksViewport
            ? "h-full min-h-0 min-w-0 flex-1 overflow-hidden pt-14 pb-[68px] lg:pt-0 lg:pb-0"
            : "min-w-0 flex-1 pt-14 pb-[68px] lg:pt-0 lg:pb-0"
        }
      >
        {children}
      </div>
    </div>
  );
}
