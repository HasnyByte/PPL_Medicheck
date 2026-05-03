import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Production optimization */
  productionBrowserSourceMaps: false,

  /* Memory optimization */
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,    // Clear cache lebih agresif: 25s vs default 60s
    pagesBufferLength: 2,           // Keep hanya 2 pages di memory
  },
  
  /* Disable features yang boros memory */
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react"],
  },
  
  /* Output tracing untuk production */
};

export default nextConfig;
