import Image from "next/image";
import styles from "@/styles/card.module.scss";
import Link from "next/link";

function Card() {
    return (
        <section>
            <Link href="" className={styles.card}>
                <Image src="/images/example.jpg" className={styles.card__image} alt="cover image" width={300} height={300} />
                <div className={styles.card__overlay}>
                    <div className={styles.card__header}>
                        <svg className={styles.card__arc} xmlns="http://www.w3.org/2000/svg"><path /></svg>                     
                        <Image className={styles.card__thumb} src="/images/example.jpg" alt="icon image" width={100} height={100} />
                        <div className={styles.card__header_text}>
                            <h3 className={styles.card__title}>Jessica Parker</h3>            
                            <span className={styles.card__status}>1 hour ago</span>
                        </div>
                    </div>
                    <p className={styles.card__description}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, blanditiis?</p>
                </div>
            </Link>
        </section>
    );
}

export default Card;