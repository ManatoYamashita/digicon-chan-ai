"use client";

import { useState } from "react";
import styles from "@/styles/folder.module.scss";

type FolderProps = {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  href?: string;
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

const MAX_ITEMS = 3;

export default function Folder({
  color = "#5227FF",
  size = 1,
  items = [],
  className = "",
  href,
}: FolderProps) {
  const papers: (React.ReactNode | null)[] = items.slice(0, MAX_ITEMS);
  while (papers.length < MAX_ITEMS) {
    papers.push(null);
  }

  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState(
    Array.from({ length: MAX_ITEMS }, () => ({ x: 0, y: 0 }))
  );

  const folderBackColor = darkenColor(color, 0.08);
  const paper1 = darkenColor("#ffffff", 0.1);
  const paper2 = darkenColor("#ffffff", 0.05);
  const paper3 = "#ffffff";

  const toggle = () => {
    setOpen((prev) => !prev);
    if (open) {
      setPaperOffsets(
        Array.from({ length: MAX_ITEMS }, () => ({ x: 0, y: 0 }))
      );
    }
  };

  // クリックでもキーボードでも開閉できるようにする。div のままだと Tab で到達できず、
  // 中身のリンクにキーボードだけでは辿り着けない
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
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
        onClick={toggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={open ? "フォルダを閉じる" : "フォルダを開く"}
      >
        <div className={styles.folderBack}>
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
            // 中身の無い紙 (MAX_ITEMS まで埋めた分) はリンクにしない
            if (href && item) {
              return (
                <a
                  key={i}
                  {...paperProps}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  // 閉じているときは紙が隠れるので、Tab で止まらないようにする
                  tabIndex={open ? 0 : -1}
                  // 親のクリックまで伝わると、リンクを開くと同時にフォルダが閉じてしまう
                  onClick={(e) => e.stopPropagation()}
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
