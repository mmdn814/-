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
  mood,
  bond,
  departed,
  bubbleText
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
  bond?: number;
  departed?: boolean;
  bubbleText?: string;
}) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [showOptions, setShowOptions] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  
  useEffect(() => {
    setTimeLeft(15);
    setShowOptions(false);
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
    <div className="min-h-screen bg-[#008080] flex items-center justify-center p-3 sm:p-4 selection:bg-[#000080] selection:text-white">
      <div className="win95-window w-full max-w-2xl p-[3px]">
        {/* Title Bar */}
        <div className="win95-titlebar mb-3">
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
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col">
          
          {/* Recall Banner (First screen visible) */}
          {event.recall && (
            <div className="win95-inset bg-[#ffffcc] p-2.5 mb-2.5 text-black pixel-font text-xs sm:text-sm font-bold flex items-center border-l-4 border-l-[#d4b106] shadow-sm">
              <span className="leading-tight">{event.recall}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 mb-2">
            {/* Description Text */}
            <div className="win95-inset bg-white p-3 sm:p-4 w-full min-h-[100px] max-h-[260px] overflow-y-auto">
               <h2 className="text-base md:text-xl font-bold mb-3 pixel-font border-b-2 border-black pb-1.5 flex items-center gap-1.5">
                 <span>📄</span>
                 <span>{event.title}</span>
               </h2>
               <div className="text-black text-sm md:text-base pixel-font leading-relaxed whitespace-pre-wrap">
                 <TypewriterText 
                   text={event.description} 
                   speed={15}
                   onComplete={() => setShowOptions(true)} 
                 />
               </div>
            </div>
          </div>

          {/* Options (Single Click Direct Execution, >= 44px touch targets) */}
          <div className={`flex flex-col gap-1 transition-opacity duration-300 ${showOptions ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="pixel-font font-bold mb-1 flex items-center justify-between gap-2 text-xs sm:text-sm">
               <div>可执行的操作指令（点击直接生效）：</div>
               <div className={`text-xs sm:text-sm ${timeLeft <= 5 ? 'text-red-600 animate-pulse font-bold' : 'text-black'}`}>
                 倒计时：{timeLeft.toString().padStart(2, '0')}s
               </div>
             </div>
             <div className="win95-inset bg-white max-h-[360px] overflow-y-auto divide-y divide-gray-300">
               {event.options.map((opt, index) => {
                 const ICONS = ['★', '◆', '●', '■', '▲'];
                 return (
                   <button
                     key={opt.id}
                     onClick={() => handleSelect(opt.id)}
                     onMouseEnter={() => audio.playHover()}
                     className="w-full text-left pixel-font flex flex-row items-center hover:bg-[#000080] hover:text-white transition-colors cursor-pointer group p-2 min-h-[48px] active:bg-[#000050]"
                   >
                     <div className="w-8 sm:w-10 flex items-center justify-center border-r border-gray-400 group-hover:border-white/40 shrink-0 self-stretch mr-2">
                       <span className="text-base sm:text-lg opacity-80 group-hover:opacity-100">
                         {ICONS[index % ICONS.length]}
                       </span>
                     </div>
                     <div className="flex flex-col flex-grow py-0.5 pr-2">
                       <div className="flex items-center gap-1.5 flex-wrap">
                         <span className="font-bold text-sm sm:text-base">
                           [{opt.id}] {opt.label}
                         </span>
                         {opt.text && (
                           <span className="text-xs opacity-75 group-hover:opacity-90">
                             - {opt.text}
                           </span>
                         )}
                       </div>
                       {(opt.reward || opt.cost) && (
                         <div className="text-[11px] sm:text-xs mt-0.5 flex gap-2 flex-wrap group-hover:text-white/80">
                           {opt.reward && <span className="text-green-700 group-hover:text-green-200">筹码: {opt.reward}</span>}
                           {opt.cost && <span className="text-red-700 group-hover:text-red-200">代价: {opt.cost}</span>}
                         </div>
                       )}
                     </div>
                   </button>
                 );
               })}
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
                onClick={onTimeout}
                className="win95-button !py-0 !px-1.5 font-bold"
              >
                X
              </button>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">⚠️</div>
                <div className="text-sm pixel-font">
                  决策超时！系统将自动将该节点判定为中立弃权，历史将自行演进。
                </div>
              </div>
              <button
                onClick={onTimeout}
                className="px-6 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white font-bold pixel-font"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Give Up Modal */}
      {showGiveUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="w-[360px] max-w-[90vw] bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
            <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide pixel-font">警告：重置历史</span>
              <button 
                onClick={() => setShowGiveUpModal(false)}
                className="win95-button !py-0 !px-1.5 font-bold"
              >
                X
              </button>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="text-sm pixel-font mb-4 text-center">
                确定要放弃当前文明推演吗？所有选择与伙伴羁绊记录将被清空。
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

      {/* Fixed Companion (hidden if departed) */}
      <Companion companion={companion} mood={mood} bond={bond} departed={departed} bubbleText={bubbleText} />
    </div>
  );
}
