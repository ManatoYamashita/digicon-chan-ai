import Image from "next/image";
import Sidebar from "@/components/sidebar";
import Card from "@/components/card";
import Music from "@/components/music";
import Toggle from "@/components/toggle";
import Who from "@/components/who";
import Profile from "@/components/profile";
import DCchan from "@/components/dc-chan";
import Hello from "@/components/hello";

import styles from './page.module.scss';

export default function Home() {
  return (
    <>
      <section className={styles.back}>
        <div className={styles.row}>
          <Music title="title" description="descriptionn" />
          <Card title="title" subtitle="subtitle" description="description" /> 
        </div>
        <div className={styles.row2}>
          <div className={styles.r2_column}>
            <Toggle />
            <Image src="/images/dc-logo.webp" alt="東京都市大学 デジコン" fill className={styles.logo} />
          </div>
          <Who title="title" description="description" />
          {/* <Profile title="でじこんちゃん" description="description" /> */}
        </div>
        <div className={styles.row3}>
          <Sidebar />
          <Hello
            greets={["hello", "こんにちは", "안녕하세요", "你好"]}
            title="でじこんちゃん"
          />
        </div>
      </section>
      <section className={styles.front}>
        <DCchan />
      </section>
    </>
  )
}