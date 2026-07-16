import { plainText, type AnimeDetail } from "@/lib/anilist";
import { SectionHeading } from "./section-heading";

export function Synopsis({ anime }: { anime: AnimeDetail }) {
  return (
    <section aria-labelledby="story-heading">
      <SectionHeading id="story-heading" eyebrow="The story" title="Synopsis" />
      <p className="mt-5 max-w-3xl text-pretty text-[clamp(1rem,1.5vw,1.3rem)] leading-[1.55] tracking-[-0.018em] text-white/75">
        {plainText(anime.description) || "No synopsis is available yet."}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {anime.genres.map((genre) => (
          <span key={genre} className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-white/65">
            {genre}
          </span>
        ))}
      </div>
    </section>
  );
}
