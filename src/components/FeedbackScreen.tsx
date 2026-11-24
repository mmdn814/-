import { GameEvent } from '../types';
import TypewriterText from './TypewriterText';
import { useState, useEffect } from 'react';
import { audio } from '../utils/audio';
import Companion from './Companion';

export default function FeedbackScreen({ 
  event, 
  selectedOptionId, 
  onNext,
  companion,
  mood
}: { 
  key?: string | number;
  event: GameEvent; 
  selectedOptionId: string; 
  onNext: () => void;
  companion: string | null;
  mood?: number;
}) {
  const selectedOption = event.options.find(o => o.id === selectedOptionId)!;
  const [rewardCompleted, setRewardCompleted] = useState(false);
  const [costCompleted, setCostCompleted] = useState(false);
  const [textCompleted, setTextCompleted] = useState(false);

  useEffect(() => {
    // If there is no reward text, instantly skip to cost.
    if (!selectedOption.reward) setRewardCompleted(true);
    // If there is no cost text, instantly mark cost as completed.
    if (!selectedOption.cost) setCostCompleted(true);
    // If neither exists, we rely on textCompleted
    if (selectedOption.reward || selectedOption.cost) setTextCompleted(true);
  }, [selectedOption.reward, selectedOption.cost]);

  useEffect(() => {
    audio.playChord();
  }, []);

  const showNext = rewardCompleted && costCompleted && textCompleted;

  const handleNext = () => {
    audio.playClick();
    onNext();
  };

  return (
    <div className="min-h-screen bg-[#008080] flex items-center justify-center p-4 selection:bg-[#000080] selection:text-white">
      <div className="win95-window w-full max-w-lg p-[3px]">
        {/* Title Bar */}
        <div className="win95-titlebar mb-4">
          <span className="pixel-font tracking-wide">执行结果_{selectedOption.id}.txt</span>
          <div className="flex gap-1">
             <button className="win95-button !py-0 !px-1.5 font-bold" disabled>_</button>
             <button className="win95-button !py-0 !px-1.5 font-bold">X</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 pb-4 flex flex-col items-center">
          
          <div className="flex flex-col gap-4 w-full mb-6">
            <div className="win95-inset bg-white p-4 w-full min-h-[160px]">
              <div className="text-black text-sm md:text-base pixel-font leading-relaxed whitespace-pre-wrap">
                <div className="font-bold border-b-2 border-black pb-2 mb-4 uppercase">
                  执行操作：{selectedOption.label}
                </div>
                
                {selectedOption.reward && (
                  <div className="mb-4">
                    <div className="font-bold">最终结果：</div>
                    <div className="ml-4">
                      <TypewriterText 
                        text={selectedOption.reward} 
                        speed={30} 
                        onComplete={() => setRewardCompleted(true)}
                      />
                    </div>
                  </div>
                )}
                
                {selectedOption.cost && rewardCompleted && (
                  <div>
                    <div className="font-bold">系统代价：</div>
                    <div className="ml-4 text-red-700">
                      <TypewriterText 
                        text={selectedOption.cost} 
                        speed={30}
                        onComplete={() => setCostCompleted(true)}
                      />
                    </div>
                  </div>
                )}

                {!selectedOption.reward && !selectedOption.cost && selectedOption.text && (
                  <div className="mb-4">
                    <div className="font-bold">结局推演：</div>
                    <div className="ml-4">
                      <TypewriterText 
                        text={selectedOption.text} 
                        speed={30} 
                        onComplete={() => setTextCompleted(true)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`flex justify-end w-full transition-opacity duration-300 ${showNext ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <button onClick={handleNext} className="win95-button text-sm md:text-base pixel-font px-8 py-3 min-h-[48px] font-bold cursor-pointer hover:bg-[#dfdfdf] active:bg-[#a0a0a0]">
               确认并继续
             </button>
          </div>
          
        </div>
      </div>
      {/* Fixed Companion */}
      <Companion companion={companion} mood={mood} />
    </div>
  );
}

