import type { NextConfig } from "next";
import path from "path";

const dynamicR2Patterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [];

if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
  try {
    const r2Host = new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname.toLowerCase();
    if (r2Host) {
      dynamicR2Patterns.push({
        protocol: "https",
        hostname: r2Host,
        port: "",
        pathname: "/**",
      });
    }
  } catch {
    // Ignore invalid URL
  }
}

if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN.trim().toLowerCase();
  if (rootDomain) {
    dynamicR2Patterns.push({
      protocol: "https",
      hostname: `*.${rootDomain}`,
      port: "",
      pathname: "/**",
    });
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
        hostname: 'secure.gravatar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        port: '',
        pathname: '/**',
      },
      ...dynamicR2Patterns,

    ],
    qualities: [75, 80, 100],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
