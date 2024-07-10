import Image from "next/image";
import styles from '@/styles/likeLP.module.scss';
import img3d from '@/public/images/dcchan-3d.webp';
import Link from "next/link";

export default function LikeLP( { title, subtitle, button }: { title: string, subtitle: string, button: string }) {
  return (
        <div className={styles.landingPage}>

            <h1 className={styles.h1}>{ title }</h1>
            <div className={styles.content}>
                <div className={styles.container}>
                    <div className={styles.info}>
                        <h2 className={styles.h2}>{ subtitle }</h2>
                        <p className={styles.p}>
                        <em className={styles.em}>東京都市大学デジタルコンテンツ研究会</em> の公式キャラクターである。<br />
                        <strong>2014年</strong>に当時のイラスト班会員である&ldquo;<code>あいしろ</code>&ldquo;氏によってデザインされ、
                        無名のキャラとしてキャラクタ原案が公開。DTM班のCDのパッケージに飾られた。<br />
                        </p>
                        <p className={styles.p}>
                            <strong>2020年</strong>に&ldquo;<code>Garnet氏</code>&ldquo;と&ldquo;<code>ほし氏</code>&ldquo;によって3Dモデリングが行われ、<strong>2021年</strong>にヴァーチャルキャラクタとして公式キャラクタとしての位置を確立させた。
                            <strong>2022年</strong>に書類上当時の声優であった&ldquo;<code>カップ焼きそば食べたい</code>&ldquo;を副会長に任命することで、本格的にでじこんちゃんをキャラクタとしてPR。声優を&ldquo;<code>Garnet氏</code>&ldquo;(ver1.0), &ldquo;<code>カップ焼きそば食べたい</code>&ldquo;(ver2.0), &ldquo;<code>聖乳くるみ</code>&ldquo;(ver3.0)が担当し、Xアカウントによる広報、グッズ化やアニメ化(キャラクタデザイン: <code>&ldquo;山下マナト&ldquo;</code>, <code>&ldquo;Shika&ldquo;</code>)などを行った。
                            なお、誕生日は<em className={styles.em}>2014年6月4日</em>と決定されたのもこの頃で、&ldquo;<code>Garnet</code>氏&ldquo;によると、「デジコンのロゴから由来している」という。
                        </p>
                        <p className={styles.p}>
                            現在もLINEスタンプや、作品の中に登場するなど、デジコンの象徴として活躍しており、会員から愛されている。
                        </p>
                        <button className={styles.button} type="button" >
                            <Link href="/talk" >
                                { button }
                            </Link>
                        </button>
                    </div>
                    <div className={styles.image}>
                        <Image 
                            src={img3d}
                            alt="でじこんちゃん"
                            className={styles.img}
                            priority
                            style={{ objectFit: 'cover' }}
                            fill
                            sizes="100vw"
                        />
                    </div>
                </div>
            </div>
        </div>
  );
}