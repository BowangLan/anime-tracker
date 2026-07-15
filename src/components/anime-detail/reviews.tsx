import type { AnimeDetail } from "@/lib/anilist";
import { SectionHeading } from "./section-heading";

export function Reviews({ anime }: { anime: AnimeDetail }) {
  if (anime.reviews.nodes.length === 0) return null;

  return (
    <section aria-labelledby="reviews-heading">
      <SectionHeading
        id="reviews-heading"
        eyebrow={`${anime.reviews.pageInfo.total ?? anime.reviews.nodes.length} community reviews`}
        title="What viewers say"
      />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {anime.reviews.nodes.slice(0, 4).map((review) => (
          <a key={review.id} href={review.siteUrl} target="_blank" rel="noreferrer" className="rounded-[16px] border border-white/8 bg-white/[0.025] p-5 transition hover:border-white/18">
            <p className="text-[15px] font-medium leading-snug">{review.summary}</p>
            <div className="mt-6 flex items-center justify-between text-[11px] text-white/42">
              <span>@{review.user.name}</span><span>{review.rating}/{review.ratingAmount} helpful</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
