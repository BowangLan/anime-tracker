import type { Metadata } from "next";
import { FavoritesPage } from "@/features/favorites/components/favorites-page";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your private collection of saved anime on this device.",
  alternates: { canonical: "/favorites" },
  robots: { index: false, follow: true },
};

export default function Page() { return <FavoritesPage />; }
