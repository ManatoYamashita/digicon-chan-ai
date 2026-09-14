"use client";

import { useRef, useEffect, useId, type KeyboardEvent } from "react";
import Image from "next/image";
import type { ChatMessage } from "@/components/chat-page";
import { MAX_USER_CONTENT_LENGTH } from "@/lib/chat-request";
import styles from "@/styles/chat-window.module.scss";

const EMOTION_ICON_MAP: Record<string, string> = {
  "楽": "/images/emotions/happy-icon.webp",
  "怒": "/images/emotions/angry-icon.webp",
  "哀": "/images/emotions/sad-icon.webp",
  "困": "/images/emotions/confuse-icon.webp",
  "照": "/images/emotions/surprise-icon.webp",
  "default": "/images/emotions/default.webp",
};

type Props = {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  error: string | null;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isSessionExhausted: boolean;
  onReset: () => void;
  remainingCount: number;
  maxPrompts: number;
};

export default function ChatWindow({ messages, input, isLoading, error, onInputChange, onSend, isSessionExhausted, onReset, remainingCount, maxPrompts }: Props) {
  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const wasExhaustedRef = useRef(isSessionExhausted);
  const hintId = useId();
  const canSend = input.trim() !== "" && !isLoading;

  // 一覧だけをスクロールする。scrollIntoView はページごと動かし、overflow: hidden の body では戻せなくなる
  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ top: list.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, isLoading, error]);

  // 入力欄とリセットボタンが入れ替わると、フォーカスしていた要素が消えて body に落ちる。そのときだけ新しい操作へ移す
  useEffect(() => {
    if (wasExhaustedRef.current === isSessionExhausted) return;
    wasExhaustedRef.current = isSessionExhausted;
    if (document.activeElement && document.activeElement !== document.body) return;
    (isSessionExhausted ? resetButtonRef.current : textareaRef.current)?.focus();
  }, [isSessionExhausted]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={styles.window}>
      {/* macOS Header */}
      <div className={styles.header}>
        <div className={styles.dots}>
          <span className={styles.dotRed} />
          <span className={styles.dotYellow} />
          <span className={styles.dotGreen} />
        </div>
        <h1 className={styles.title}>でじこんちゃん Chat</h1>
        <div
          className={styles.progressBar}
          style={{ "--progress": `${Math.max(remainingCount, 0) / maxPrompts * 100}%` } as React.CSSProperties}
        />
      </div>

      {/* Messages: 追加された発言をスクリーンリーダーに読み上げさせる */}
      <div ref={messageListRef} className={styles.messageList} role="log" aria-label="でじこんちゃんとの会話">
        {messages.length === 0 && !error && (
          <div className={styles.empty}>
            でじこんちゃんに話しかけてみよう！
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.bubble} ${msg.role === "user" ? styles.user : styles.bot}`}
          >
            {msg.role === "bot" ? (
              <span className={styles.avatar}>
                <Image
                  className={styles.avatarImg}
                  src={EMOTION_ICON_MAP[msg.emotion ?? ""] ?? EMOTION_ICON_MAP.default}
                  alt="でじこんちゃん"
                  width={28}
                  height={28}
                />
              </span>
            ) : (
              <span className={styles.visuallyHidden}>あなた：</span>
            )}
            <div className={styles.text}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.bubble} ${styles.bot}`}>
            <span className={styles.avatar}>
              <Image
                className={styles.avatarImg}
                src={EMOTION_ICON_MAP.default}
                alt="でじこんちゃん"
                width={28}
                height={28}
              />
            </span>
            <div className={styles.text}>
              <span className={styles.typing} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className={styles.visuallyHidden}>入力中…</span>
            </div>
          </div>
        )}
        {error && !isLoading && (
          <div className={`${styles.bubble} ${styles.bot}`}>
            <span className={styles.avatar}>
              <Image
                className={styles.avatarImg}
                src={EMOTION_ICON_MAP["困"]}
                alt="でじこんちゃん"
                width={28}
                height={28}
              />
            </span>
            <div className={styles.text}>
              <span className={styles.visuallyHidden}>エラー：</span>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        {isSessionExhausted ? (
          <>
            <p className={styles.exhausted}>
              {maxPrompts}回お話ししたよ！続けるには会話をリセットしてね。これまでの会話は消えちゃうよ。
            </p>
            <button ref={resetButtonRef} className={styles.resetBtn} onClick={onReset}>
              会話をリセット
            </button>
          </>
        ) : (
          <>
            <div className={styles.inputRow}>
              {/* 送信中も disabled にはせず readOnly にする。disabled にするとフォーカスが body に落ちる */}
              <textarea
                ref={textareaRef}
                className={styles.input}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="でじこんちゃんへのメッセージ"
                aria-describedby={hintId}
                placeholder="メッセージを入力…"
                rows={2}
                maxLength={MAX_USER_CONTENT_LENGTH}
                readOnly={isLoading}
              />
              <button
                className={styles.sendBtn}
                onClick={() => { if (canSend) onSend(); }}
                aria-disabled={!canSend}
                aria-label="送信"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p id={hintId} className={styles.hint}>
              <span className={styles.shortcut}>⌘ / Ctrl + Enter で送信・</span>
              {maxPrompts}回まで話せるよ
            </p>
          </>
        )}
      </div>
    </div>
  );
}
