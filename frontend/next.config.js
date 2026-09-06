/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/portal/admin/login",
        destination: "/admin/login",
        permanent: true,
      },
      {
        source: "/portal/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
      {
        source: "/portal/admin/:path*",
        destination: "/admin/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
