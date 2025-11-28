import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is to allow cross-origin requests in the development environment.
    // The Next.js dev server is running in a container and is accessed from a different origin.
    allowedDevOrigins: [
      'https://6000-firebase-studio-1764282009008.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
