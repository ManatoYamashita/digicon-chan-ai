"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import styles from "@/styles/menu.module.scss";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  // 渡した文字列は React.addTransitionType 経由で
  // document.startViewTransition({ types }) へ届き、styles/globals.css の
  // :root:active-view-transition-type() で掴める。演出を出したい遷移にだけ付ける
  transitionTypes?: string[];
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "About",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Chat",
    // / の立ち絵が左へ抜ける演出は、/chat へ向かうときだけ走らせる。
    // vt-dcchan は / にしか無い名前なので、種別で絞らないと / から離れる
    // どの遷移でも old だけのグループができて退出アニメが走る (#42)
    transitionTypes: ["to-chat"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function Menu() {
  const pathname = usePathname();

  return (
    // 視差効果を減らす設定のときは、インジケーターの移動や拡大縮小をやめる
    <MotionConfig reducedMotion="user">
      {/* ピルバー（画面幅によらずこれだけを使う） */}
      <nav className={styles.pillBar} style={{ viewTransitionName: "menu-pill" }}>
        {navItems.map(({ href, label, icon, transitionTypes }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.pillItem} ${pathname === href ? styles.pillActive : ""}`}
            aria-current={pathname === href ? "page" : undefined}
            transitionTypes={transitionTypes}
          >
            {pathname === href ? (
              <motion.span
                className={styles.pillActiveIndicator}
                layoutId="mobile-nav-indicator"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            ) : null}
            {icon}
            {/* 狭い横向きの /chat ではアイコンだけにし、ラベルは読み上げ名として残す (#71) */}
            <span className={styles.pillLabel}>{label}</span>
          </Link>
        ))}
      </nav>
    </MotionConfig>
  );
}
