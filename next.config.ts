import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The original five-surface routes moved when the site was restructured
    // into Serial / Music / Community. Keep the old links alive forever.
    return [
      { source: "/signal", destination: "/music", permanent: true },
      {
        source: "/prologue",
        destination: "/serial/came-back-wrong",
        permanent: true,
      },
      { source: "/key", destination: "/community", permanent: true },
    ];
  },
};

export default nextConfig;
