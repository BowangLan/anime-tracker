import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const animeCardVariants = cva("group/anime-card relative min-w-0", {
  variants: {
    layout: {
      poster: "flex flex-col",
      compact: "flex min-h-32 gap-3 p-2.5",
      panel: "flex h-[152px] gap-3 overflow-hidden p-2.5",
      row: "grid items-center gap-3",
    },
    surface: {
      ghost: "",
      subtle: "rounded-[14px] bg-[var(--fr-surface-1)]",
      outlined:
        "rounded-[14px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] transition-colors hover:border-white/20 hover:bg-[var(--fr-surface-2)]/60",
    },
    emphasis: {
      default: "",
      attention: "",
    },
  },
  compoundVariants: [
    {
      surface: "outlined",
      emphasis: "attention",
      className: "border-foreground/30 hover:border-foreground/60",
    },
  ],
  defaultVariants: {
    layout: "poster",
    surface: "ghost",
    emphasis: "default",
  },
});

function AnimeCard({
  className,
  layout = "poster",
  surface = "ghost",
  emphasis = "default",
  ...props
}: React.ComponentProps<"article"> & VariantProps<typeof animeCardVariants>) {
  return (
    <article
      data-slot="anime-card"
      data-layout={layout}
      data-surface={surface}
      data-emphasis={emphasis}
      className={cn(animeCardVariants({ layout, surface, emphasis }), className)}
      {...props}
    />
  );
}

const animeCardMediaVariants = cva(
  "relative shrink-0 overflow-hidden bg-[var(--fr-surface-2)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60",
  {
    variants: {
      size: {
        poster: "aspect-[2/3] w-full rounded-[14px]",
        feature: "aspect-[4/5] w-full rounded-[15px]",
        panel: "aspect-[2/3] h-full rounded-[8px]",
        compact: "aspect-[2/3] w-[70px] rounded-[8px]",
        thumbnail: "aspect-[2/3] w-14 rounded-[8px]",
        mini: "aspect-[2/3] w-[54px] rounded-[8px]",
      },
    },
    defaultVariants: {
      size: "poster",
    },
  },
);

type AnimeCardMediaProps = Omit<React.ComponentProps<typeof Link>, "href"> &
  VariantProps<typeof animeCardMediaVariants> & {
    href: React.ComponentProps<typeof Link>["href"];
    src?: string | null;
    alt?: string;
    sizes: string;
    eager?: boolean;
    imageClassName?: string;
  };

function AnimeCardMedia({
  href,
  src,
  alt = "",
  sizes,
  eager = false,
  size = "poster",
  className,
  imageClassName,
  children,
  ...props
}: AnimeCardMediaProps) {
  return (
    <Link
      data-slot="anime-card-media"
      href={href}
      className={cn(animeCardMediaVariants({ size }), className)}
      {...props}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes={sizes}
          className={cn(
            "object-cover transition duration-500 ease-out group-hover/anime-card:scale-[1.035]",
            imageClassName,
          )}
        />
      )}
      {children}
    </Link>
  );
}

const animeCardBodyVariants = cva("min-w-0", {
  variants: {
    layout: {
      poster: "pt-3",
      compact: "flex flex-1 flex-col py-0.5",
      panel: "flex flex-1 flex-col py-0.5",
      row: "",
    },
  },
  defaultVariants: {
    layout: "poster",
  },
});

function AnimeCardBody({
  className,
  layout = "poster",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof animeCardBodyVariants>) {
  return (
    <div
      data-slot="anime-card-body"
      className={cn(animeCardBodyVariants({ layout }), className)}
      {...props}
    />
  );
}

function AnimeCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="anime-card-header"
      className={cn("flex min-w-0 items-start justify-between gap-2", className)}
      {...props}
    />
  );
}

const animeCardTitleVariants = cva(
  "min-w-0 text-[var(--fr-ink)] transition-colors group-hover/anime-card:text-[var(--fr-ink-muted)]",
  {
    variants: {
      size: {
        sm: "text-[13px] font-semibold leading-tight tracking-[-0.01em]",
        default: "text-sm font-medium leading-tight",
        lg: "text-[15px] font-semibold leading-[1.25] tracking-[-0.02em]",
      },
      lines: {
        one: "line-clamp-1",
        two: "line-clamp-2",
      },
    },
    defaultVariants: {
      size: "default",
      lines: "two",
    },
  },
);

