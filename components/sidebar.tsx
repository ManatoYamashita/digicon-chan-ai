import Link from "next/link";
import styles from "@/styles/sidebar.module.scss";

function Sidebar() {
    return (
        <nav className={styles.navbar}>
            <ul className={styles.navbar_menu}>
                <li className={styles.navbar_item}>
                    <Link href="/" className={styles.navbar_link} passHref>
                        <i data-feather="home"></i><span>TCU</span>
                    </Link>
                </li>
                <li className={styles.navbar_item}>
                    <Link href="/" className={styles.navbar_link} passHref>
                       <i data-feather="message-square"></i><span>TCU-DC</span>
                    </Link>
                </li>
                <li className={styles.navbar_item}>
                    <Link href="/" className={styles.navbar_link} passHref>
                       <i data-feather="users"></i><span>X</span>
                    </Link>
                </li>
                <li className={styles.navbar_item}>
                    <Link href="/" className={styles.navbar_link} passHref>
                       <i data-feather="folder"></i><span>Instagram</span>
                    </Link>
                </li>
                <li className={styles.navbar_item}>
                    <Link href="/" className={styles.navbar_link} passHref>
                       <i data-feather="archive"></i><span>Bluesky</span>
                    </Link>
                </li>
                <li className={styles.navbar_item}>
                    <Link href="/" className={styles.navbar_link} passHref>
                       <i data-feather="help-circle"></i><span>Discord</span>
                    </Link>
                </li>
                <li className={styles.navbar_item}>
                    <Link href="/" className={styles.navbar_link} passHref>
                       <i data-feather="settings"></i><span>Mail</span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default Sidebar;
