import { cn } from "@/lib/utils";

/** Neutral pulsing placeholder used by loading and skeleton states. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-white/[0.07]", className)} />;
}
