import Image from "next/image";
import styles from "@/styles/dc-chan.module.scss";
import dcchan_default from "@/public/images/dc-chan_hoshi.png";

function DCchan() {
    return(
        <section className={styles.dcchan}>
            <Image 
                src={dcchan_default} 
                alt="dc-chan" 
                fill
                sizes="(max-width: 480px) 100px, (max-width: 768px) 150px, (max-width: 1024px) 200px, 250px"
                priority
                className={styles.image}
             />
        </section>
    );
}

export default DCchan;