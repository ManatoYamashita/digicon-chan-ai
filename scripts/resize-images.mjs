// public/images 配下の「静止画で、表示サイズに対して大きすぎる」画像を縮めて再圧縮する。
//
// 画像最適化を next.config.ts で無効にしている（#48）ので、配信されるのは常にこの元ファイル。
// そのため、元ファイル自体が表示サイズに見合っている必要がある。
//
//   pnpm images:resize          縮めて上書きする
//   pnpm images:resize --dry    変更せず、何がどう変わるかだけ出す
//
// アニメーション WebP（立ち絵とアイコン）は対象外。sharp は既定で 1 フレーム目しか読まず、
// 気付かないままフレームが潰れる（#30）。ここでは触らないことで事故の余地をなくしている。

import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { join, extname, relative } from "node:path";
import sharp from "sharp";

const ROOT = new URL("../public/images/", import.meta.url).pathname;
// ギャラリーのライトボックスは最大 90vw × 85vh。長辺 1600px あれば 1440 幅の画面まで破綻しない。
const MAX_EDGE = 1600;
// イラストは低い品質だと帯が出る。85 なら元の 8 割を削りつつ見分けが付かない（#48 で実測）
const QUALITY = 85;
// 1KB 単位の削減のために差分を作らない。意味のある削減があるものだけ差し替える
const MIN_SAVING = 8 * 1024;
const DRY = process.argv.includes("--dry");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if ([".webp", ".jpg", ".jpeg", ".png"].includes(extname(entry.name).toLowerCase())) yield p;
  }
}

const kb = (n) => (n / 1024).toFixed(0).padStart(5) + "KB";
let before = 0, after = 0, changed = 0, skipped = 0;

for await (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  const size = (await stat(file)).size;
  before += size;

  const input = await readFile(file);
  const meta = await sharp(input, { animated: true }).metadata();

  if ((meta.pages ?? 1) > 1) {
    // アニメーションは対象外。フレームを落とす事故を構造的に避ける
    after += size;
    skipped++;
    console.log(`  とばす    ${rel}  (${meta.pages} フレームのアニメーション)`);
    continue;
  }

  const longEdge = Math.max(meta.width, meta.height);
  const pipeline = sharp(input);
  if (longEdge > MAX_EDGE) {
    pipeline.resize({
      width: meta.width >= meta.height ? MAX_EDGE : undefined,
      height: meta.height > meta.width ? MAX_EDGE : undefined,
      withoutEnlargement: true,
    });
  }
  const ext = extname(file).toLowerCase();
  const out = await (ext === ".png"
    ? pipeline.png({ compressionLevel: 9 })
    : ext === ".webp"
      ? pipeline.webp({ quality: QUALITY, effort: 6 })
      : pipeline.jpeg({ quality: QUALITY, mozjpeg: true })
  ).toBuffer();

  const newMeta = await sharp(out).metadata();

  if (size - out.length < MIN_SAVING) {
    after += size;
    skipped++;
    const why = out.length >= size ? "縮めても小さくならない" : `削減 ${kb(size - out.length).trim()} だけなので据え置き`;
    console.log(`  そのまま  ${rel}  (${why})`);
    continue;
  }

  after += out.length;
  changed++;
  const dim = `${meta.width}x${meta.height} → ${newMeta.width}x${newMeta.height}`;
  console.log(`  ${DRY ? "縮める予定" : "縮めた  "}  ${rel}  ${dim}  ${kb(size)} → ${kb(out.length)}`);
  if (!DRY) await writeFile(file, out);
}

console.log("");
console.log(`  変更 ${changed} 件 / 据え置き ${skipped} 件`);
console.log(`  合計 ${(before / 1024 / 1024).toFixed(2)}MB → ${(after / 1024 / 1024).toFixed(2)}MB` +
            `（${(100 * (1 - after / before)).toFixed(0)}% 減）${DRY ? "  ※ --dry なので書き込んでいない" : ""}`);
