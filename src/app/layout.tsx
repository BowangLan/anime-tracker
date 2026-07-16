import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SoundProvider } from "@/providers/sound-provider";
import { AppShell } from "@/components/app-shell/app-shell";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anime Tracker — follow your season",
  description:
    "A dashboard of currently airing anime organized by their weekly update day, with the latest episode and season progress. Live schedule from AniList.",
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
