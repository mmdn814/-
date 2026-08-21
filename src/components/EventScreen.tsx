import { GameEvent } from '../types';
import { useState, useEffect } from 'react';
import { audio } from '../utils/audio';
import TypewriterText from './TypewriterText';
import Companion from './Companion';

export default function EventScreen({ 
  event, 
  onSelect, 
  onTimeout,
  onGiveUp,
  currentStep, 
  totalSteps,
  companion,
  mood
}: { 
  key?: string | number;
  event: GameEvent; 
  onSelect: (id: string) => void;
  onTimeout: () => void;
  onGiveUp: () => void;
  currentStep: number;
  totalSteps: number;
  companion: string | null;
  mood?: number;
}) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [showOptions, setShowOptions] = useState(false);
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  
  useEffect(() => {
    setTimeLeft(15);
    setShowOptions(false);
    setActiveOption(null);
    setShowTimeoutModal(false);
    setShowGiveUpModal(false);
  }, [event.id]);

  useEffect(() => {
    if (timeLeft <= 0 || !showOptions || showTimeoutModal || showGiveUpModal) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showOptions, showTimeoutModal]);

  useEffect(() => {
    if (showOptions && timeLeft === 0 && !showTimeoutModal && !showGiveUpModal) {
      setShowTimeoutModal(true);
      audio.playChord(); // Windows error sound
    }
  }, [timeLeft, showOptions, showTimeoutModal, showGiveUpModal]);

  useEffect(() => {
    if (showOptions && timeLeft > 0 && timeLeft <= 15 && !showGiveUpModal) {
      if (timeLeft <= 5) {
        audio.playUrgentTick();
      } else {
        audio.playTick();
      }
    }
  }, [timeLeft, showOptions, showGiveUpModal]);

  const handleSelect = (id: string) => {
    audio.playClick();
    onSelect(id);
  };

  return (
    <div className="min-h-screen bg-[#008080] flex items-center justify-center p-4 selection:bg-[#000080] selection:text-white">
      <div className="win95-window w-full max-w-2xl p-[3px]">
        {/* Title Bar */}
        <div className="win95-titlebar mb-4">
          <span className="pixel-font tracking-wide">系统提示_{currentStep}_{totalSteps}.exe</span>
          <div className="flex gap-1">
             <button className="win95-button !py-0 !px-1.5 font-bold" disabled>_</button>
             <button 
               onClick={() => {
                 audio.playClick();
                 setShowGiveUpModal(true);
               }}
               className="win95-button !py-0 !px-1.5 font-bold"
             >
               X
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 pb-4 flex flex-col">
          
          <div className="flex flex-col gap-2 mb-2">
            {/* Left: Text */}
            <div className="win95-inset bg-white p-4 w-full min-h-[120px] max-h-[300px] overflow-y-auto">
               <h2 className="text-lg md:text-xl font-bold mb-4 pixel-font border-b-2 border-black pb-2">
                 <span className="mr-2">📄</span>{event.title}
               </h2>
               <div className="text-black text-sm md:text-base pixel-font leading-relaxed whitespace-pre-wrap">
                 <TypewriterText 
                   text={event.description} 
                   speed={20}
                   onComplete={() => setShowOptions(true)} 
                 />
               </div>
            </div>
          </div>

          {/* Options */}
          <div className={`flex flex-col gap-1 transition-opacity duration-300 ${showOptions ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="pixel-font font-bold mb-1 flex items-center justify-between gap-2">
               <div>可执行的操作指令：</div>
               <div className={`text-sm md:text-base ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-black'}`}>
                 剩余时间：{timeLeft.toString().padStart(2, '0')}
               </div>
             </div>
             <div className="win95-inset bg-white max-h-[350px] overflow-y-auto">
               {event.options.map((opt, index) => {
                 const ICONS = ['★', '◆', '●', '■', '▲'];
                 const isActive = activeOption === opt.id;
                 return (
                 <div key={opt.id} className={`border-b border-gray-400 ${index === event.options.length - 1 ? 'border-b-0' : ''}`}>
                   <button
                     onClick={() => {
                       audio.playClick();
                       setActiveOption(isActive ? null : opt.id);
                     }}
                     onMouseEnter={() => audio.playHover()}
                     className={`w-full text-left pixel-font flex flex-row items-center hover:bg-[#000080] hover:text-white transition-colors cursor-pointer group ${isActive ? 'bg-[#000080] text-white' : ''}`}
                   >
                     <div className="w-10 sm:w-12 h-full min-h-[40px] sm:min-h-[50px] flex items-center justify-center border-r border-gray-400 shrink-0">
                       <span className={`text-lg sm:text-xl ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>{ICONS[index % ICONS.length]}</span>
                     </div>
                     <div className="flex flex-col p-2">
                       <span className={`font-bold text-sm sm:text-base border-dashed border-gray-300 inline-block w-fit ${isActive ? 'border-b-0' : 'border-b group-hover:border-white'}`}>
                         [{opt.id}] {opt.label}
                       </span>
                     </div>
                   </button>
                   {isActive && (
                     <div className="p-3 bg-[#e0e0e0] text-black pixel-font text-sm flex flex-col gap-2 shadow-[inset_0_3px_6px_rgba(0,0,0,0.16)]">
                       <div className="flex flex-col gap-1">
                         {opt.text && <div className="leading-tight"><span className="font-bold">{opt.reward ? '行动：' : '指向：'}</span>{opt.text}</div>}
                         {opt.reward && <div className="leading-tight"><span className="font-bold text-green-700">筹码：</span>{opt.reward}</div>}
                         {opt.cost && <div className="leading-tight"><span className="font-bold text-red-700">代价：</span>{opt.cost}</div>}
                       </div>
                       <button
                         onClick={() => handleSelect(opt.id)}
                         className="self-end mt-1 px-4 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white font-bold"
                       >
                         确认执行
                       </button>
                     </div>
                   )}
                 </div>
               )})}
             </div>
          </div>

        </div>
      </div>

      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="w-[400px] max-w-[90vw] bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
            <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide pixel-font">System message</span>
              <button 
                onClick={() => {
                  audio.playClick();
                  onTimeout();
                }}
                className="w-5 h-5 bg-[#c0c0c0] text-black font-bold flex items-center justify-center border-t border-l border-t-white border-l-white border-b border-r border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
              >
                <span className="text-xs leading-none -mt-0.5">X</span>
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              <div className="flex items-start gap-4 mb-8 w-full">
                <div className="w-10 h-10 shrink-0 rounded-full bg-red-600 flex items-center justify-center border-2 border-white text-white font-bold text-2xl">
                  !
                </div>
                <p className="text-black pixel-font font-bold mt-2 text-sm leading-relaxed">
                  TIMEOUT！你放弃了方向盘，任由列车冲向悬崖。机会已收回，正在为你计算随机毁灭概率……
                  <br /><br />
                  但历史的车轮还在转动，请务必抓住下一次机会！
                </p>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    audio.playClick();
                    onTimeout();
                  }}
                  className="px-8 py-1.5 bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white font-bold pixel-font"
                >
                  进入下一阶段
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Give Up Modal */}
      {showGiveUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="w-[400px] max-w-[90vw] bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
            <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide pixel-font">警告</span>
              <button 
                onClick={() => {
                  audio.playClick();
                  setShowGiveUpModal(false);
                }}
                className="w-5 h-5 bg-[#c0c0c0] text-black font-bold flex items-center justify-center border-t border-l border-t-white border-l-white border-b border-r border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
              >
                <span className="text-xs leading-none -mt-0.5">X</span>
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              <div className="flex items-start gap-4 mb-8 w-full">
                <div className="w-10 h-10 shrink-0 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white text-black font-bold text-2xl">
                  ?
                </div>
                <p className="text-black pixel-font font-bold mt-2 text-sm leading-relaxed">
                  你正在试图关闭系统。这相当于放弃拯救世界的机会。
                  <br /><br />
                  确定要退出当前决策吗？
                </p>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    audio.playClick();
                    onGiveUp();
                  }}
                  className="px-6 py-1.5 bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white font-bold pixel-font"
                >
                  确定放弃
                </button>
                <button 
                  onClick={() => {
                    audio.playClick();
                    setShowGiveUpModal(false);
                  }}
                  className="px-6 py-1.5 bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white font-bold pixel-font"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fixed Companion */}
      <Companion companion={companion} mood={mood} />
    </div>
  );
}

