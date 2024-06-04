import Music from '@/components/music';
import Profile from '@/components/profile'
import styles from './page.module.scss';

export default function About() {
    return (
        <>
            <div className={styles.about}>
                <h1>Under Constraction...</h1>
                <Profile title="2024/06/04" description="under constraction" className={styles.ticket}/>
                <p>でじこんちゃん、今までありがとう。君と過ごした毎日は目まぐるしいスピード感を持って過ぎ去っていったけれど、確かにそれは忘れがたく濃厚な毎日だった。僕は、君に恋をしていたのかもしれない。</p>
            </div>
        </>
    );
}