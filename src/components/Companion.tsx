import { useEffect, useRef, useState } from 'react';
import pixelGirl from '../assets/images/pixel_girl_8bit_1785916465260.jpg';
import pixelKitten from '../assets/images/pixel_kitten_8bit_1785916481712.jpg';
import pixelRobot from '../assets/images/pixel_robot_8bit_1785917923827.jpg';

export default function Companion({ companion }: { companion: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!companion) return;
    const src = companion === 'girl' ? pixelGirl : companion === 'cat' ? pixelKitten : pixelRobot;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Make white pixels transparent
        if (r > 230 && g > 230 && b > 230) {
          data[i + 3] = 0;
        } else if (r > 200 && g > 200 && b > 200) {
          // Soft edge
          data[i + 3] = 128;
        } else if (companion === 'girl' && g > 100 && b > 100 && r < 180) {
          // Replace cyan/greenish skin with peach/flesh color
          data[i] = 255;     // R
          data[i + 1] = 218; // G
          data[i + 2] = 185; // B
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
  }, [companion]);

  useEffect(() => {
    if (!companion) return;
    const interval = setInterval(() => {
      setPosition(prev => {
        let next = prev + direction * 2;
        if (next > 80) {
          setDirection(-1);
          return 80;
        }
        if (next < -80) {
          setDirection(1);
          return -80;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [direction, companion]);

  if (!companion) return null;

  return (
    <div 
      className="fixed bottom-0 z-40 pointer-events-none p-4 md:p-8"
      style={{ 
        right: `calc(10% + ${position}px)`,
        transform: `scaleX(${direction === -1 ? -1 : 1})`,
        transition: 'right 0.1s linear'
      }}
    >
      <canvas 
        ref={canvasRef}
        className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain image-rendering-pixelated animate-walk"
        style={{ animationDuration: '0.6s' }}
      />
    </div>
  );
}
