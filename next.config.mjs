import withSvgr from "next-plugin-svgr";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.(mov|webm)$/, // .mov と .webm の両方の拡張子にマッチ
        use: 'file-loader',
        options: {
          name: '[name].[ext]', // オリジナルのファイル名と拡張子を保持
          // 必要に応じてその他のオプションを追加 (例: ファイルサイズの制限)
        },
      });
    }

    return config;
  },
};

export default withSvgr(nextConfig);
