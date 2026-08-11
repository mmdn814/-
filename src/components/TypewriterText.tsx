import { useState, useEffect, useRef } from 'react';
import { audio } from '../utils/audio';

export default function TypewriterText({ 
  text, 
  delay = 0, 
  speed = 50, // ms per character
  className = "",
  onComplete
}: { 
  text: string, 
  delay?: number, 
  speed?: number,
  className?: string,
  onComplete?: () => void
}) {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started || completed) return;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex++;
      setDisplayText(text.slice(0, currentIndex));
      
      // Play sound on non-space characters occasionally, or every character
      if (text[currentIndex - 1] !== ' ' && currentIndex % 2 === 0) {
        audio.playTypewriter();
      }
      
      if (currentIndex >= text.length) {
        clearInterval(interval);
        setCompleted(true);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [started, text, speed, completed]);

  return (
    <span className={className}>
      {displayText}
      {started && !completed && <span className="animate-pulse">_</span>}
    </span>
  );
}
