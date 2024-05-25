import Sidebar from "@/components/sidebar";
import Card from "@/components/card";
import Music from "@/components/music";
import Profile from "@/components/profile";

import styles from './page.module.scss';
import sideBarStyle from '@/styles/sidebar.module.scss';
import cardStyle from '@/styles/card.module.scss';
import musicStyle from '@/styles/music.module.scss';
import profileStyle from '@/styles/profile.module.scss';

export default function Home() {
  return (
    <>
      <section className={styles.container}>
        <div className={styles.row}>
          <Music title="title" description="descriptionn" className={musicStyle.music} />
          <Card title="title" subtitle="subtitle" description="description" clsasName={cardStyle.card} /> 
        </div>
        <Sidebar className={sideBarStyle.sidebar} />
        {/* <Profile title="でじこんちゃん" description="description" className={profileStyle.profile} /> */}
      </section>
    </>
  )
}