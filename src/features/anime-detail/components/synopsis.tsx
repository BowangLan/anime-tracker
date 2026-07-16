import { plainText, type AnimeDetail } from "@/lib/anilist";
import { SectionHeading } from "./section-heading";

export function Synopsis({ anime }: { anime: AnimeDetail }) {
  return (
    <section aria-labelledby="story-heading">
      <SectionHeading id="story-heading" eyebrow="The story" title="Synopsis" />
      <p className="mt-4 max-w-3xl text-pretty text-[14px] leading-6 text-white/68">
        {plainText(anime.description) || "No synopsis is available yet."}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {anime.genres.map((genre) => (
          <span key={genre} className="rounded-[7px] border border-white/8 bg-white/[0.025] px-2.5 py-1 text-[10px] text-white/55">
            {genre}
          </span>
        ))}
      </div>
    </section>
  );
}
