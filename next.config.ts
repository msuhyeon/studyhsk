import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

// 번들 분석기
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    // 외부 이미지 허용
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

// 번들 분석기 적용 후 내보내기
export default withBundleAnalyzer(nextConfig);
