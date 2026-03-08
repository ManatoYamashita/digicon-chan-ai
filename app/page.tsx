import { ViewTransition } from "react";
import Image from "next/image";
import Sidebar from "@/components/sidebar";
import Card from "@/components/card";
import Music from "@/components/music";
import Toggle from "@/components/toggle";
import Sounds from "@/components/sounds";
import Hello from "@/components/hello";
import DCchan from "@/components/dc-chan";
import PageAnimations from "@/components/page-animations";
import styles from './page.module.scss';

export default function Home() {
  return (
    <PageAnimations>
      <ViewTransition exit="vt-home-exit" default="none">
        <section id="home" className={styles.back}>

          <div className={styles.row} data-animate="r1">
            <Music title="DeskTop Musics" description="Kunimaly feat:でじこんちゃん(ver0)" />
            <Card title="Graphics" subtitle="Illu/Anime/Design: 山下マナト" description="WebDesignはこちらのtweetを元にしています。" />
          </div>

          <div className={styles.row2} data-animate="r2">
            <div className={styles.r2_column}>
              <Toggle />
              <Image
                src="/images/dc-logo.webp"
                alt="都市大 デジコン"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.logo}
              />
            </div>
            <Sounds title="DC-chan" description="Press to listen to voices." />
          </div>

          <div className={styles.row3} data-animate="r3">
            <Sidebar />
            <Hello
              greets={["Hello", "こんにちは", "안녕하세요", "你好"]}
              msg1="東京都市大学 デジタルコンテンツ研究会"
              msg2="公式ヴァーチャルコンシェルジュの..."
              title="でじこんちゃん"
            />
          </div>
        </section>
      </ViewTransition>

      <ViewTransition exit="vt-dcchan-exit" default="none">
        <section id="dc-chan" className={styles.front}>
          <div data-animate="r4">
            <DCchan />
          </div>
        </section>
      </ViewTransition>
    </PageAnimations>
  );
}
