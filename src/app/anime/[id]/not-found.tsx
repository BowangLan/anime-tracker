import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--fr-canvas)] px-6 text-center">
      <div><p className="fr-eyebrow">404 · AniList</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">That title isn&apos;t in the catalog.</h1><p className="mt-3 text-sm text-white/45">Check the URL or return to this week&apos;s schedule.</p><Link href="/" className="mt-7 inline-flex rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black">Back to the board</Link></div>
    </main>
  );
}
