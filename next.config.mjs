/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  reactStrictMode: true,
  output: 'standalone',
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" }
      ]
    }
  ]
};
export default nextConfig;
