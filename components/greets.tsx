import styles from "@/styles/greets.module.scss"

type Props = {
    greets: string[] | string;  // 配列の添字は4つまで
}

function Greets({ greets }: Props) {
    const ulClassName = Array.isArray(greets) ? styles.greets : `${styles.greets} ${styles.noAnimation}`;

    return (
        <section className={styles.wrap}>
            <div className={styles.alowbox}>
                <div className={styles.container}>
                    <ul className={ulClassName}>
                        {Array.isArray(greets) ? greets.map((greet: string, index: number) => (
                            <li className={styles.greet} key={index}>{ greet }</li>
                        )) : <li className={styles.msg}>{ greets }</li>
                        }
                    </ul>
                </div>
                <span>！</span>
            </div>
        </section>
    );
}

export default Greets;
