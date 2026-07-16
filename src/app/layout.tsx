import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SoundProvider } from "@/providers/sound-provider";
import { AppShell } from "@/components/app-shell/app-shell";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: "Anime Tracker — Current Anime Release Schedule",
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Track currently airing anime, browse this season's releases, and see weekly episode schedules in your local timezone with live data from AniList.",
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: "Anime Tracker — Current Anime Release Schedule",
    description:
      "Track currently airing anime and see weekly episode schedules in your local timezone.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime Tracker — Current Anime Release Schedule",
    description:
      "Track currently airing anime and see weekly episode schedules in your local timezone.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased overscroll-none`}>
      <body className="min-h-full bg-background text-foreground">
        <SoundProvider />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
