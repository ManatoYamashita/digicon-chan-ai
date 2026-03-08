// About page data constants

export type ProfileItem = {
  label: string;
  value: string;
};

export type TimelineItem = {
  year: string;
  title: string;
  text: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type ExternalLink = {
  href: string;
  label: string;
  iconKey: string;
};

export const profileData: ProfileItem[] = [
  { label: "名前", value: "でじこんちゃん" },
  { label: "性別", value: "女性" },
  { label: "年齢", value: "21歳くらい" },
  { label: "身長", value: "155cmくらい" },
  { label: "誕生日", value: "2014年6月4日" },
  { label: "所属", value: "東京都市大学 デジタルコンテンツ研究会" },
  { label: "役職", value: "副会長(2022年度)" },
  { label: "キャラクタ原案", value: "あいしろ（2014年）" },
  { label: "モデリング", value: "Garnet/ほし（2020年）" },
  { label: "好きなこと", value: "音楽制作(DTM), グラフィックス(イラスト、デザイン、3dモデリングなど), 動画編集(カメラ、映像制作、アニメ制作など), プログラミングなどのデジタルクリエイテブ全般" },
];

export const timelineData: TimelineItem[] = [
  {
    year: "2014",
    title: "誕生",
    text: "デジタルコンテンツ研究会の公式キャラクターとして誕生。初代デザインは当時の部員によって描かれた。",
  },
  {
    year: "2020",
    title: "3Dモデル化",
    text: "3Dモデルが制作され、定例会の司会をでじこんちゃんで行うようになった。",
  },
  {
    year: "2021",
    title: "アニメーション制作",
    text: "でじこんちゃんを主役としたアニメーションが初めて制作され、それ以降でじこんちゃんを題材としたアニメーションが制作されるようになった。",
  },
  {
    year: "2022",
    title: "副会長に任命",
    text: "山下マナトが3人の会員を声優に起用し、書類上デジコンの副会長に任命することで、本格的にでじこんちゃんをキャラクタとして確立させ、外部でのプロモーションにも積極的に使用されるようになった。",
  },
  {
    year: "2024年",
    title: "でじこんちゃん.net 開設",
    text: "Google Gemini APIを搭載したでじこんちゃん.netが開設",
  },
];

export const galleryImages: GalleryImage[] = [
  { src: "/images/dcchan.webp", alt: "でじこんちゃん メインビジュアル" },
  { src: "/images/dcchan-prof.webp", alt: "でじこんちゃん プロフィール" },
  { src: "/images/dcchan-3d.webp", alt: "でじこんちゃん 3Dモデル" },
  { src: "/images/dcchan-with-friends.webp", alt: "でじこんちゃん フレンズ" },
  { src: "/images/dcchan-studentcard.webp", alt: "でじこんちゃん 学生証" },
  { src: "/images/cDesign-for-anime.webp", alt: "アニメ用キャラクターデザイン" },
  { src: "/images/jacket.webp", alt: "ジャケット" },
  { src: "/images/dc-image.webp", alt: "デジコン イメージ" },
];

export const externalLinksData: ExternalLink[] = [
  { href: "https://www.tcu.ac.jp", label: "TCU", iconKey: "tcu" },
  { href: "https://tcu-dc.net", label: "TCU-DC", iconKey: "dc" },
  { href: "https://x.com/tcu_dc_bot22", label: "X", iconKey: "x" },
  {
    href: "https://instagram.com/manapuraza_com",
    label: "Instagram",
    iconKey: "instagram",
  },
  {
    href: "https://bsky.app/profile/tcudc.bsky.social",
    label: "Bluesky",
    iconKey: "bsky",
  },
  { href: "https://tcu-dc.net/joinus", label: "Discord", iconKey: "discord" },
  { href: "mailto:g2172117@tcu.ac.jp", label: "Mail", iconKey: "mail" },
];
