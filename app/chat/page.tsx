import ChatPage from "@/components/chat-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Chat',
  description: 'でじこんちゃんとAIチャットで会話しよう。東京都市大学デジタルコンテンツ研究会や大学生活について気軽に質問できます。',
  openGraph: {
    title: 'Chat | でじこんちゃん.net',
    description: 'でじこんちゃんとAIチャットで会話しよう。東京都市大学デジタルコンテンツ研究会や大学生活について気軽に質問できます。',
    url: 'https://でじこんちゃん.net/chat',
    images: [
      {
        url: '/ogp.jpg',
        width: 1200,
        height: 630,
        alt: 'でじこんちゃん Chat',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chat | でじこんちゃん.net',
    description: 'でじこんちゃんとAIチャットで会話しよう。',
  },
  alternates: {
    canonical: 'https://でじこんちゃん.net/chat',
  },
};

export default function Chat() {
  return <ChatPage />;
}
