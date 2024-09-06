import Link from "next/link";
import styles from "@/styles/sidebar.module.scss";

import TcuIcon from "@/public/images/tcu-icon.svg";
import DcIcon from "@/public/images/dc-icon.svg";
import XIcon from "@/public/images/x-icon.svg";
import InstagramIcon from "@/public/images/instagram-icon.svg";
import BskyIcon from "@/public/images/bsky-icon.svg";
import DiscordIcon from "@/public/images/discord-icon.svg";
import MailIcon from "@/public/images/mail-icon.svg";

function Sidebar() {
    return (
        <section className={styles.sidebar}>
            <nav className={styles.navbar}>
                <ul className={styles.navbar_menu}>
                    <li className={styles.navbar_item}>
                        <Link href="https://www.tcu.ac.jp" className={styles.navbar_link} passHref>
                            <TcuIcon className={styles.icon} /><span>TCU</span>
                        </Link>
                    </li>
                    <li className={styles.navbar_item}>
                        <Link href="https://tcu-dc.net" className={styles.navbar_link} passHref>
                            <DcIcon className={styles.icon} /><span>TCU-DC</span>
                        </Link>
                    </li>
                    <li className={styles.navbar_item}>
                        <Link href="https://x.com/tcu_dc_bot22" className={styles.navbar_link} passHref>
                            <XIcon className={styles.icon} /><span>X</span>
                        </Link>
                    </li>
                    <li className={styles.navbar_item}>
                        <Link href="https://instagram.com/manapuraza_com" className={styles.navbar_link} passHref>
                            <InstagramIcon className={styles.icon} /><span>Instagram</span>
                        </Link>
                    </li>
                    <li className={styles.navbar_item}>
                        <Link href="https://bsky.app/profile/tcudc.bsky.social" className={styles.navbar_link} passHref>
                            <BskyIcon className={styles.icon} /><span>Bsky</span>
                        </Link>
                    </li>
                    <li className={styles.navbar_item}>
                        <Link href="https://tcu-dc.net/joinus" className={styles.navbar_link} passHref>
                            <DiscordIcon className={styles.icon} /><span>Discord</span>
                        </Link>
                    </li>
                    <li className={styles.navbar_item}>
                        <Link href="mailto:g2172117@tcu.ac.jp" className={styles.navbar_link} passHref>
                            <MailIcon className={styles.icon} /><span>Mail</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </section>
    );
}

export default Sidebar;
