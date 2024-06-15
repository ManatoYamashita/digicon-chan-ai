import { useState, useEffect } from 'react';

const useTypewriter = (text: string, speed: number, reset: boolean) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (reset) {
      setDisplayedText('');
      let index = 0;
      intervalId = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        index += 1;
        if (index === text.length) {
          clearInterval(intervalId!);
        }
      }, speed);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [text, speed, reset]);

  return displayedText;
};

export default useTypewriter;
