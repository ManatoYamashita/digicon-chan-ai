"use client";

import { useState, useRef, useCallback, useEffect, ViewTransition } from "react";
import ChatWindow from "@/components/chat-window";
import ChatCharacter from "@/components/chat-character";
import styles from "@/styles/chat-page.module.scss";

export type Emotion = "楽" | "怒" | "哀" | "困" | "照" | "default";

export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
  emotion?: Emotion;
  timestamp: number;
};

const EMOTION_MAP: Record<string, string> = {
  "楽": "/images/emotions/happy.webp",
  "怒": "/images/emotions/angry.webp",
  "哀": "/images/emotions/confuse.webp",
  "困": "/images/emotions/confuse.webp",
  "照": "/images/emotions/embarrassed.webp",
  default: "/images/emotions/default.webp",
};

const EMOTION_LABEL: Record<Emotion | "default", string> = {
  "楽": "(≧▽≦)",
  "怒": "(｀Д´)ﾉ",
  "哀": "(´；ω；`)",
  "困": "( ˘ω˘ )?",
  "照": "(*/ω＼*)",
  default: "(・ω・)",
};

function parseEmotionResponse(raw: string): { emotion: Emotion; text: string } {
  const trimmed = raw.trim();
  const firstChar = trimmed.charAt(0);
  if (["楽", "怒", "哀", "困", "照"].includes(firstChar)) {
    const newlineIndex = trimmed.indexOf("\n");
    const text = newlineIndex !== -1 ? trimmed.slice(newlineIndex + 1).trim() : trimmed.slice(1).trim();
    return { emotion: firstChar as Emotion, text };
  }
  return { emotion: "default", text: trimmed };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("default");
  const emotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_TOKENS = 1_048_576; // Gemini 2.5 Flash context window
  const [tokenUsage, setTokenUsage] = useState<number | null>(null);

  // Resize handle refs & state
  const windowWrapRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const wrap = windowWrapRef.current;
    if (!wrap) return;

    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = wrap.getBoundingClientRect().width;
    setIsResizing(true);

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }, []);

  const handleResizeMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return;
    const wrap = windowWrapRef.current;
    if (!wrap) return;

    const delta = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + delta;
    wrap.style.setProperty("--window-width", `${newWidth}px`);
  }, []);

  const handleResizeEnd = useCallback(() => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    setIsResizing(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  // 感情7秒タイマー
  const updateEmotion = useCallback((emotion: Emotion) => {
    if (emotionTimerRef.current) {
      clearTimeout(emotionTimerRef.current);
      emotionTimerRef.current = null;
    }
    setCurrentEmotion(emotion);
    if (emotion !== "default") {
      emotionTimerRef.current = setTimeout(() => {
        setCurrentEmotion("default");
        emotionTimerRef.current = null;
      }, 7000);
    }
  }, []);

  // body-chat クラス付与
  useEffect(() => {
    document.body.classList.add("body-chat");
    return () => {
      document.body.classList.remove("body-chat");
    };
  }, []);

  // タイマークリーンアップ
  useEffect(() => {
    return () => {
      if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
    };
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (res.status === 429) {
          throw new Error(errorData?.error || "リクエストが多すぎます。少し待ってから再度お試しください。");
        }
        throw new Error(errorData?.error || "エラーが発生しました。");
      }

      const data = await res.json();
      const content = data.content || "";
      const { emotion, text } = parseEmotionResponse(content);

      // トークン使用量を更新
      if (data.usage) {
        setTokenUsage(data.usage.total_tokens);
      }

      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "bot",
        content: text,
        emotion,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
      updateEmotion(emotion);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "bot",
        content: err instanceof Error ? err.message : "通信エラーが発生しました。",
        emotion: "困",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      updateEmotion("困");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, updateEmotion]);

  const emotionImage = EMOTION_MAP[currentEmotion] || EMOTION_MAP.default;

  return (
    <div className={styles.chatPage}>
      <ViewTransition enter="vt-window-enter" default="none">
        <div className={styles.windowWrap} ref={windowWrapRef}>
          <ChatWindow
            messages={messages}
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSend={handleSend}
          />
          <div
            className={`${styles.resizeHandle}${isResizing ? ` ${styles.resizing}` : ""}`}
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
          />
        </div>
      </ViewTransition>
      <ViewTransition enter="vt-char-enter" default="none">
        <div className={styles.characterWrap}>
          <div className={styles.infoBackdrop}>
            <h2 className={styles.infoTitle}>Chat</h2>
            <p className={styles.infoEmotion}>
              {EMOTION_LABEL[currentEmotion]}
            </p>
            {tokenUsage !== null && (
              <p className={styles.infoTokens}>
                {((tokenUsage / MAX_TOKENS) * 100).toFixed(1)}% used
              </p>
            )}
            <p className={styles.infoDesc}>
              でじこんちゃんAI Chat
            </p>
            <p className={styles.infoHint}>
              話しかけてみよう！
            </p>
          </div>
          <ChatCharacter emotion={currentEmotion} imageSrc={emotionImage} />
        </div>
      </ViewTransition>
    </div>
  );
}
