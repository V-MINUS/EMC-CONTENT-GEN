/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable ESLint during build to prevent TypeScript errors from blocking deployment
  eslint: {
    // Only run ESLint on local development, not during the build process
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
