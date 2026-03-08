"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dela_Gothic_One } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SplitText from "@/components/SplitText";
import TiltedCard from "@/components/tilted-card";
import Folder from "@/components/folder";
import styles from "@/styles/about-page.module.scss";

import {
  profileData,
  timelineData,
  galleryImages,
  externalLinksData,
} from "@/data/about";

import TcuIcon from "@/public/images/icons/tcu-icon.svg";
import DcIcon from "@/public/images/icons/dc-icon.svg";
import XIcon from "@/public/images/icons/x-icon.svg";
import InstagramIcon from "@/public/images/icons/instagram-icon.svg";
import BskyIcon from "@/public/images/icons/bsky-icon.svg";
import DiscordIcon from "@/public/images/icons/discord-icon.svg";
import MailIcon from "@/public/images/icons/mail-icon.svg";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const delaGothicOne = Dela_Gothic_One({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
  display: "swap",
});

const iconMap: Record<string, ComponentType> = {
  tcu: TcuIcon,
  dc: DcIcon,
  x: XIcon,
  instagram: InstagramIcon,
  bsky: BskyIcon,
  discord: DiscordIcon,
  mail: MailIcon,
};

const sectionTitles = ["Profile", "History", "Gallery", "Links"] as const;

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const { folderItems, folderSrcs } = useMemo(() => {
    const picked = [galleryImages[4], galleryImages[6], galleryImages[9]];
    return {
      folderItems: picked.map((img) => (
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          sizes="80px"
          style={{ objectFit: "cover", borderRadius: "8px" }}
        />
      )),
      folderSrcs: new Set(picked.map((img) => img.src)),
    };
  }, []);

  // body class
  useEffect(() => {
    document.body.classList.add("body-about");
    return () => {
      document.body.classList.remove("body-about");
    };
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // ── Background Orbs floating animation ──
      const orbs = orbsRef.current?.querySelectorAll(`.${styles.orb}`);
      orbs?.forEach((orb, i) => {
        gsap.to(orb, {
          y: "random(-30, 30)",
          x: "random(-20, 20)",
          duration: 6 + i * 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // ── Hero initial load ──
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(orbsRef.current, { opacity: 0 }, { opacity: 1, duration: 1 }, 0);

      tl.fromTo(
        heroCardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        0.1
      );

      tl.fromTo(
        containerRef.current!.querySelector(`.${styles.heroSubtitle}`),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.8
      );

      tl.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        1.2
      );

      // ── Profile items stagger ──
      const profileItems = containerRef.current.querySelectorAll(
        `.${styles.profileItem}`
      );
      if (profileItems.length) {
        gsap.fromTo(
          profileItems,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: profileItems[0],
              start: "top bottom-=80px",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // ── Timeline items stagger ──
      const timelineItems = containerRef.current.querySelectorAll(
        `.${styles.timelineItem}`
      );
      if (timelineItems.length) {
        timelineItems.forEach((item, i) => {
          gsap.fromTo(
            item,
            { opacity: 0, x: -30, scale: 0.96 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
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
      }

      // ── Gallery items stagger ──
      const galleryItems = containerRef.current.querySelectorAll(
        `.${styles.galleryItem}`
      );
      if (galleryItems.length) {
        gsap.fromTo(
          galleryItems,
          { opacity: 0, y: 40, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: galleryItems[0],
              start: "top bottom-=60px",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // ── Link cards stagger ──
      const linkCards = containerRef.current.querySelectorAll(
        `.${styles.linkCard}`
      );
      if (linkCards.length) {
        gsap.fromTo(
          linkCards,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: linkCards[0],
              start: "top bottom-=60px",
              toggleActions: "play none none none",
            },
          }
        );
      }
    },
    { scope: containerRef }
  );

  // Helper: section title with SplitText + accent
  const SectionTitle = ({ text }: { text: string }) => (
    <div className={styles.sectionTitleWrapper}>
      <SplitText
        text={text}
        tag="h2"
        className={`${delaGothicOne.className} ${styles.sectionTitle}`}
        useScrollTrigger={true}
        duration={0.6}
        splitType="chars"
        delay={60}
        textAlign="left"
      />
      <span className={styles.sectionAccent} />
    </div>
  );

  return (
    <>
      {/* ── Background Orbs ── */}
      <div ref={orbsRef} className={styles.bgOrbs}>
        <div className={styles.orb} />
        <div className={styles.orb} />
        <div className={styles.orb} />
      </div>

      <div ref={containerRef} className={styles.container}>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div ref={heroCardRef} className={styles.heroCardWrapper}>
            <TiltedCard
              imageSrc="/images/student-card.webp"
              altText="でじこんちゃん 学生証 東京都市大学 デジタルコンテンツ研究会"
              imageWidth={740}
              imageHeight={464}
              scaleOnHover={1.05}
              rotateAmplitude={14}
            />
          </div>
          <div className={styles.heroTextBlock}>
            <DcIcon className={styles.heroIcon} />
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
          </div>
          <div ref={scrollIndicatorRef} className={styles.scrollIndicator}>
            <div className={styles.scrollLine} />
          </div>
        </section>

        {/* ── Profile ── */}
        <section className={styles.profile}>
          <SectionTitle text={sectionTitles[0]} />
          <p className={styles.profileNotice}>
          東京都市大学デジタルコンテンツ研究会の公式キャラクターです！<strong>『デジコンちゃん』</strong>じゃなくて、<strong className={styles.profileNoticeStrong}>『でじこんちゃん』</strong>だよ！！<br />
          2014年にデザインされ、無名のキャラとしてキャラクタ原案が公開。DTM班のCDのパッケージに飾られた。<br />
          現在もLINEスタンプや、会員の作品の中に登場するなど、デジコンの象徴として活躍しており、会員から愛されている。
          </p>
          <dl className={styles.profileGrid}>
            {profileData.map((item) => (
              <div key={item.label} className={styles.profileItem}>
                <dt className={styles.profileLabel}>{item.label}</dt>
                <dd className={styles.profileValue}>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Folder ── */}
        <section className={styles.folderSection}>
          <Folder size={3} color="#06C0FF" items={folderItems} href="https://youtu.be/jOkLO_n1SgY" />
        </section>

        {/* ── Timeline ── */}
        <section className={styles.timeline}>
          <SectionTitle text={sectionTitles[1]} />
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
          <SectionTitle text={sectionTitles[2]} />
          <div className={styles.galleryGrid}>
            {galleryImages.filter((img) => !folderSrcs.has(img.src)).map((img) => (
              <div
                key={img.src}
                className={styles.galleryItem}
                onClick={() => setLightboxSrc(img.src)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className={styles.galleryImg}
                />
                <div className={styles.galleryCaption}>
                  <span className={styles.galleryCaptionText}>{img.alt}</span>
                </div>
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
          <SectionTitle text={sectionTitles[3]} />
          <div className={styles.linksGrid}>
            {externalLinksData.map(({ href, label, iconKey }) => {
              const Icon = iconMap[iconKey];
              return (
                <Link
                  key={href}
                  href={href}
                  className={styles.linkCard}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                >
                  {Icon && <Icon />}
                  {label}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
