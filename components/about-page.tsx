"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SplitText from "@/components/SplitText";
import styles from "@/styles/about-page.module.scss";

import TcuIcon from "@/public/images/tcu-icon.svg";
import DcIcon from "@/public/images/dc-icon.svg";
import XIcon from "@/public/images/x-icon.svg";
import InstagramIcon from "@/public/images/instagram-icon.svg";
import BskyIcon from "@/public/images/bsky-icon.svg";
import DiscordIcon from "@/public/images/discord-icon.svg";
import MailIcon from "@/public/images/mail-icon.svg";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ── Data ──

const profileData = [
  { label: "名前", value: "でじこんちゃん" },
  { label: "誕生日", value: "2014年6月4日" },
  { label: "所属", value: "東京都市大学 デジタルコンテンツ研究会" },
  { label: "役職", value: "副会長" },
  { label: "デザイン", value: "あいしろ" },
  { label: "好きなこと", value: "お絵描き、ゲーム、プログラミング" },
];

const timelineData = [
  {
    year: "2014",
    title: "誕生",
    text: "デジタルコンテンツ研究会の公式キャラクターとして誕生。初代デザインは当時の部員によって描かれた。",
  },
  {
    year: "2020",
    title: "リデザイン",
    text: "あいしろ氏によって現在のデザインにリニューアル。より親しみやすく、現代的なビジュアルに生まれ変わった。",
  },
  {
    year: "2021",
    title: "3Dモデル化",
    text: "3Dモデルが制作され、活動の幅が広がった。学園祭やイベントでの展示にも活用されるようになった。",
  },
  {
    year: "2022",
    title: "アニメーション制作",
    text: "でじこんちゃんを主役としたショートアニメーションが制作された。研究会の技術力を結集した作品となった。",
  },
  {
    year: "現在",
    title: "AIコンシェルジュ",
    text: "Gemini APIを搭載したAIコンシェルジュとして、このWebサイト上で皆さんとお話できるようになった。",
  },
];

const galleryImages = [
  { src: "/images/dcchan.webp", alt: "でじこんちゃん メインビジュアル" },
  { src: "/images/dcchan-prof.webp", alt: "でじこんちゃん プロフィール" },
  { src: "/images/dcchan-3d.webp", alt: "でじこんちゃん 3Dモデル" },
  { src: "/images/dcchan-with-friends.webp", alt: "でじこんちゃん フレンズ" },
  { src: "/images/dcchan-studentcard.webp", alt: "でじこんちゃん 学生証" },
  { src: "/images/cDesign-for-anime.webp", alt: "アニメ用キャラクターデザイン" },
  { src: "/images/jacket.webp", alt: "ジャケット" },
  { src: "/images/dc-image.webp", alt: "デジコン イメージ" },
];

const externalLinks = [
  { href: "https://www.tcu.ac.jp", label: "TCU", icon: TcuIcon },
  { href: "https://tcu-dc.net", label: "TCU-DC", icon: DcIcon },
  { href: "https://x.com/tcu_dc_bot22", label: "X", icon: XIcon },
  { href: "https://instagram.com/manapuraza_com", label: "Instagram", icon: InstagramIcon },
  { href: "https://bsky.app/profile/tcudc.bsky.social", label: "Bluesky", icon: BskyIcon },
  { href: "https://tcu-dc.net/joinus", label: "Discord", icon: DiscordIcon },
  { href: "mailto:g2172117@tcu.ac.jp", label: "Mail", icon: MailIcon },
];

// ── Component ──

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // body class
  useEffect(() => {
    document.body.classList.add("body-about");
    return () => {
      document.body.classList.remove("body-about");
    };
  }, []);

  // GSAP ScrollTrigger for timeline items
  useGSAP(
    () => {
      const items = containerRef.current?.querySelectorAll(`.${styles.timelineItem}`);
      if (!items?.length) return;

      items.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top bottom-=80px",
              toggleActions: "play none none none",
            },
            delay: i * 0.05,
          }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={styles.container}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <Image
          src="/images/dcchan-prof.webp"
          alt="でじこんちゃん"
          width={180}
          height={180}
          className={styles.heroImage}
          priority
        />
        <SplitText
          text="でじこんちゃん"
          tag="h1"
          className={styles.heroTitle}
          useScrollTrigger={false}
          initialDelay={0.3}
          duration={0.8}
          splitType="chars"
          delay={80}
        />
        <p className={styles.heroSubtitle}>
          東京都市大学 デジタルコンテンツ研究会
          <br />
          公式キャラクター
        </p>
      </section>

      {/* ── Profile ── */}
      <section className={`${styles.glassCard} ${styles.profile}`}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div className={styles.profileNotice}>
          &#x26A0; &quot;デジコンちゃん&quot;じゃなくて、&quot;でじこんちゃん&quot;だよ！！
        </div>
        <div className={styles.profileGrid}>
          {profileData.map((item) => (
            <div key={item.label} className={styles.profileItem}>
              <span className={styles.profileLabel}>{item.label}</span>
              <span className={styles.profileValue}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className={styles.studentCard}>
          <Image
            src="/images/dcchan-studentcard.webp"
            alt="でじこんちゃん 学生証"
            width={320}
            height={200}
            className={styles.studentCardImg}
          />
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className={styles.timeline}>
        <h2 className={styles.sectionTitle}>History</h2>
        <div className={styles.timelineList}>
          {timelineData.map((item) => (
            <div key={item.year} className={styles.timelineItem}>
              <div className={styles.timelineYear}>{item.year}</div>
              <div className={styles.timelineTitle}>{item.title}</div>
              <div className={styles.timelineText}>{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className={styles.gallery}>
        <h2 className={styles.sectionTitle}>Gallery</h2>
        <div className={styles.galleryGrid}>
          {galleryImages.map((img) => (
            <div
              key={img.src}
              className={styles.galleryItem}
              onClick={() => setLightboxSrc(img.src)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={400}
                className={styles.galleryImg}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            className={styles.lightboxOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxSrc(null)}
          >
            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxSrc}
                alt="拡大表示"
                className={styles.lightboxImg}
              />
              <button
                className={styles.lightboxClose}
                onClick={() => setLightboxSrc(null)}
                aria-label="閉じる"
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Links ── */}
      <section className={styles.links}>
        <h2 className={styles.sectionTitle}>Links</h2>
        <div className={styles.linksGrid}>
          {externalLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={styles.linkCard}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
