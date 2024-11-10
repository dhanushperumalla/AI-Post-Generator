/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["*"],
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "data",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
