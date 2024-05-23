import Image from "next/image";
import styles from "@/styles/card.module.scss";

function Card() {
    return (
        <section>
        <h2>leading companies<br />have trusted us</h2>
        <div className={styles.container}>
            <div className="styles.card">
            <div className="styles.card-inner">
                <div className="styles.box">
                <div className="styles.imgBox">
                    <Image src="https://images.unsplash.com/photo-1601049676869-702ea24cfd58?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Trust & Co." />
                </div>
                <div className="styles.icon">
                    <a href="#" className="styles.iconBox"> <span className="styles.material-symbols-outlined">
                        arrow_outward
                    </span></a>
                </div>
                </div>
            </div>
            <div className="styles.content">
                <h3>trust &amp; co.</h3>
                <p>Fill out the form and the algorithm will offer the right team of experts</p>
                <ul>
                <li className="styles.branding">branding</li>
                <li className="styles.packaging">packaging</li>
                </ul>
            </div>
            </div>
            <div className="styles.card">
            <div className="styles.card-inner">
                <div className="styles.box">
                <div className="styles.imgBox">
                    <Image src="https://images.unsplash.com/photo-1613235788366-270e7ac489f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Tonic" />
                </div>
                <div className="styles.icon">
                    <a href="#" className="styles.iconBox"> <span className="styles.material-symbols-outlined">
                        arrow_outward
                    </span></a>
                </div>
                </div>
            </div>
            <div className="styles.content">
                <h3>tonic</h3>
                <p>Fill out the form and the algorithm will offer the right team of experts</p>
                <ul>
                <li  className="styles.branding">branding</li>
                <li  className="styles.marketing">marketing</li>
                </ul>
            </div>
            </div>
            <div className="styles.card">
            <div className="styles.card-inner">
                <div className="styles.box">
                <div className="styles.imgBox">
                    <Image src="https://images.unsplash.com/photo-1673847401561-fcd75a7888c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Shower Gel" />
                </div>
                <div className="styles.icon">
                    <a href="#" className="styles.iconBox"> <span className="styles.material-symbols-outlined">
                        arrow_outward
                    </span></a>
                </div>
                </div>
            </div>
            <div className="styles.content">
                <h3>shower gel</h3>
                <p>Fill out the form and the algorithm will offer the right team of experts</p>
                <ul>
                <li className="styles.branding">branding</li>
                <li className="styles.packaging">packaging</li>
                <li className="styles.marketing">marketing</li>
                </ul>
            </div>
            </div>
        </div>
        </section>
    );
}

export default Card();