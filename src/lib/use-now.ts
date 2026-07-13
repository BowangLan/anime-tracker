"use client";

import { useSyncExternalStore } from "react";

// A hydration-safe clock. The server can't know the current time without
// producing markup that differs from the client, so `getServerSnapshot`
// returns null and the UI renders time-dependent bits only after hydration.
// The value is bucketed to the minute so `getSnapshot` is referentially
// stable between ticks (a fresh Date.now() every render would loop forever).

const MINUTE = 60_000;

function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, MINUTE);
  return () => clearInterval(id);
}

function getSnapshot(): number {
  const t = Date.now();
  return t - (t % MINUTE);
}

function getServerSnapshot(): null {
  return null;
}

/** Current time in ms, rounded to the minute — or null until mounted. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
