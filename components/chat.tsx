"use client";

import axios from 'axios';
import React, { useState } from 'react';

function Chat() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateAnswer = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/chatgpt', { prompt }, { timeout: 15000 });
      console.log('Response from API: ', res.data); // log the response to the console
      setAnswer(res.data.text);
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') {
        setError('タイムアウト: 15秒以内に回答が返ってきませんでした。');
      } else {
        setError('エラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wrap">
      <div className="">
        <div className="">
          <h2 className="">Next ChatBot</h2>
        </div>
      </div>
      <div className="">
        <div className="">
          <label
            htmlFor="question"
            className=""
          >
            質問フォーム：
          </label>
          <div className="">
            <textarea
              id="question"
              className=""
              placeholder="質問したいことを入力してください"
              maxLength={500}
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        </div>
        <div className="">
        <button
            type="button"
            className=""
            disabled={isLoading || prompt.length === 0}
            onClick={generateAnswer}
          >
            質問する
          </button>
        </div>
        {isLoading ? (
          <div className="">読み込み中...</div>
        ) : (
          <>
            {error && <div className="">{error}</div>}
            {answer && (
              <>
                <div className="">回答：</div>
                <p className="">{answer}</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;