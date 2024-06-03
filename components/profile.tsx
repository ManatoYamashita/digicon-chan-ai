import Image from "next/image";
import styles from "@/styles/profile.module.scss";

type Props = {
    title: String,
    description: String,
    className?: string
}

function Profile({ title, description, className }: Props) {
    return (
        <section className={className}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.h2}>{ title }</h2>
                    <p className={styles.p}>{ description }</p>
                    <div className={styles.pic}>
                        <Image 
                            src="/images/dc-loli.jpg"
                            alt="Picture of the author"
                            fill
                            sizes="(max-width: 480px) 100px, (max-width: 768px) 150px, (max-width: 1024px) 200px, 250px"
                            className={styles.profileImg}
                        />
                    </div>
                    <ul className={styles.ul}>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                        <li className={styles.li}></li>
                    </ul>
                    <div className={styles.logo}>
                        <Image
                            src="/images/dc-logo.webp"
                            alt="デジタルコンテンツ研究会 ロゴ"
                            width={250}
                            height={50}
                            className={styles.logoImg}
                        />
                    </div>
                    <span className={styles.span}></span>
                </div>
            </div>
        </section>
    );
}

export default Profile;