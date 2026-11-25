// 一覧表示用の縮小版（サムネイル）を元画像から作る。
//
// 画像最適化を next.config.ts で無効にしている（#48）ので、next/image は srcset を出さず、
// 元ファイルがそのまま配信される。元ファイルはライトボックスやズームで大きく見せるために
// 長辺 1600px 前後を保っているが、/about のギャラリーのマスや / の Card は数百 px しかない。
// そこで「小さく表示する場所」専用の縮小版をここで作り、元ファイルは拡大表示用に残す。
//
//   pnpm images:thumbs          作る（既存のものは上書き）
//   pnpm images:thumbs --dry    書き込まず、何がどう変わるかだけ出す
//
// 幅は「表示される最大の CSS 幅 × 2（DPR 2 の画面）」から決めている。object-fit: cover の
// 画像は、マスより縦長・横長でも幅で決まることを実測で確かめた（下の各定数のコメント）。
// レイアウトや並び順を変えたら、表示幅を測り直してここの幅を直すこと。

import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("../public/images/", import.meta.url).pathname;
// イラストは低い品質だと帯が出る。resize-images.mjs と同じ 85 に揃える
const QUALITY = 85;
const DRY = process.argv.includes("--dry");

// /about ギャラリーの通常のマス（1 枚目と 5 枚目以外）。幅 320〜1920 を 16px 刻みで測ると、
// 最大は幅 768px（2 列）のときの 362×180 CSS px。全画像とも幅側で決まる（マスの縦横比 2.0 が
// どの画像よりも横長）。ホバー時の scale(1.03) を含めて 2 倍すると 746px なので 752px にする。
// 1 枚目（2 列 × 2 行）と 5 枚目（2 列）は 2 倍にすると元画像の幅を超えるので、元のまま使う。
const GALLERY_CELL_WIDTH = 752;

// / の Music のジャケット。幅 480px 以下では横いっぱいに広がり、最大 216×80 CSS px
// （幅 480px のとき）。それより広い画面では 80×80。2 倍して 440px にする。
const JACKET_WIDTH = 440;

const TARGETS = [
  // ギャラリー（data/about.ts の thumb）。/ の Card も yc の縮小版を srcset の小さい候補に使う
  ...["ad.webp", "identity-photo.webp", "yc.webp", "dcchan-square.webp", "dcchan-3d.webp",
      "friends.webp", "farewel-dc-2023.webp", "dcchan-loli.jpg"].map((name) => ({
    src: `gallery/${name}`,
    out: `gallery/thumbs/${name.replace(/\.[^.]+$/, ".webp")}`,
    width: GALLERY_CELL_WIDTH,
  })),
  // components/music.tsx のジャケット
  { src: "gallery/cover.webp", out: "gallery/thumbs/cover-jacket.webp", width: JACKET_WIDTH },
];

const kb = (n) => (n / 1024).toFixed(0).padStart(4) + "KB";

for (const { src, out, width } of TARGETS) {
  const input = join(ROOT, src);
  const output = join(ROOT, out);
  const meta = await sharp(input, { animated: true }).metadata();
  if ((meta.pages ?? 1) > 1) {
    // アニメーションを 1 フレーム目に潰す事故を避ける（#30）。対象に入れないこと
    throw new Error(`${src} はアニメーション（${meta.pages} フレーム）なので縮小版を作らない`);
  }
  if (meta.width <= width) {
    throw new Error(`${src} は幅 ${meta.width}px で ${width}px 以下。縮小版は要らないので対象から外す`);
  }

  const buf = await sharp(input)
    // EXIF の向きを画素に反映する（縮小版ではメタデータを落とすため）
    .rotate()
    .resize({ width, withoutEnlargement: true })
    // 色域が sRGB 以外でも元と同じ見た目になるよう、ICC プロファイルを引き継ぐ
    .keepIccProfile()
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer();
  const outMeta = await sharp(buf).metadata();

  const size = (await stat(input)).size;
  console.log(`  ${DRY ? "作る予定" : "作った  "}  ${out}  ${meta.width}x${meta.height} → ${outMeta.width}x${outMeta.height}  ${kb(size)} → ${kb(buf.length)}`);
  if (!DRY) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, buf);
  }
}
