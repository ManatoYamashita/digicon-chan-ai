"use client";

import { useState, useRef, useCallback, useEffect, ViewTransition } from "react";
import ChatWindow from "@/components/chat-window";
import ChatCharacter from "@/components/chat-character";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "@/styles/chat-page.module.scss";

gsap.registerPlugin(useGSAP);

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

const MAX_PROMPTS = 5;

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("default");
  const emotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_TOKENS = 1_048_576; // Gemini 2.5 Flash context window
  const [tokenUsage, setTokenUsage] = useState<number | null>(null);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isSessionExhausted = userMessageCount >= MAX_PROMPTS && !isLoading;

  // Animation refs
  const chatPageRef = useRef<HTMLDivElement>(null);
  const characterWrapRef = useRef<HTMLDivElement>(null);
  const infoBackdropRef = useRef<HTMLDivElement>(null);

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

  // 初期表示アニメーション
  useGSAP(
    () => {
      if (!chatPageRef.current) return;

      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        windowWrapRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.1
      );

      tl.fromTo(
        characterWrapRef.current,
        { opacity: 0, ...(isMobile ? {} : { x: 40 }) },
        { opacity: 1, x: 0, duration: 0.8 },
        0.2
      );

      const infoTitle = infoBackdropRef.current?.querySelector(
        `.${styles.infoTitle}`
      );
      if (infoTitle) {
        tl.fromTo(
          infoTitle,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.4)" },
          0.5
        );
      }

      const infoRest = infoBackdropRef.current?.querySelectorAll(
        `.${styles.infoEmotion}, .${styles.infoTokens}, .${styles.infoDesc}, .${styles.infoHint}`
      );
      if (infoRest?.length) {
        tl.fromTo(
          infoRest,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 },
          0.65
        );
      }
    },
    { scope: chatPageRef }
  );

  const handleReset = useCallback(() => {
    setMessages([]);
    setTokenUsage(null);
    setInput("");
    updateEmotion("default");
  }, [updateEmotion]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || userMessageCount >= MAX_PROMPTS) return;

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
          throw new Error(errorData?.error || "わわっ、今たくさんの人が話しかけてくれてるみたい！ちょっとだけ待っててね～！");
        }
        throw new Error(errorData?.error || "あわわ、なんかうまくいかなかった...もう一回試してみてね！");
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
        content: err instanceof Error ? err.message : "えーん、お話が途切れちゃった...もう一回話しかけてくれる？",
        emotion: "困",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      updateEmotion("困");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, updateEmotion, userMessageCount]);

  const emotionImage = EMOTION_MAP[currentEmotion] || EMOTION_MAP.default;

  return (
    <div ref={chatPageRef} className={styles.chatPage}>
      <div className={styles.remainingBadge}>
        <span className={styles.remainingNumber}>{Math.max(MAX_PROMPTS - userMessageCount, 0)}</span>
        <span className={styles.remainingLabel}>/ {MAX_PROMPTS} 残り</span>
      </div>
      <ViewTransition enter="vt-window-enter" default="none">
        <div className={styles.windowWrap} ref={windowWrapRef}>
          <ChatWindow
            messages={messages}
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSend={handleSend}
            isSessionExhausted={isSessionExhausted}
            onReset={handleReset}
            remainingCount={MAX_PROMPTS - userMessageCount}
            maxPrompts={MAX_PROMPTS}
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
        <div ref={characterWrapRef} className={styles.characterWrap}>
          <div ref={infoBackdropRef} className={styles.infoBackdrop}>
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
