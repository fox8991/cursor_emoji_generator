/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qnvbrdhlfjkfmobpiwbp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

module.exports = nextConfig
