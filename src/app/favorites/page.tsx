import type { Metadata } from "next";
import { FavoritesPage } from "@/features/favorites/components/favorites-page";

export const metadata: Metadata = { title: "Favorites — Anime Tracker", description: "Your saved anime shelf." };

export default function Page() { return <FavoritesPage />; }
