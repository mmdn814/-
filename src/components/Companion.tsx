import { useEffect, useRef, useState } from 'react';
import pixelGirl from '../assets/images/pixel_girl_8bit_1785916465260.jpg';
import pixelKitten from '../assets/images/pixel_kitten_8bit_1785916481712.jpg';
import pixelRobot from '../assets/images/pixel_robot_8bit_1785917923827.jpg';

export default function Companion({
  companion,
  mood = 0,
  bond,
  departed = false,
  bubbleText
}: {
  companion: string | null;
  mood?: number;
  bond?: number;
  departed?: boolean;
  bubbleText?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);

  // If companion has departed, leave the space completely empty
  if (departed || !companion) return null;

  useEffect(() => {
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
          // Peach flesh color
          data[i] = 255;
          data[i + 1] = 218;
          data[i + 2] = 185;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
  }, [companion]);

  useEffect(() => {
    // If bond < 40 (疏远), face away and walk less
    if (typeof bond === 'number' && bond < 40) {
      setDirection(-1);
      return;
    }

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
  }, [direction, bond]);

  // Bond based visual styling:
  // 亲近 (>=75): bright / normal
  // 平常 (40-74): normal
  // 疏远 (20-39): faded, lower saturation and brightness, facing away
  let filterStyle = 'none';
  if (typeof bond === 'number') {
    if (bond < 40) {
      filterStyle = 'saturate(0.3) brightness(0.75) contrast(0.9)';
    } else if (bond >= 75) {
      filterStyle = 'brightness(1.08) drop-shadow(0 0 6px rgba(255, 215, 0, 0.4))';
    }
  } else {
    const clampedMood = Math.max(-1, Math.min(1, mood));
    if (clampedMood < -0.15) {
      filterStyle = `saturate(${Math.max(0.3, 1 + clampedMood * 0.6)}) hue-rotate(${clampedMood * 50}deg) brightness(${1 + clampedMood * 0.15})`;
    }
  }

  return (
    <div
      className="fixed bottom-0 z-40 pointer-events-none p-4 md:p-8 flex flex-col items-center"
      style={{
        right: `calc(10% + ${position}px)`,
        transition: 'right 0.1s linear'
      }}
    >
      {bubbleText && (
        <div className="mb-2 bg-white text-black text-xs pixel-font p-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] max-w-[200px] leading-tight animate-bounce">
          {bubbleText}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain image-rendering-pixelated animate-walk"
        style={{
          transform: `scaleX(${direction === -1 ? -1 : 1})`,
          animationDuration: '0.6s',
          filter: filterStyle,
          transition: 'filter 0.6s ease'
        }}
      />
    </div>
  );
}
