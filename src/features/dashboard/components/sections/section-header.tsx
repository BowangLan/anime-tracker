export function SectionHeader({ id, title, description }: { id?: string; title: string; description: string }) {
  return (
    <header className="mb-5 flex flex-col gap-1">
      <h2 id={id} className="text-[22px] font-bold leading-[1.2] tracking-[-0.8px] text-[var(--fr-ink)]">
        {title}
      </h2>
      <p className="text-[12px] leading-[1.2] tracking-[-0.12px] text-[var(--fr-ink-muted)]">
        {description}
      </p>
    </header>
  );
}
