export function SectionHeading({
  id,
  eyebrow,
  title,
}: {
  id: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-white/8 pb-3">
      <h2
        id={id}
        className="scroll-mt-28 text-[18px] font-semibold tracking-[-0.025em]"
      >
        {title}
      </h2>
      <p className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-white/35">{eyebrow}</p>
    </div>
  );
}
