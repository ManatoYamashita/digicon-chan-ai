import withSvgr from "next-plugin-svgr";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 他の設定があればここに追加
};

export default withSvgr(nextConfig);
