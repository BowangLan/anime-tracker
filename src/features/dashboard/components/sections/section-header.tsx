export function SectionHeader({ id, title, description }: { id?: string; title: string; description: string }) {
  return (
    <header className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-3 flex-none">
      <h2 id={id} className="text-base font-medium leading-tight tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      <p className="text-right text-sm leading-tight text-muted-foreground">
        {description}
      </p>
    </header>
  );
}
