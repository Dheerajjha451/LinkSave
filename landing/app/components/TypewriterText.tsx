'use client';

import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  startDelay?: number;
  speed?: number;
  showCursor?: boolean;
}

export default function TypewriterText({
  text,
  startDelay = 0,
  speed = 58,
  showCursor = true,
}: TypewriterTextProps) {
  const [visibleText, setVisibleText] = useState('');

  useEffect(() => {
    let typeTimer: number | undefined;
    const startTimer = window.setTimeout(() => {
      let index = 0;
      typeTimer = window.setInterval(() => {
        index += 1;
        setVisibleText(text.slice(0, index));

        if (index === text.length && typeTimer) window.clearInterval(typeTimer);
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(startTimer);
      if (typeTimer) window.clearInterval(typeTimer);
    };
  }, [speed, startDelay, text]);

  return (
    <span className="typewriter-text" aria-label={text}>
      <span aria-hidden="true">{visibleText}</span>
      {showCursor && <span className="typewriter-text__cursor" aria-hidden="true" />}
    </span>
  );
}
