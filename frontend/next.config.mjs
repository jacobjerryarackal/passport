/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: 'https://passport-backend-re43.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;