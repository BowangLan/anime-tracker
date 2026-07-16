export function NextEpisode({ episode, airingAt }: { episode: number; airingAt: number }) {
  return (
    <section className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[var(--detail-accent)] p-5 text-black sm:p-6">
      <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] opacity-55">Next broadcast</p>
          <h2 className="mt-1.5 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.055em]">
            Episode {episode}
          </h2>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[13px] font-semibold">
            {new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(airingAt * 1000)}
          </p>
          <p className="mt-1 text-[11px] opacity-60">
            {new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(airingAt * 1000)}
          </p>
        </div>
      </div>
    </section>
  );
}
