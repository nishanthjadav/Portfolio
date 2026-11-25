import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (~30% smaller than WebP), WebP fallback, original as last resort.
    formats: ["image/avif", "image/webp"],
    // Nothing on this site renders wider than ~1800 CSS px, so drop the
    // 2048/3840 candidates: they would only ever be wasted bandwidth.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Quality levels used via <Image quality={...}> must be declared in Next 16.
    qualities: [75, 85],
    // Cache optimized derivatives for a year — sources are content-stable.
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
