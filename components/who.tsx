import Link from "next/link";
import Image from "next/image";
import styles from"@/styles/who.module.scss";

type Props = {
    title: string,
    description: string
}

function Who({title, description}: Props) {
    return (
        <div className={styles.who}>
            <div className={styles.image_container}>
                <Image src="/images/example.jpg" 
                    className={styles.image}
                    alt="でじこんちゃん プロフィール"
                    layout="fill"
                    objectFit="cover"
                    sizes="(max-width: 480px) 30vw, (max-width: 1000px) 10vw"
                />
            </div>
            <section className={styles.detail}>
                <div className={styles.title}>
                    <span>{ title }</span>
                </div>
                <div className={styles.size}>
                    <span>{ description }</span>
                </div>
                <div className={styles.action}>
                    <div className={styles.btnarea}>
                        <button type="button" className={styles.button}>ver1.0</button>
                        <button type="button" className={styles.button}>ver2.0</button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Who;