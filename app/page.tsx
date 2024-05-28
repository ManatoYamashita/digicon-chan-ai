import Sidebar from "@/components/sidebar";
import Card from "@/components/card";
import Music from "@/components/music";
import Toggle from "@/components/toggle";
import Who from "@/components/who";
import Profile from "@/components/profile";

import styles from './page.module.scss';

export default function Home() {
  return (
    <>
      <section className={styles.container}>
        <div className={styles.row}>
          <Music title="title" description="descriptionn" />
          <Card title="title" subtitle="subtitle" description="description" /> 
        </div>
        <div className={styles.row2}>
          <Toggle />
          <Who title="title" description="description" />
          {/* <Profile title="でじこんちゃん" description="description" /> */}
        </div>
        <div className={styles.row3}>
          <Sidebar />
        </div>
      </section>
    </>
  )
}