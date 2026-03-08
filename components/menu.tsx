"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "@/styles/menu.module.scss";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
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
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      <div className={styles.fab} style={{ viewTransitionName: "menu-fab" }}>
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              className={styles.menu}
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {navItems.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.link} ${pathname === href ? styles.active : ""}`}
                  onClick={close}
                >
                  {pathname === href ? (
                    <motion.span
                      className={styles.activeIndicator}
                      layoutId="desktop-nav-indicator"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  {icon}
                  {label}
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        <motion.button
          className={styles.trigger}
          onClick={toggle}
          whileTap={{ scale: 0.9 }}
          aria-label="メニューを開く"
          aria-expanded={isOpen}
        >
          <span className={styles.hamburger} data-open={isOpen} />
        </motion.button>
      </div>

      {/* Mobile pill bar */}
      <nav className={styles.pillBar} style={{ viewTransitionName: "menu-pill" }}>
        {navItems.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.pillItem} ${pathname === href ? styles.pillActive : ""}`}
          >
            {pathname === href ? (
              <motion.span
                className={styles.pillActiveIndicator}
                layoutId="mobile-nav-indicator"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            ) : null}
            {icon}
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
