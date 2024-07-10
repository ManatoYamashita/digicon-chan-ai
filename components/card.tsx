import Image from "next/image";
import styles from "@/styles/card.module.scss";
import Link from "next/link";

import headImg from "@/public/images/yc.webp";
import iconImg from "@/public/images/dcchan-with-friends.webp";

type Props = {
    title: string
    subtitle: string
    description: string
}

function Card({ title, subtitle, description }: Props) {
    return (
        <section className={styles.card}>
            <Link href="" className={styles.container}>
                <Image src={headImg} className={styles.card__image} alt="cover image" fill sizes="(max-width: 480px) 100vw, (max-width: 1000px) 50vw" priority />
                <div className={styles.card__overlay}>
                    <div className={styles.card__header}>
                        <svg className={styles.card__arc} xmlns="http://www.w3.org/2000/svg"><path /></svg>                     
                        <Image className={styles.card__thumb} src={iconImg} alt="icon image" width={100} height={100} />
                        <div className={styles.card__header_text}>
                            <h3 className={styles.card__title}>
                                { title }
                            </h3>            
                            <span className={styles.card__status}>
                                { subtitle }
                            </span>
                        </div>
                    </div>
                    <p className={styles.card__description}>
                        { description }
                    </p>
                </div>
            </Link>
        </section>
    );
}

export default Card;