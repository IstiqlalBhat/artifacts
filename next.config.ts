import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Artifacts can include base64-encoded images. The lib/artifacts.ts
      // bundle cap is 6 MB of file content; this allows JSON-wire overhead.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
