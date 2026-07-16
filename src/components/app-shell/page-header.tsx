"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  showBackButton = false,
  headingLevel = "h1",
  className,
}: {
  // TODO: delete eyebrow
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  showBackButton?: boolean;
  headingLevel?: "h1" | "div";
  className?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header
      aria-label={[eyebrow, title, description].filter(Boolean).join(": ")}
      className={cn(
        "flex h-14 gap-3 border-b border-[var(--fr-hairline-soft)] px-5 flex-row sm:items-center sm:justify-between sm:px-7 flex-none",
        className,
      )}
    >
      <div className="flex items-center gap-2 relative flex-1">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-none"
            onClick={handleBack}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        )}

        {headingLevel === "h1" ? (
          <h1 className="shrink-0 text-sm font-medium leading-tight text-[var(--fr-ink)] flex-1 truncate max-w-xs left-1/2 -translate-x-1/2 absolute sm:relative sm:translate-x-0 sm:left-auto sm:max-w-full inline-flex">
            {title}
          </h1>
        ) : (
          <div className="shrink-0 text-sm font-medium leading-tight text-[var(--fr-ink)] flex-1 truncate max-w-xs left-1/2 -translate-x-1/2 absolute sm:relative sm:translate-x-0 sm:left-auto sm:max-w-full inline-flex">
            {title}
          </div>
        )}

        <div className="flex-1"></div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
