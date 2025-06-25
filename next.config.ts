import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // 외부 이미지 허용을 위해 추가
    domains: ['lh3.googleusercontent.com'],
  },
  // CSP 설정 추가
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              'https://accounts.google.com',
              'https://*.supabase.co',
              'https://apis.google.com;',
              "object-src 'none';",
            ].join(' '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
