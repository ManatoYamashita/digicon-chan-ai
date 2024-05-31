import styles from "@/styles/hello.module.scss"


type Props = {
    greets: string[];
    title: string;
}

function Hello({greets, title}: Props) {

    return (
        <section className={styles.hello}>
            <div className={styles.alowbox}>
                <div className={styles.container}>
                    <ul className={styles.greets}>
                        {greets.map((greet: string, index: number) => (
                            <li className={styles.greet} key={index}>{ greet }</li>
                        ))}
                    </ul>
                </div>
                <span>！</span>
            </div>
            <h1 className={styles.title}>{ title }<span className={styles.desu}>ですっ！</span></h1>

        </section>
    );
}

export default Hello;