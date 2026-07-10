/** @type {import('next').NextConfig} */
const nextConfig = {
  // Teruskan request /api/* ke server backend Express
  async rewrites() {
    const backend = process.env.BACKEND_URL || "http://localhost:4000";
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
