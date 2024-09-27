"use client";

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import styles from '@/styles/chat.module.scss';

type Message = {
  role: 'user' | 'bot';
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
  const [currentMessage, setCurrentMessage] = useState('');
  const [displayedAnswer, setDisplayedAnswer] = useState('');

  useEffect(() => {
    if (!isLoading && currentMessage) {
      setMessages((prev) => [...prev, { role: 'bot', content: currentMessage }]);
      setCurrentMessage('');
      setDisplayedAnswer('');
    }
  }, [isLoading, currentMessage]);

  // useEffect(() => {
  //   let index = 0;
  //   const interval = setInterval(() => {
  //     if (index < currentMessage.length) {
  //       setDisplayedAnswer((prev) => prev + currentMessage[index]);
  //       index++;
  //     } else {
  //       clearInterval(interval);
  //     }
  //   }, 50);

  //   return () => clearInterval(interval);
  // }, [currentMessage]);

  const generateAnswer = async () => {
    setIsLoading(true);
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
    setPrompt('');

    try {
      const res = await axios.post('/api/chatgpt', { prompt }, { timeout: 15000 });
      console.log('ChatGPTからのresponse: ', res.data);
    
      // emotionとcontentを分割
      const [emotionStr, ...contentArr] = res.data.text.split('\n');
      const content = contentArr.join('\n');
      console.log('分割されたでじこんちゃんの感情(未パース): 『', emotionStr, '』');
      console.log('分割されたでじこんちゃんの回答: 『', content, '』');
    
      // emotionをパース
      let emotion = emotionStr.trim(); // 余分な空白を削除
      if (emotion.startsWith('[') && emotion.endsWith(']')) {
        // JSON形式の場合のみパース
        try {
          const parsedEmotion = JSON.parse(emotion);
          if (Array.isArray(parsedEmotion)) {
            emotion = parsedEmotion[0];
          }
        } catch (e) {
          console.log('JSON形式からStringへのパースに失敗。返答された感情をそのまま使用します。', e);
          // パースに失敗した場合は、そのままemotionを使用
        }
      }
    
      console.log('最終的なでじこんちゃんの感情(パース済): 『', emotion, '』');
    
      setEmotion(emotion);
      setCurrentMessage(content);
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
      setIsLoading(false);
    } finally {
      setIsLoading(false); // Ensure loading state is turned off
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

  return (
    <div className={isTabVisible ? styles.tabVisible : styles.tabHidden}>
      <div className={styles.chat}>
        <button className={styles.toggleBtn} type="button" onClick={toggleTabVisibility}>
          {isTabVisible ? 
            <span className={styles.toVisible}></span>
           : 
            <span className={styles.toHidden}></span>
           }
        </button>

        <div className={styles.chatContainer}>
          {isLoading && (
            <div className={styles.loading}>考えちゅう...</div>
          )}
          {error && <div className={styles.error}>{error}</div>}
          {messages.slice(-2).map((msg, index) => (
            <div key={index} className={`${styles.bubble} ${msg.role === 'bot' ? styles.bot : styles.user}`}>
              <div className={styles.label}>{msg.role === 'bot' ? 'でじこんちゃん' : 'あなた'}</div>
              <p className={styles.text}>{msg.content}</p>
            </div>
          ))}
          {!isLoading && currentMessage && (
            <div className={`${styles.bubble} ${styles.bot}`}>
              <div className={styles.label}>でじこんちゃん</div>
              <p className={styles.text}>{displayedAnswer}</p>
            </div>
          )}
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
            Talk!
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
