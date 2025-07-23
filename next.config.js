/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove the env config as Next.js will automatically pick up NEXT_PUBLIC_ variables
  // and private variables from .env.local
}

module.exports = nextConfig;