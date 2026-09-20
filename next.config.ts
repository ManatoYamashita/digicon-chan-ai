import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Vercel の画像最適化を通さず、public/images のファイルをそのまま配信する（#48）。
    // 配信物は全て WebP（1 つだけ JPEG）で圧縮済みなので、幅ごとに変換を作っても
    // ほとんど縮まらない。一方で Hobby プランの変換枠は消費され、尽きると
    // /_next/image が HTTP 402 (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED) を返し、
    // 画像が表示されなくなる。実際に /about はスマホで 18 枚中 15 枚が空白になっていた。
    // 元ファイル側は scripts/resize-images.mjs で表示サイズに見合う大きさに保つ。
    // formats と minimumCacheTTL は最適化を通さないので効かない。書くと誤解を招くため置かない。
    unoptimized: true,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
