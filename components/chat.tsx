"use client";

import axios from 'axios';
import React, { useState } from 'react';
import styles from '@/styles/chat.module.scss';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};
type EmotionProps = {
  setEmotion: (value: string) => void;
}

function Chat({ setEmotion }: EmotionProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayedAnswer, setDisplayedAnswer] = useState('');

  const generateAnswer = async () => {
    setIsLoading(true);
    setError('');

    // ユーザーのメッセージを追加
    let newMessages = [...messages, { role: 'user' as 'user', content: prompt }];

    // ユーザーメッセージ数を計算
    const numUserMessages = newMessages.filter(msg => msg.role === 'user').length;

    if (numUserMessages > 5) {
      // メッセージ履歴をリセットし、現在のユーザーメッセージを新しい会話の開始として扱う
      newMessages = [{ role: 'user' as 'user', content: prompt }];
    }

    setMessages(newMessages);
    setPrompt('');

    try {
      const res = await axios.post('/api/gemini', { messages: newMessages }, { timeout: 15000 });
      console.log('Geminiからのresponse: ', res.data);
    
      // レスポンスを行ごとに分割し、空行を削除
      const responseText = res.data.content || '';
      const responseLines = responseText.split('\n').filter((line: string) => line.trim() !== '');
      let emotion = '';
      let content = '';

      // 感情の候補リスト
      const emotionCandidates = ['楽', '怒', '哀', '困', '照'];

      if (responseLines.length === 0) {
        // レスポンスが空の場合の処理
        setError('回答が取得できませんでした。');
        return;
      }

      // 最初の行から感情情報を抽出
      const firstLine = responseLines[0].trim();

      // 正規表現を使用して感情文字を抽出（感情文字の後に句読点がある場合に対応）
      const emotionRegex = new RegExp(`^(${emotionCandidates.join('|')})[、。,．,]?$`);
      const emotionMatch = firstLine.match(emotionRegex);

      if (emotionMatch) {
        emotion = emotionMatch[1]; // 感情文字を取得
        content = responseLines.slice(1).join('\n'); // 2行目以降を本文として結合
      } else {
        // 感情情報がない場合
        emotion = '楽(error)'; // デフォルトの感情を設定
        content = responseLines.join('\n'); // 全ての行を本文として結合
      }

      console.log('最終的なでじこんちゃんの感情(パース済): 『', emotion, '』');
      console.log('最終的なでじこんちゃんの回答: 『', content, '』');
    
      setEmotion(emotion);
      setDisplayedAnswer(content);

      // ボットのメッセージを追加
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, { role: 'assistant' as 'assistant', content }];
        return updatedMessages;
      });

      setTimeout(() => {
        setEmotion('普通');
      }, 7000);
    }

    catch (e: any) {
      if (e.code === 'ECONNABORTED') {
        setError('タイムアウト: 15秒以内に回答が返ってきませんでした。');
      } else {
        setError('エラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      if (prompt.trim().length > 0) {
        e.preventDefault();
        generateAnswer();
      }
    }
  };

  const [isTabVisible, setIsTabVisible] = useState(true);

  // ボタンクリック時にタブの表示/非表示を切り替える関数
  const toggleTabVisibility = () => {
    setIsTabVisible((prev) => !prev);
  };

  // ユーザーメッセージ数を計算
  const numUserMessages = 5 - messages.filter(msg => msg.role === 'user').length;

  return (
    <div className={isTabVisible ? styles.tabVisible : styles.tabHidden}>
      <div className={styles.chat}>
        <button type="button" className={styles.toggleBtn} onClick={toggleTabVisibility}>
          {isTabVisible ? 
            <span className={styles.toVisible}></span>
           : 
            <span className={styles.toHidden}></span>
           }
        </button>

        <div className={styles.messageCount}>あと<span className={styles.numUserMessages}>{numUserMessages}</span>回の会話で会話履歴をリセットします！</div>

        <div className={styles.chatContainer}>
          {isLoading && (
            <div className={styles.loading}>考えちゅう...</div>
          )}
          {error && <div className={styles.error}>{error}</div>}
          {messages.slice(-4).map((msg, index) => (
            <div key={index} className={`${styles.bubble} ${msg.role === 'assistant' ? styles.bot : styles.user}`}>
              <div className={styles.label}>{msg.role === 'assistant' ? 'でじこんちゃん' : 'あなた'}</div>
              <p className={styles.text}>{msg.content}</p>
            </div>
          ))}
        </div>
        <div className={styles.textareaContainer}>
          <textarea
            id="prompt"
            className={styles.textarea}
            placeholder="おしゃべりしよう！（⌘/ctrl+Enterで送信！）"
            maxLength={500}
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            type="button"
            className={styles.button}
            disabled={isLoading || prompt.trim().length === 0}
            onClick={generateAnswer}
          >
            {numUserMessages === 0 || numUserMessages === 5 ? "New Talk!" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
