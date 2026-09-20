"use client";

import { useState, useRef, useCallback, useEffect, ViewTransition } from "react";
import ChatWindow from "@/components/chat-window";
import ChatCharacter from "@/components/chat-character";
import { MAX_PROMPTS } from "@/lib/chat-request";
import { parseEmotionResponse, type Emotion } from "@/lib/emotion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "@/styles/chat-page.module.scss";

gsap.registerPlugin(useGSAP);


export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
  emotion?: Emotion;
  timestamp: number;
};

const EMOTION_MAP: Record<Emotion, string> = {
  "楽": "/images/emotions/happy.webp",
  "怒": "/images/emotions/angry.webp",
  "哀": "/images/emotions/confuse.webp",
  "困": "/images/emotions/confuse.webp",
  "照": "/images/emotions/embarrassed.webp",
  default: "/images/emotions/default.webp",
};

const EMOTION_LABEL: Record<Emotion, string> = {
  "楽": "(≧▽≦)",
  "怒": "(｀Д´)ﾉ",
  "哀": "(´；ω；`)",
  "困": "( ˘ω˘ )?",
  "照": "(*/ω＼*)",
  default: "(・ω・)",
};

// 送信に失敗したときは発言を履歴から外して入力欄へ戻すので、回数は減らない。そのことと次の手を必ず添える
function restoredNote(retryAfter: number | null): string {
  const next = retryAfter ? `${retryAfter}秒くらい待ってから、もう一度送ってね！` : "もう一度送ってね！";
  return `送れなかったメッセージは入力欄に戻したよ。回数は減ってないから、${next}`;
}
const NETWORK_ERROR = "ごめんね、通信がうまくいかなかったみたい…。";
const UNKNOWN_ERROR = "ごめんね、なんかうまくいかなかった…。";
const EMPTY_REPLY_ERROR = "あれれ、うまく言葉が出てこなかった…。";

// チャット欄の幅 (px)。CSS の clamp() と同じ範囲に収める
const MIN_WINDOW_WIDTH = 360;
const RESIZE_STEP = 16;

