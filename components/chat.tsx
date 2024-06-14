"use client";

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import styles from '@/styles/chat.module.scss'; // Import the CSS module
import useTypewriter from '@/components/TypeWriter'; // Import the custom hook from the components directory

type Message = {
  role: 'user' | 'bot';
  content: string;
};

function Chat() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [emotion, setEmotion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentMessage, setCurrentMessage] = useState('');
  const displayedAnswer = useTypewriter(currentMessage, 50);

  useEffect(() => {
    if (!isLoading && currentMessage) {
      setMessages((prev) => [...prev, { role: 'bot', content: currentMessage }]);
      setCurrentMessage('');
    }
  }, [isLoading, currentMessage]);

  const generateAnswer = async () => {
    setIsLoading(true);
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
    setPrompt('');

    try {
      const res = await axios.post('/api/chatgpt', { prompt }, { timeout: 15000 });
      console.log('Response from API: ', res.data); // log the response to the console
      
      // Split the response into emotion and content
      const [emotion, ...contentArr] = res.data.text.split('\n');
      const content = contentArr.join('\n');
      console.log('Emotion: ', emotion);
      console.log('Content: ', content);

      setEmotion(emotion);
      setCurrentMessage(content);
    } catch (e: any) {
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

  return (
    <div className={styles.wrap}>
      <div className={styles.chatContainer}>
        {isLoading && (
          <div className={styles.loading}>読み込み中...</div>
        )}
        {error && <div className={styles.error}>{error}</div>}
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.bubble} ${msg.role === 'bot' ? styles.bot : styles.user}`}>
            <div className={styles.label}>{msg.role === 'bot' ? 'Response from ChatGPT' : 'Your request'}</div>
            <p>{msg.content}</p>
          </div>
        ))}
        {currentMessage && (
          <div className={`${styles.bubble} ${styles.bot}`}>
            <div className={styles.label}>Response from ChatGPT</div>
            <p>{displayedAnswer}</p>
          </div>
        )}
      </div>
      <div className={styles.textareaContainer}>
        <textarea
          className={styles.textarea}
          placeholder="textbox"
          maxLength={500}
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="button"
          className={styles.button}
          disabled={isLoading || prompt.length === 0}
          onClick={generateAnswer}
        >
          Talk!
        </button>
      </div>
    </div>
  );
}

export default Chat;
