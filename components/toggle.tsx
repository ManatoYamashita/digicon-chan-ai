import styles from "@/styles/toggle.module.scss"

function Toggle() {
    return (
        <section>
            <label className={styles.switch}>
                <input className={styles.input} type="checkbox" aria-label="Toggle switch" />
                <span className={styles.slider}></span>
            </label>
        </section>
    );
}

export default Toggle;