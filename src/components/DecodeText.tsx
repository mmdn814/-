import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=-/\\<>{}[]_';

export default function DecodeText({ 
  text, 
  delay = 0, 
  duration = 1500, 
  className = "" 
}: { 
  text: string, 
  delay?: number, 
  duration?: number,
  className?: string 
}) {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);
  const iterations = useRef(0);
  
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    iterations.current = 0;
    const maxIterations = text.length;
    const frames = duration / 30;
    const increment = maxIterations / frames;
    
    const interval = setInterval(() => {
      setDisplayText(() => {
        return text.split('').map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iterations.current) {
            return text[index];
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
      });
      
      if (iterations.current >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text); // Ensure final text is perfect
      }
      
      iterations.current += increment;
    }, 30);
    
    return () => clearInterval(interval);
  }, [started, text, duration]);

  return (
    <motion.span 
      initial={{ opacity: 0 }}
      animate={{ opacity: started ? 1 : 0 }}
      transition={{ duration: 0.1 }}
      className={className}
    >
      {started ? displayText : <span className="opacity-0">{text}</span>}
    </motion.span>
  );
}
