import styles from './page.module.scss';
// import Ticket from '@/components/ticket';
import LikeLP from '@/components/likeLP';

export default function About() {
    return (
        <>
            <div className={styles.about}>
                {/* <Ticket title="2024/06/04" description="under constraction" className={styles.ticket}/> */}
                <LikeLP
                    title='"でじこんちゃん"について'
                    subtitle='About DC-chan'
                    button='おしゃべりする'
                />
            </div>
        </>
    );
}