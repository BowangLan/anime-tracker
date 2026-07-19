import type { Metadata } from "next";
import { SearchPage } from "@/features/search/components/search-page";

export const metadata: Metadata = {
  title: "Search Anime",
  description: "Search the complete AniList catalog by title, studio, or keyword.",
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Search Anime",
    description: "Find anime by title, studio, or keyword.",
    url: "/search",
  },
};

export default function Page() {
  return <SearchPage />;
}
