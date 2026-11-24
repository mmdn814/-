import { useState, useEffect } from 'react';
import { audio } from '../utils/audio';
import TypewriterText from './TypewriterText';
import pixelGirl from '../assets/images/pixel_girl_8bit_1785916465260.jpg';
import pixelKitten from '../assets/images/pixel_kitten_8bit_1785916481712.jpg';
import pixelRobot from '../assets/images/pixel_robot_8bit_1785917923827.jpg';

const MyComputerIcon = () => (
  <svg width="40" height="40" viewBox="0 0 32 32" style={{ shapeRendering: 'crispEdges' }}>
    <rect x="4" y="2" width="24" height="18" fill="#dfdfdf" stroke="black" strokeWidth="1" />
    <rect x="5" y="3" width="22" height="16" fill="transparent" stroke="#fff" strokeWidth="1" />
    <rect x="6" y="4" width="20" height="14" fill="#000" stroke="#808080" strokeWidth="1" />
    <rect x="7" y="5" width="18" height="12" fill="#008080" />
    <rect x="8" y="7" width="3" height="3" fill="#fff" />
    <rect x="12" y="7" width="8" height="3" fill="#fff" />
    <rect x="2" y="20" width="28" height="10" fill="#dfdfdf" stroke="black" strokeWidth="1" />
    <rect x="3" y="21" width="26" height="8" fill="transparent" stroke="#fff" strokeWidth="1" />
    <rect x="22" y="23" width="4" height="1" fill="#000" />
    <rect x="22" y="25" width="4" height="1" fill="#000" />
    <rect x="6" y="23" width="10" height="4" fill="#000" />
    <rect x="6" y="24" width="10" height="3" fill="#808080" />
  </svg>
);

const NotepadIcon = () => (
  <svg width="36" height="40" viewBox="0 0 28 32" style={{ shapeRendering: 'crispEdges' }}>
    <path d="M2,2 L18,2 L26,10 L26,30 L2,30 Z" fill="#fff" stroke="black" strokeWidth="1" />
    <path d="M18,2 L18,10 L26,10" fill="#dfdfdf" stroke="black" strokeWidth="1" />
    <path d="M18,3 L18,9 L24,9" fill="transparent" stroke="#fff" strokeWidth="1" />
    <rect x="6" y="14" width="16" height="1" fill="#000" />
    <rect x="6" y="18" width="16" height="1" fill="#000" />
    <rect x="6" y="22" width="16" height="1" fill="#000" />
    <rect x="6" y="26" width="10" height="1" fill="#000" />
    <rect x="6" y="6" width="10" height="2" fill="#000080" />
    <rect x="6" y="10" width="8" height="2" fill="#000080" />
  </svg>
);

const WarningIcon = () => (
  <svg width="40" height="40" viewBox="0 0 32 32" style={{ shapeRendering: 'crispEdges' }}>
    <rect x="8" y="4" width="16" height="24" fill="#ff0000" />
    <rect x="4" y="8" width="24" height="16" fill="#ff0000" />
    <rect x="6" y="6" width="20" height="20" fill="#ff0000" />
    <rect x="8" y="3" width="16" height="1" fill="#000" />
    <rect x="8" y="28" width="16" height="1" fill="#000" />
    <rect x="3" y="8" width="1" height="16" fill="#000" />
    <rect x="28" y="8" width="1" height="16" fill="#000" />
    <rect x="4" y="6" width="2" height="2" fill="#000" />
    <rect x="26" y="6" width="2" height="2" fill="#000" />
    <rect x="4" y="24" width="2" height="2" fill="#000" />
    <rect x="26" y="24" width="2" height="2" fill="#000" />
    <rect x="6" y="4" width="2" height="2" fill="#000" />
    <rect x="24" y="4" width="2" height="2" fill="#000" />
    <rect x="6" y="26" width="2" height="2" fill="#000" />
    <rect x="24" y="26" width="2" height="2" fill="#000" />
    <rect x="10" y="10" width="3" height="3" fill="#fff" />
    <rect x="19" y="10" width="3" height="3" fill="#fff" />
    <rect x="12" y="12" width="3" height="3" fill="#fff" />
    <rect x="17" y="12" width="3" height="3" fill="#fff" />
    <rect x="14" y="14" width="4" height="4" fill="#fff" />
    <rect x="12" y="17" width="3" height="3" fill="#fff" />
    <rect x="17" y="17" width="3" height="3" fill="#fff" />
    <rect x="10" y="19" width="3" height="3" fill="#fff" />
    <rect x="19" y="19" width="3" height="3" fill="#fff" />
  </svg>
);

