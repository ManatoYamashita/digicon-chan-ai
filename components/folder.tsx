"use client";

import { useId, useRef, useState } from "react";
import styles from "@/styles/folder.module.scss";

type FolderProps = {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  href?: string;
  /** 開閉ボタンのアクセシブル名。開閉の状態は aria-expanded が伝えるので、ここには含めない */
  label?: string;
  /** 紙のリンクのアクセシブル名。href を渡すときは一緒に渡す */
  linkLabel?: string;
};

function darkenColor(hex: string, percent: number): string {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

/** フォルダに入る紙の枚数。呼び出し側が渡す items もこの数に揃える */
export const MAX_FOLDER_ITEMS = 3;

export default function Folder({
  color = "#5227FF",
  size = 1,
  items = [],
  className = "",
  href,
  label = "フォルダ",
  linkLabel,
}: FolderProps) {
  const papers: (React.ReactNode | null)[] = items.slice(0, MAX_FOLDER_ITEMS);
  // 紙は同じ z-index なので、DOM の後ろにあるものほど手前に来る。
  // 中身のある紙のうち最後のものが最前面
  const primaryIndex = papers.length - 1;
  while (papers.length < MAX_FOLDER_ITEMS) {
    papers.push(null);
  }

  const papersId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState(
    Array.from({ length: MAX_FOLDER_ITEMS }, () => ({ x: 0, y: 0 }))
  );

  const folderBackColor = darkenColor(color, 0.08);
  const paper1 = darkenColor("#ffffff", 0.1);
  const paper2 = darkenColor("#ffffff", 0.05);
  const paper3 = "#ffffff";

  const toggle = () => {
    setOpen((prev) => !prev);
    if (open) {
      setPaperOffsets(
        Array.from({ length: MAX_FOLDER_ITEMS }, () => ({ x: 0, y: 0 }))
      );
      // 閉じると紙は支援技術から隠れる。中にフォーカスが残らないようボタンへ戻す。
      // Safari はボタンを押してもフォーカスを当てないので、明示的に呼ぶ
      toggleRef.current?.focus();
    }
  };

  // 紙は href の有無で div にも a にもなるので、両方を受けられる HTMLElement で受ける
  const handlePaperMouseMove = (
    e: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (index: number) => {
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  const folderStyle = {
    "--folder-color": color,
    "--folder-back-color": folderBackColor,
    "--paper-1": paper1,
    "--paper-2": paper2,
    "--paper-3": paper3,
  } as React.CSSProperties;

  return (
    <div style={{ transform: `scale(${size})` }} className={className}>
      <div
        className={`${styles.folder} ${open ? styles.open : ""}`}
        style={folderStyle}
      >
        {/*
          開閉はこの透明なボタンが受ける。フォルダの絵に重ねてあるだけで、紙は中に入っていない。
          role="button" の div で全体を包むと、中の a が button の子孫になり
          (axe-core の nested-interactive)、Enter の扱いも自前で書く羽目になる (#38)
        */}
        <button
          type="button"
          ref={toggleRef}
          className={styles.toggle}
          onClick={toggle}
          aria-expanded={open}
          aria-controls={papersId}
          aria-label={label}
        />
        <div className={styles.folderBack} id={papersId}>
          {papers.map((item, i) => {
            const paperProps = {
              className: styles.paper,
              onMouseMove: (e: React.MouseEvent<HTMLElement>) =>
                handlePaperMouseMove(e, i),
              onMouseLeave: () => handlePaperMouseLeave(i),
              style: open
                ? ({
                    "--magnet-x": `${paperOffsets[i]?.x || 0}px`,
                    "--magnet-y": `${paperOffsets[i]?.y || 0}px`,
                  } as React.CSSProperties)
                : {},
            };

            // href があるときは中身をリンクにする。a 要素にすると、キーボード操作・
            // 新しいタブで開く・リンク先の確認がブラウザの機能でそのまま使える。
            // 中身の無い紙 (MAX_FOLDER_ITEMS まで埋めた分) はリンクにしない
            if (href && item) {
              // 3枚とも同じ行き先なので、支援技術へ見せるのは最前面の1枚だけにする。
              // 残り2枚は装飾として隠すが、href は持ったままなのでマウスでは今までどおり開ける。
              // 閉じているあいだは紙が前板の裏に隠れるので、1枚目も隠す (aria-expanded と揃える)
              const exposed = i === primaryIndex && open;
              return (
                <a
                  key={i}
                  {...paperProps}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={exposed ? 0 : -1}
                  aria-hidden={exposed ? undefined : true}
                  aria-label={exposed ? linkLabel : undefined}
                >
                  {item}
                </a>
              );
            }

            return (
              <div key={i} {...paperProps}>
                {item}
              </div>
            );
          })}
          <div className={styles.folderFront} />
          <div className={`${styles.folderFront} ${styles.right}`} />
        </div>
      </div>
    </div>
  );
}