/** 右下に固定したナビ (幅 50vw) と重ならない最大幅。CSS の calc(50vw - 4rem) と揃える */
function maxWindowWidth(): number {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return Math.max(MIN_WINDOW_WIDTH, Math.floor(window.innerWidth / 2 - 4 * rem));
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("default");
  const emotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  // aria-valuenow / aria-valuemax 用。実際の幅は --window-width で決まる
  const [windowSize, setWindowSize] = useState({ now: MIN_WINDOW_WIDTH, max: MIN_WINDOW_WIDTH });

  const syncWindowSize = useCallback(() => {
    const wrap = windowWrapRef.current;
    if (!wrap) return;
    setWindowSize({ now: Math.round(wrap.getBoundingClientRect().width), max: maxWindowWidth() });
  }, []);

  const applyWindowWidth = useCallback((width: number) => {
    const wrap = windowWrapRef.current;
    if (!wrap) return;
    const max = maxWindowWidth();
    const next = Math.round(Math.min(Math.max(width, MIN_WINDOW_WIDTH), max));
    wrap.style.setProperty("--window-width", `${next}px`);
    setWindowSize({ now: next, max });
  }, []);

  useEffect(() => {
    syncWindowSize();
  }, [syncWindowSize]);

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
    syncWindowSize();
  }, [syncWindowSize]);

  // キーボードでの幅変更 (ARIA APG の Window Splitter と同じキー)
  const handleResizeKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const wrap = windowWrapRef.current;
    if (!wrap) return;
    const current = wrap.getBoundingClientRect().width;
    const step = e.shiftKey ? RESIZE_STEP * 4 : RESIZE_STEP;
    let next: number | null = null;
    if (e.key === "ArrowLeft") next = current - step;
    else if (e.key === "ArrowRight") next = current + step;
    else if (e.key === "Home") next = MIN_WINDOW_WIDTH;
    else if (e.key === "End") next = maxWindowWidth();
    if (next === null) return;
    e.preventDefault();
    applyWindowWidth(next);
  }, [applyWindowWidth]);

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

  // 初期表示アニメーション。視差効果を減らす設定のときは移動と拡大縮小をやめ、フェードだけにする
  useGSAP(
    () => {
      if (!chatPageRef.current) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const reduceMotion = Boolean(context.conditions?.reduceMotion);
          const isMobile = window.matchMedia("(max-width: 768px)").matches;
          const motion = (vars: gsap.TweenVars): gsap.TweenVars => (reduceMotion ? {} : vars);
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          tl.fromTo(
            windowWrapRef.current,
            { opacity: 0, ...motion({ y: 30 }) },
            { opacity: 1, ...motion({ y: 0 }), duration: 0.7 },
            0.1
          );

          tl.fromTo(
            characterWrapRef.current,
            { opacity: 0, ...motion(isMobile ? {} : { x: 40 }) },
            { opacity: 1, ...motion({ x: 0 }), duration: 0.8 },
            0.2
          );

          const infoTitle = infoBackdropRef.current?.querySelector(
            `.${styles.infoTitle}`
          );
          if (infoTitle) {
            tl.fromTo(
              infoTitle,
              { opacity: 0, ...motion({ scale: 0.9 }) },
              { opacity: 1, ...motion({ scale: 1, ease: "back.out(1.4)" }), duration: 0.6 },
              0.5
            );
          }

          const infoRest = infoBackdropRef.current?.querySelectorAll(
            `.${styles.infoEmotion}, .${styles.infoDesc}, .${styles.infoHint}`
          );
          if (infoRest?.length) {
            tl.fromTo(
              infoRest,
              { opacity: 0, ...motion({ y: 15 }) },
              { opacity: 1, ...motion({ y: 0 }), duration: 0.5, stagger: 0.06 },
              0.65
            );
          }
        }
      );

      return () => mm.revert();
    },
    { scope: chatPageRef }
  );

  const handleReset = useCallback(() => {
    setMessages([]);
    setInput("");
    setError(null);
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
    setError(null);
    setIsLoading(true);

    // 失敗した発言は履歴から外して入力欄へ戻す。回数を消費させず、エラー文言を Gemini へ送り返さないため
    const fail = (reason: string, retryAfter: number | null = null) => {
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setInput(trimmed);
      setError(`${reason}\n${restoredNote(retryAfter)}`);
      updateEmotion("困");
    };

    try {
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let res: Response;
      try {
        res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });
      } catch {
        fail(NETWORK_ERROR);
        return;
      }

      // Vercel の 504 など、JSON 以外の応答もここで受け止める
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const retryAfter = res.status === 429 && typeof data?.retryAfter === "number" ? data.retryAfter : null;
        fail(typeof data?.error === "string" ? data.error : UNKNOWN_ERROR, retryAfter);
        return;
      }

      const { emotion, text } = parseEmotionResponse(typeof data?.content === "string" ? data.content : "");
      // 本文が空の返答を履歴に残すと、以降のリクエストがすべて入力検証で 400 になる
      if (!text) {
        fail(EMPTY_REPLY_ERROR);
        return;
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
    } catch {
      fail(UNKNOWN_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, updateEmotion, userMessageCount]);

  // Record<Emotion, string> なので currentEmotion のどの値でも必ず引ける
  const emotionImage = EMOTION_MAP[currentEmotion];

  return (
    <div ref={chatPageRef} className={styles.chatPage}>
      <div className={styles.remainingBadge}>
        <span className={styles.remainingLabel}>残り</span>
        <span className={styles.remainingNumber}>{Math.max(MAX_PROMPTS - userMessageCount, 0)}</span>
        <span className={styles.remainingLabel}>/ {MAX_PROMPTS}</span>
      </div>
      <ViewTransition enter="vt-window-enter" default="none">
        <div className={styles.windowWrap} ref={windowWrapRef}>
          <ChatWindow
            messages={messages}
            input={input}
            isLoading={isLoading}
            error={error}
            onInputChange={setInput}
            onSend={handleSend}
            isSessionExhausted={isSessionExhausted}
            onReset={handleReset}
            remainingCount={MAX_PROMPTS - userMessageCount}
            maxPrompts={MAX_PROMPTS}
          />
          <div
            className={`${styles.resizeHandle}${isResizing ? ` ${styles.resizing}` : ""}`}
            role="separator"
            aria-orientation="vertical"
            aria-label="チャット欄の幅"
            aria-valuemin={MIN_WINDOW_WIDTH}
            aria-valuemax={windowSize.max}
            aria-valuenow={windowSize.now}
            aria-valuetext={`${windowSize.now}px`}
            tabIndex={0}
            onFocus={syncWindowSize}
            onKeyDown={handleResizeKeyDown}
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
          />
        </div>
      </ViewTransition>
      <ViewTransition enter="vt-char-enter" default="none">
        <div ref={characterWrapRef} className={styles.characterWrap}>
          {/* 飾りの透かし。内容はチャット欄と重複するので支援技術からは隠す */}
          <div ref={infoBackdropRef} className={styles.infoBackdrop} aria-hidden="true">
            <p className={styles.infoTitle}>Chat</p>
            <p className={styles.infoEmotion}>
              {EMOTION_LABEL[currentEmotion]}
            </p>
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