export default function IntroScreen({ onStart }: { onStart: (companion: 'girl' | 'cat' | 'robot') => void }) {
  const [showButtons, setShowButtons] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [notepadOpen, setNotepadOpen] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [desktopTime, setDesktopTime] = useState('');
  
  const [isVirusActive, setIsVirusActive] = useState(false);
  const [virusIcons, setVirusIcons] = useState<{id: number, x: number, y: number, scale: number}[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDesktopTime(now.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isVirusActive && !windowOpen) {
      const timer = setInterval(() => {
        setVirusIcons(prev => {
          if (prev.length >= 50) return prev; // Limit max icons
          const newIcon = {
            id: prev.length,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            scale: 1 + Math.random() * 0.8
          };
          return [...prev, newIcon];
        });
      }, 1000); // add a new icon every second
      
      return () => clearInterval(timer);
    }
  }, [isVirusActive, windowOpen]);

  const handleStartClick = (companion: 'girl' | 'cat' | 'robot') => {
    audio.init();
    audio.playClick();
    onStart(companion);
  };

  const handleNotepadClick = () => {
    audio.init();
    audio.playClick();
    setNotepadOpen(true);
  };

  const handleNotepadComplete = () => {
    setTimeout(() => {
      setIsGlitching(true);
      audio.playChord(); // Glitch sound
      
      setTimeout(() => {
        setIsGlitching(false);
        setNotepadOpen(false);
        setWindowOpen(true);
        audio.playChord(); // Window popup sound
      }, 1500);
    }, 1000);
  };

  const handleReject = () => {
    audio.init();
    audio.playClick();
    setWindowOpen(false);
    
    if (!isVirusActive) {
      setIsVirusActive(true);
      setVirusIcons([{
        id: 0,
        x: 40 + Math.random() * 20,
        y: 40 + Math.random() * 20,
        scale: 1
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#008080] flex flex-col selection:bg-[#000080] selection:text-white relative overflow-hidden">
      
      {/* Desktop Icons */}
      <div className="flex-1 p-4 flex flex-col gap-6 items-start">
        <div className="flex flex-col items-center gap-1 cursor-pointer w-20 group" onClick={() => { audio.init(); audio.playClick(); }}>
          <div className="w-12 h-12 flex items-center justify-center">
            <MyComputerIcon />
          </div>
          <span className="text-white text-xs pixel-font text-center px-1 group-active:bg-[#000080] group-hover:bg-[#000080]/50">我的电脑</span>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer w-20 group" onClick={handleNotepadClick}>
          <div className="w-12 h-12 flex items-center justify-center">
            <NotepadIcon />
          </div>
          <span className="text-white text-xs pixel-font text-center px-1 animate-pulse group-active:bg-[#000080] group-hover:bg-[#000080]/50">SOS.txt</span>
        </div>
      </div>

      {/* Virus Desktop Icons */}
      {isVirusActive && !windowOpen && virusIcons.map((icon) => (
        <div 
          key={`virus-${icon.id}`} 
          className="absolute flex flex-col items-center gap-1 cursor-pointer w-24 animate-shake z-10 group"
          style={{
            top: `${icon.y}%`,
            left: `${icon.x}%`,
            transform: `scale(${icon.scale})`
          }}
          onClick={() => {
            audio.init();
            audio.playClick();
            setWindowOpen(true);
          }}
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <WarningIcon />
          </div>
          <span className="text-white text-xs pixel-font text-center px-1 animate-pulse font-bold bg-red-800 group-active:bg-red-900 group-hover:bg-red-700">紧急救援.exe</span>
        </div>
      ))}

      {/* Taskbar */}
      <div className="h-8 bg-[#c0c0c0] border-t-2 border-white flex items-center justify-between px-1 z-50">
        <div className="flex items-center gap-2">
          <button className="win95-button !py-0.5 !px-2 flex items-center gap-1 font-bold text-sm">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-600 via-green-500 to-red-500"></div>
            Start
          </button>
          {notepadOpen && (
            <div className={`win95-button !py-0.5 !px-2 text-sm font-bold ${windowOpen ? '' : 'bg-[#dfdfdf] shadow-[inset_1px_1px_0px_#000,inset_-1px_-1px_0px_#fff]'}`}>
              SOS.txt
            </div>
          )}
          {windowOpen && (
            <div className="win95-button !py-0.5 !px-2 text-sm font-bold bg-[#dfdfdf] shadow-[inset_1px_1px_0px_#000,inset_-1px_-1px_0px_#fff]">
              危机应对协议
            </div>
          )}
        </div>
        <div className="win95-inset px-2 py-0.5 text-xs font-bold mr-1 flex items-center gap-2">
           <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.1-.96-2.17-1.92H8.01c.08 1.91 1.29 2.92 2.89 3.28V19h2.34v-1.66c1.68-.31 2.84-1.31 2.84-2.88 0-1.87-1.52-2.61-3.77-3.32z"/></svg>
           {desktopTime}
        </div>
      </div>

      {/* Notepad Window */}
      {notepadOpen && (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-transparent z-30 pointer-events-none">
          <div className={`win95-window w-full max-w-lg p-[3px] shadow-[4px_4px_0px_rgba(0,0,0,0.5)] pointer-events-auto ${isGlitching ? 'animate-shake' : ''}`}>
            {/* Title Bar */}
            <div className={`win95-titlebar mb-1 ${isGlitching ? 'bg-red-800' : ''}`}>
              <span className="pixel-font tracking-wide">SOS.txt - 记事本</span>
              <button onClick={() => setNotepadOpen(false)} className="win95-button !py-0 !px-1.5 font-bold" disabled={isGlitching || windowOpen}>X</button>
            </div>
            {/* Menu */}
            <div className="flex gap-4 text-xs mb-1 px-2 pixel-font">
              <span>文件(F)</span>
              <span>编辑(E)</span>
              <span>搜索(S)</span>
              <span>帮助(H)</span>
            </div>
            {/* Text Area */}
            <div className={`win95-inset bg-white p-4 h-64 overflow-y-auto pixel-font text-sm leading-relaxed ${isGlitching ? 'bg-black text-red-600' : 'text-black'}`}>
              <TypewriterText 
                text={"记录编号：#8922\n\n系统正在崩溃。我尽力了，但我救不了所有人。\n如果你能看到这条信息，说明你是不属于这个维度的外来者。\n时间不多了。\n请你...至少选择一个带走吧。\n它们不应该跟着这个世界一起毁灭。"} 
                speed={40} 
                className="whitespace-pre-wrap"
                onComplete={handleNotepadComplete}
              />
              {isGlitching && (
                <div className="mt-4 font-bold animate-pulse text-red-500 whitespace-pre-wrap">
                  {">>> 警告：系统物理结构已崩塌 <<<"}
                  <br />
                  {">>> 强制触发紧急救援协议 <<<"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Handover Window */}
      {windowOpen && (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/40 z-40">
          <div className={`win95-window w-full max-w-2xl p-[3px] shadow-[8px_8px_0px_rgba(0,0,0,0.6)] ${isGlitching ? 'animate-shake' : ''}`}>
            {/* Title Bar */}
            <div className="win95-titlebar mb-4 bg-[#000080]">
              <span className="pixel-font tracking-wide text-white">危机应对协议.exe</span>
              <button onClick={handleReject} className="win95-button !py-0 !px-1.5 font-bold">X</button>
            </div>

            {/* Content Area */}
            <div className="px-4 pb-4 flex flex-col items-center">

              {/* Text Area */}
              <div className="text-black text-sm md:text-base w-full mb-6 pixel-font font-bold leading-relaxed min-h-[4rem]">
                <div className="mb-2 text-red-700 animate-pulse">危机纪元已开启...</div>
                <div className="ml-4">
                  <TypewriterText 
                    text="在接下来的漫长旅途中，你需要一位伙伴。请选择谁来陪伴你渡过这场危机。" 
                    speed={30} 
                    onComplete={() => setShowButtons(true)}
                  />
                </div>
              </div>

              {/* Choices Area */}
              <div className={`flex flex-row justify-center w-full gap-2 sm:gap-8 transition-opacity duration-300 ${showButtons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                
                {/* Girl (Active in Prototype) */}
                <div className="flex flex-col items-center gap-1 sm:gap-4 group cursor-pointer" onClick={() => handleStartClick('girl')}>
                  <div className="w-20 h-20 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center overflow-visible transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-2 mix-blend-multiply">
                    <img 
                      src={pixelGirl} 
                      alt="美丽的少女" 
                      className="max-w-full max-h-full object-contain image-rendering-pixelated scale-[1.5] origin-bottom pointer-events-none select-none"
                    />
                  </div>
                  <span className="pixel-font text-[10px] sm:text-base font-bold text-center z-10 relative group-hover:text-red-700">美丽的少女 (当前开放)</span>
                  <button onClick={(e) => { e.stopPropagation(); handleStartClick('girl'); }} className="win95-button text-[10px] sm:text-base pixel-font px-2 sm:px-6 py-1 sm:py-2 hover:bg-[#dfdfdf] active:bg-[#a0a0a0] z-10 relative font-bold bg-[#ffffcc]">选择陪伴</button>
                </div>

                {/* Kitten (Locked for Prototype) */}
                <div className="flex flex-col items-center gap-1 sm:gap-4 opacity-40 grayscale cursor-not-allowed">
                  <div className="w-20 h-20 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center overflow-visible mix-blend-multiply">
                    <img 
                      src={pixelKitten} 
                      alt="可爱的小猫" 
                      className="max-w-full max-h-full object-contain image-rendering-pixelated scale-[1.5] origin-bottom pointer-events-none select-none"
                    />
                  </div>
                  <span className="pixel-font text-[10px] sm:text-base font-bold text-center z-10 relative text-gray-700">可爱的小猫 [暂未开放]</span>
                  <button disabled className="win95-button text-[10px] sm:text-base pixel-font px-2 sm:px-4 py-1 sm:py-2 opacity-60 cursor-not-allowed z-10 relative">V2 完整版解锁</button>
                </div>

                {/* Robot (Locked for Prototype) */}
                <div className="flex flex-col items-center gap-1 sm:gap-4 opacity-40 grayscale cursor-not-allowed">
                  <div className="w-20 h-20 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center overflow-visible mix-blend-multiply">
                    <img 
                      src={pixelRobot} 
                      alt="老旧的机器人" 
                      className="max-w-full max-h-full object-contain image-rendering-pixelated scale-[1.5] origin-bottom pointer-events-none select-none"
                    />
                  </div>
                  <span className="pixel-font text-[10px] sm:text-base font-bold text-center z-10 relative text-gray-700">老旧的机器人 [暂未开放]</span>
                  <button disabled className="win95-button text-[10px] sm:text-base pixel-font px-2 sm:px-4 py-1 sm:py-2 opacity-60 cursor-not-allowed z-10 relative">V2 完整版解锁</button>
                </div>

              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Initial hint if not open */}
      {!notepadOpen && !windowOpen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-[#ffffe1] border border-black p-2 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] flex items-center gap-2 animate-bounce mt-20 ml-20">
            <span className="pixel-font text-black text-sm">请双击读取 "SOS.txt"</span>
          </div>
        </div>
      )}
    </div>
  );
}
