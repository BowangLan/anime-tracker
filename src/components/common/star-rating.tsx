import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** Rating expressed against `max`, such as AniList's 0–100 score. */
  value: number;
  max?: number;
  stars?: number;
  size?: number;
  className?: string;
}

export function StarRating({
  value,
  max = 100,
  stars = 5,
  size = 12,
  className,
}: StarRatingProps) {
  const safeValue = Math.min(max, Math.max(0, value));
  const filledStars = max > 0 ? (safeValue / max) * stars : 0;
  const label = `${safeValue} out of ${max}`;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rating: ${label}`}
      title={label}
    >
      {Array.from({ length: stars }).map((_, index) => {
        const fill = Math.min(1, Math.max(0, filledStars - index)) * 100;

        return (
          <span key={index} className="relative inline-grid shrink-0 place-items-center">
            <Star
              aria-hidden="true"
              width={size}
              height={size}
              className="text-white/20"
              strokeWidth={1.75}
            />
            {fill > 0 && (
              <span
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill}%` }}
              >
                <Star
                  width={size}
                  height={size}
                  className="fill-current text-[var(--fr-ink)]"
                  strokeWidth={1.75}
                />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
