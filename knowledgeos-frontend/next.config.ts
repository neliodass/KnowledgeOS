import type { NextConfig } from "next";

const internalApiUrl = process.env.INTERNAL_API_URL ?? 'http://localhost:5000';

const nextConfig: NextConfig = {
    output: 'standalone',
    env: {
        NEXT_PUBLIC_API_URL: '/api',
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${internalApiUrl}/api/:path*`,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig;
