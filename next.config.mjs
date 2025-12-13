/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    }
                ]
            }
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.hackernoon.com',
            },
            {
                protocol: 'https',
                hostname: 'img.icons8.com',
            },
        ],
    },
};

export default nextConfig;
