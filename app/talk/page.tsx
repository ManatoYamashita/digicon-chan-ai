import Chat from "@/components/chat"
import styles from './page.module.scss';

export default function Talk() {
    return (
        <>
            <div className={styles.talk}>
                <Chat />
            </div>
        </>
    )
}