import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // 외부 이미지 허용을 위해 추가
    domains: ['lh3.googleusercontent.com'],
  },
};

export default nextConfig;
