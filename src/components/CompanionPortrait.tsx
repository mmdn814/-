import { useEffect, useRef } from 'react';
import pixelGirl from '../assets/images/pixel_girl_8bit_1785916465260.jpg';
import pixelKitten from '../assets/images/pixel_kitten_8bit_1785916481712.jpg';
import pixelRobot from '../assets/images/pixel_robot_8bit_1785917923827.jpg';

export default function CompanionPortrait({
  companion,
  mood = 0,
  size = 72
}: {
  companion: string | null;
  mood?: number;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

        if (r > 230 && g > 230 && b > 230) {
          data[i + 3] = 0;
        } else if (r > 200 && g > 200 && b > 200) {
          data[i + 3] = 128;
        } else if (companion === 'girl' && g > 100 && b > 100 && r < 180) {
          data[i] = 255;
          data[i + 1] = 218;
          data[i + 2] = 185;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
  }, [companion]);

  if (!companion) return null;

  const clampedMood = Math.max(-1, Math.min(1, mood));
  const filterStyle = clampedMood < -0.15
    ? `saturate(${Math.max(0.3, 1 + clampedMood * 0.6)}) hue-rotate(${clampedMood * 50}deg) brightness(${1 + clampedMood * 0.15})`
    : 'none';

  return (
    <canvas
      ref={canvasRef}
      className="image-rendering-pixelated flex-shrink-0"
      style={{ width: size, height: size, objectFit: 'contain', filter: filterStyle }}
    />
  );
}
