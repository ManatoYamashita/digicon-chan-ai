"use client";

import { useRef, useEffect, type KeyboardEvent } from "react";
import type { ChatMessage } from "@/components/chat-page";
import styles from "@/styles/chat-window.module.scss";

type Props = {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isSessionExhausted: boolean;
  onReset: () => void;
  remainingCount: number;
  maxPrompts: number;
};

export default function ChatWindow({ messages, input, isLoading, onInputChange, onSend, isSessionExhausted, onReset, remainingCount, maxPrompts }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
        <span className={styles.title}>でじこんちゃん Chat</span>
        <div
          className={styles.progressBar}
          style={{ "--progress": `${Math.max(remainingCount, 0) / maxPrompts * 100}%` } as React.CSSProperties}
        />
      </div>

      {/* Messages */}
      <div className={styles.messageList}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            でじこんちゃんに話しかけてみよう！
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.bubble} ${msg.role === "user" ? styles.user : styles.bot}`}
          >
            {msg.role === "bot" && <span className={styles.avatar}>DC</span>}
            <div className={styles.text}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.bubble} ${styles.bot}`}>
            <span className={styles.avatar}>DC</span>
            <div className={styles.text}>
              <span className={styles.typing}>
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        {isSessionExhausted ? (
          <button className={styles.resetBtn} onClick={onReset}>
            セッション履歴をリセット
          </button>
        ) : (
          <>
            <textarea
              className={styles.input}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              rows={1}
              disabled={isLoading}
            />
            <button
              className={styles.sendBtn}
              onClick={onSend}
              disabled={!input.trim() || isLoading}
              aria-label="送信"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
