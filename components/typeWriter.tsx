import { useState, useEffect } from 'react';

const useTypewriter = (text: string, speed: number) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset displayed text on new input
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index += 1;
      if (index === text.length) {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return displayedText;
};

export default useTypewriter;
