import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";
import styles from "@/styles/card.module.scss";
import Link from "next/link";

import headImg from "@/public/images/gallery/yc.webp";
import headThumb from "@/public/images/gallery/thumbs/yc.webp";
import iconImg from "@/public/images/gallery/friends-thumb.webp";

// 画像最適化を切っている（#48）ので next/image は srcset を出さず、どの画面にも 1200px 幅の
// 元画像が届く。縮小版（752px 幅、scripts/make-thumbnails.mjs）と元画像の 2 段の srcset を
// 自前で組み、必要な幅が 752px に収まる画面では縮小版を選ばせる。
// 画像は object-fit: cover でカードの高さに合わせて切り取られるので、必要な幅は
// 「カードの幅」と「カードの高さ × 画像の縦横比」の大きい方。幅 320〜1920 × 高さ 560〜1366 で
// 実測すると、前者は最大 48.8vw、後者は最大 36.4vh だった。
const HEAD_SIZES = "max(50vw, 37vh)";
const HEAD_SRCSET = `${headThumb.src} ${headThumb.width}w, ${headImg.src} ${headImg.width}w`;
const HEAD_ALT = "東京都市大学 横浜キャンパス";

type Props = {
    title: string
    subtitle: string
    description: string
}

function Card({ title, subtitle, description }: Props) {
    // <Image priority> の代わり。srcset 付きで先読みし、画面に合う方だけを取りに行かせる
    preload(headImg.src, { as: "image", imageSrcSet: HEAD_SRCSET, imageSizes: HEAD_SIZES });
    const { props: headProps } = getImageProps({
        src: headImg,
        alt: HEAD_ALT,
        fill: true,
        loading: "eager",
    });

    return (
        <section className={styles.card}>
            <Link href="https://manapuraza.com/twitter/#/tweets/tweets/1652335229590458368?since=2023-04-29&until=2023-05-01" className={styles.container} aria-label="元になったTweet">
                {/* getImageProps は最適化を切っていると srcSet / sizes を返さないので、ここで足す */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    {...headProps}
                    alt={HEAD_ALT}
                    srcSet={HEAD_SRCSET}
                    sizes={HEAD_SIZES}
                    className={styles.card__image}
                />
                <div className={styles.card__overlay}>
                    <div className={styles.card__header}>
                        <svg className={styles.card__arc} xmlns="http://www.w3.org/2000/svg"><path /></svg>                     
                        <Image
                            className={styles.card__thumb}
                            src={iconImg}
                            alt="デジコンちゃん"
                            width={64}
                            height={64}
                        />
                        <div className={styles.card__header_text}>
                            <h2 className={styles.card__title}>
                                { title }
                            </h2>            
                            <span className={styles.card__status}>
                                { subtitle }
                            </span>
                        </div>
                    </div>
                    <p className={styles.card__description}>
                        { description }
                    </p>
                </div>
            </Link>
        </section>
    );
}

export default Card;