function AnimeCardTitle({
  href,
  className,
  size = "default",
  lines = "two",
  stretched = false,
  children,
  ...props
}: React.ComponentProps<"h3"> &
  VariantProps<typeof animeCardTitleVariants> & {
    href?: React.ComponentProps<typeof Link>["href"];
    stretched?: boolean;
  }) {
  const content = href ? (
    <Link
      href={href}
      className={cn(
        "outline-none focus-visible:underline",
        stretched && "after:absolute after:inset-0 after:z-0",
      )}
    >
      {children}
    </Link>
  ) : (
    children
  );

  return (
    <h3
      data-slot="anime-card-title"
      className={cn(animeCardTitleVariants({ size, lines }), className)}
      {...props}
    >
      {content}
    </h3>
  );
}

function AnimeCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="anime-card-description"
      className={cn(
        "mt-1 truncate text-[11px] text-[var(--fr-ink-muted)]",
        className,
      )}
      {...props}
    />
  );
}

function AnimeCardMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="anime-card-meta"
      className={cn(
        "flex min-w-0 items-center gap-2 text-[11px] text-[var(--fr-ink-muted)]",
        className,
      )}
      {...props}
    />
  );
}

const animeCardStatusVariants = cva(
  "inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em]",
  {
    variants: {
      tone: {
        muted: "text-[var(--fr-ink-muted)]",
        live: "text-[var(--fr-accent-blue)]",
        strong: "text-[var(--fr-ink)]",
      },
    },
    defaultVariants: {
      tone: "muted",
    },
  },
);

function AnimeCardStatus({
  className,
  tone = "muted",
  dot = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof animeCardStatusVariants> & { dot?: boolean }) {
  return (
    <span
      data-slot="anime-card-status"
      className={cn(animeCardStatusVariants({ tone }), className)}
      {...props}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

function AnimeCardActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="anime-card-actions"
      className={cn("relative z-10 flex shrink-0 items-center", className)}
      {...props}
    />
  );
}

function AnimeCardOverlay({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="anime-card-overlay"
      className={cn(
        "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3 pb-3 pt-12",
        className,
      )}
      {...props}
    />
  );
}

const animeCardEpisodeVariants = cva(
  "inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-[12px] leading-[1.2] backdrop-blur-md",
  {
    variants: {
      tone: {
        strong: "bg-[var(--fr-surface-2)] font-medium text-[var(--fr-ink)]",
        muted: "bg-[var(--fr-surface-2)] text-[var(--fr-ink-muted)]",
      },
    },
    defaultVariants: {
      tone: "strong",
    },
  },
);

function AnimeCardEpisode({
  className,
  tone = "strong",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof animeCardEpisodeVariants>) {
  return (
    <span
      data-slot="anime-card-episode"
      className={cn(animeCardEpisodeVariants({ tone }), className)}
      {...props}
    />
  );
}

const animeCardListVariants = cva("min-w-0", {
  variants: {
    layout: {
      grid: "grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
      compactGrid:
        "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
      panelGrid: "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3",
      splitGrid: "grid grid-cols-1 gap-5 min-[810px]:grid-cols-2",
      stack: "flex flex-col gap-3",
      rail:
        "no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-3 [scroll-padding-inline:20px] [&>*]:w-[70vw] [&>*]:max-w-[240px] [&>*]:shrink-0 [&>*]:snap-start min-[810px]:[&>*]:w-[220px]",
    },
  },
  defaultVariants: {
    layout: "grid",
  },
});

function AnimeCardList({
  className,
  layout = "grid",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof animeCardListVariants>) {
  return (
    <div
      data-slot="anime-card-list"
      data-layout={layout}
      className={cn(animeCardListVariants({ layout }), className)}
      {...props}
    />
  );
}

export {
  AnimeCard,
  AnimeCardActions,
  AnimeCardBody,
  AnimeCardDescription,
  AnimeCardEpisode,
  AnimeCardHeader,
  AnimeCardList,
  AnimeCardMedia,
  AnimeCardMeta,
  AnimeCardOverlay,
  AnimeCardStatus,
  AnimeCardTitle,
  animeCardEpisodeVariants,
  animeCardListVariants,
  animeCardMediaVariants,
  animeCardStatusVariants,
  animeCardTitleVariants,
  animeCardVariants,
};
