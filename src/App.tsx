import { useState, useCallback, useMemo } from 'react';
import IntroScreen from './components/IntroScreen';
import EventScreen from './components/EventScreen';
import FeedbackScreen from './components/FeedbackScreen';
import SummaryScreen from './components/SummaryScreen';
import {
  generateGamePoolJIT,
  computeStats,
  getCompanionMood,
  createInitialCompanionState,
  updateCompanionState,
  checkStageDeparture
} from './utils/gameLogic';
import { AppState, GameState } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>('INTRO');

  // Support URL ?seed=12345 parameter for deterministic testing
  const initialSeed = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('seed');
      if (s) {
        const parsed = parseInt(s, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 12345;
  }, []);

  const [gameState, setGameState] = useState<GameState>({
    eventsPool: [],
    currentIndex: 0,
    history: [],
    companion: 'girl',
    companionState: createInitialCompanionState(),
    seed: initialSeed
  });
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [departureNotice, setDepartureNotice] = useState<string | null>(null);

  const stats = useMemo(() => computeStats(gameState.history), [gameState.history]);
  const mood = useMemo(
    () => getCompanionMood(gameState.companion, stats, gameState.companionState.bond),
    [gameState.companion, stats, gameState.companionState.bond]
  );

  // Companion bubble dialogue for EventScreen
  const bubbleText = useMemo(() => {
    if (gameState.companionState.departed) return undefined;
    if (gameState.currentIndex === 5) {
      // Question 6 (C-13 Variant)
      if (gameState.companionState.memory.worst) {
        return `我那时就觉得，「${gameState.companionState.memory.worst.optionLabel}」迟早会有今天。`;
      }
      if (gameState.companionState.memory.best) {
        return `就像那次「${gameState.companionState.memory.best.optionLabel}」，这次也别放弃。`;
      }
    }
    if (gameState.companionState.bond >= 75) {
      return "你选的，和我想的一样。";
    }
    if (gameState.companionState.bond < 40) {
      return "……让我想一想。";
    }
    return undefined;
  }, [gameState.currentIndex, gameState.companionState]);

  const handleTimeout = useCallback(() => {
    setGameState(prev => {
      const currentEvent = prev.eventsPool[prev.currentIndex];
      const newHistory = [
        ...prev.history,
        {
          eventId: currentEvent.id,
          optionId: 'TIMEOUT',
          optionLabel: '中立弃权 (超时)',
          reward: '历史在这个节点随机发展',
          cost: '无'
        }
      ];

      return {
        ...prev,
        history: newHistory,
        currentIndex: prev.currentIndex < prev.eventsPool.length - 1 ? prev.currentIndex + 1 : prev.currentIndex
      };
    });

    if (gameState.currentIndex < gameState.eventsPool.length - 1) {
      setSelectedOptionId(null);
      setAppState('EVENT');
    } else {
      setAppState('SUMMARY');
    }
  }, [gameState.currentIndex, gameState.eventsPool.length]);

  const handleIntroProceed = useCallback((_companion: 'girl' | 'cat' | 'robot') => {
    const pool = generateGamePoolJIT(initialSeed, []);
    setGameState({
      eventsPool: pool,
      currentIndex: 0,
      history: [],
      companion: 'girl',
      companionState: createInitialCompanionState(),
      seed: initialSeed
    });
    setAppState('EVENT');
  }, [initialSeed]);

  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedOptionId(optionId);
    setAppState('FEEDBACK');
  }, []);

  const handleNext = useCallback(() => {
    const currentEvent = gameState.eventsPool[gameState.currentIndex];
    const selectedOption = currentEvent.options.find(o => o.id === selectedOptionId);

    if (selectedOption) {
      const newRecord = {
        eventId: currentEvent.id,
        optionId: selectedOption.id,
        optionLabel: selectedOption.label,
        reward: selectedOption.reward,
        cost: selectedOption.cost
      };
      const updatedHistory = [...gameState.history, newRecord];

      // Update companion state (bond + memory)
      const updatedCompanionState = updateCompanionState(
        gameState.companionState,
        currentEvent,
        selectedOption,
        gameState.companion
      );

      // Dynamically update pool so Question 6 receives the right branch after C-03 is answered
      const updatedPool = generateGamePoolJIT(gameState.seed, updatedHistory);

      // Check stage departure (after Q2 index 1, Q5 index 4, Q8 index 7)
      const depCheck = checkStageDeparture(updatedCompanionState, gameState.currentIndex);
      if (depCheck.shouldDepart) {
        setDepartureNotice(`「${depCheck.departureReason}」那天你做的决定，我一直忘不了。我该走了。`);
        updatedCompanionState.departed = true;
        updatedCompanionState.departureReason = depCheck.departureReason;
      }

      setGameState(prev => ({
        ...prev,
        eventsPool: updatedPool,
        history: updatedHistory,
        companionState: updatedCompanionState,
        currentIndex: prev.currentIndex < prev.eventsPool.length - 1 ? prev.currentIndex + 1 : prev.currentIndex
      }));
    }

    if (gameState.currentIndex < gameState.eventsPool.length - 1) {
      setSelectedOptionId(null);
      setAppState('EVENT');
    } else {
      setAppState('SUMMARY');
    }
  }, [gameState, selectedOptionId]);

  const handleRestart = useCallback(() => {
    setAppState('INTRO');
    setGameState({
      eventsPool: [],
      currentIndex: 0,
      history: [],
      companion: 'girl',
      companionState: createInitialCompanionState(),
      seed: initialSeed
    });
    setSelectedOptionId(null);
    setDepartureNotice(null);
  }, [initialSeed]);

  return (
    <div className="min-h-screen bg-[#008080] text-black selection:bg-[#000080] selection:text-white overflow-x-hidden">
      {appState === 'INTRO' && <IntroScreen onStart={handleIntroProceed} />}
      {appState === 'EVENT' && gameState.eventsPool.length > 0 && (
        <EventScreen
          key={`${gameState.eventsPool[gameState.currentIndex].id}-${gameState.currentIndex}`}
          event={gameState.eventsPool[gameState.currentIndex]}
          onSelect={handleOptionSelect}
          onTimeout={handleTimeout}
          onGiveUp={handleRestart}
          currentStep={gameState.currentIndex + 1}
          totalSteps={gameState.eventsPool.length}
          companion={gameState.companion}
          mood={mood}
          bond={gameState.companionState.bond}
          departed={gameState.companionState.departed}
          bubbleText={bubbleText}
        />
      )}
      {appState === 'FEEDBACK' && gameState.eventsPool.length > 0 && selectedOptionId && (
        <FeedbackScreen
          key={`${gameState.eventsPool[gameState.currentIndex].id}-feedback`}
          event={gameState.eventsPool[gameState.currentIndex]}
          selectedOptionId={selectedOptionId}
          onNext={handleNext}
          companion={gameState.companion}
          mood={mood}
          bond={gameState.companionState.bond}
          departed={gameState.companionState.departed}
        />
      )}
      {appState === 'SUMMARY' && (
        <SummaryScreen
          history={gameState.history}
          companion={gameState.companion}
          companionState={gameState.companionState}
          seed={gameState.seed}
          onRestart={handleRestart}
        />
      )}

      {/* Stage Departure Notification Modal */}
      {departureNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-[420px] max-w-[92vw] win95-window p-[3px] shadow-[4px_4px_0px_rgba(0,0,0,0.8)]">
            <div className="win95-titlebar bg-[#800000] text-white flex items-center justify-between mb-3 px-2 py-1">
              <span className="font-bold text-xs sm:text-sm pixel-font">⚠️ 少女决裂离开</span>
              <button
                onClick={() => setDepartureNotice(null)}
                className="win95-button !py-0 !px-1.5 font-bold"
              >
                X
              </button>
            </div>
            <div className="p-3 sm:p-4 flex flex-col items-center text-center">
              <div className="text-3xl mb-2">💔</div>
              <div className="win95-inset bg-[#fff0f0] p-3 text-xs sm:text-sm pixel-font leading-relaxed mb-4 text-red-950">
                {departureNotice}
              </div>
              <div className="text-[11px] text-gray-700 pixel-font mb-4">
                羁绊值跌破 20。少女已在阶段过渡中离开队伍，后续窗口旁位置将永久留空。
              </div>
              <button
                onClick={() => setDepartureNotice(null)}
                className="px-6 py-1.5 bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white font-bold pixel-font text-xs sm:text-sm"
              >
                独自继续前进
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
