export function NextEpisode({ episode, airingAt }: { episode: number; airingAt: number }) {
  return (
    <section className="rounded-[12px] border border-[var(--detail-accent)]/35 bg-[color-mix(in_oklab,var(--detail-accent)_8%,transparent)] px-4 py-3.5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--detail-accent)]">Next broadcast</p>
          <h2 className="mt-1 text-[16px] font-semibold tracking-[-0.02em]">Episode {episode}</h2>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[12px] font-medium text-white/78">
            {new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(airingAt * 1000)}
          </p>
          <p className="mt-0.5 text-[10px] text-white/38">
            {new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(airingAt * 1000)}
          </p>
        </div>
      </div>
    </section>
  );
}
