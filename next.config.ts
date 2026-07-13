import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AniList serves all cover art from this CDN host.
    remotePatterns: [{ protocol: "https", hostname: "s4.anilist.co" }],
  },
};

export default nextConfig;
