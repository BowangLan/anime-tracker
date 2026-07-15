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
    <div>
      <p className="fr-eyebrow">{eyebrow}</p>
      <h2
        id={id}
        className="mt-1.5 text-[clamp(1.65rem,3vw,2.5rem)] font-semibold leading-none tracking-[-0.045em]"
      >
        {title}
      </h2>
    </div>
  );
}
