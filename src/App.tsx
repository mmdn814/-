import { useState, useCallback } from 'react';
import IntroScreen from './components/IntroScreen';
import EventScreen from './components/EventScreen';
import FeedbackScreen from './components/FeedbackScreen';
import SummaryScreen from './components/SummaryScreen';
import { generateGamePool } from './utils/gameLogic';
import { AppState, GameState } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>('INTRO');
  
  const [gameState, setGameState] = useState<GameState>({
    eventsPool: [],
    currentIndex: 0,
    history: [],
    companion: null
  });

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleTimeout = useCallback(() => {
    setGameState(prev => {
      const currentEvent = prev.eventsPool[prev.currentIndex];
      return {
        ...prev,
        history: [
          ...prev.history,
          {
            eventId: currentEvent.id,
            optionId: 'TIMEOUT',
            optionLabel: '中立弃权 (超时)',
            reward: '历史在这个节点随机发展',
            cost: '无'
          }
        ],
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

  const handleIntroProceed = useCallback((companion: 'girl' | 'cat' | 'robot') => {
    const pool = generateGamePool();
    setGameState({
      eventsPool: pool,
      currentIndex: 0,
      history: [],
      companion: companion
    });
    setAppState('EVENT');
  }, []);

  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedOptionId(optionId);
    setAppState('FEEDBACK');
  }, []);

  const handleNext = useCallback(() => {
    const currentEvent = gameState.eventsPool[gameState.currentIndex];
    const selectedOption = currentEvent.options.find(o => o.id === selectedOptionId);
    
    if (selectedOption) {
      setGameState(prev => ({
        ...prev,
        history: [
          ...prev.history,
          {
            eventId: currentEvent.id,
            optionId: selectedOption.id,
            optionLabel: selectedOption.label,
            reward: selectedOption.reward,
            cost: selectedOption.cost
          }
        ]
      }));
    }

    if (gameState.currentIndex < gameState.eventsPool.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }));
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
      companion: null
    });
    setSelectedOptionId(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#008080] text-black selection:bg-[#000080] selection:text-white overflow-x-hidden">
      {appState === 'INTRO' && <IntroScreen onStart={handleIntroProceed} />}
      {appState === 'EVENT' && gameState.eventsPool.length > 0 && (
        <EventScreen 
          key={gameState.eventsPool[gameState.currentIndex].id}
          event={gameState.eventsPool[gameState.currentIndex]} 
          onSelect={handleOptionSelect}
          onTimeout={handleTimeout}
          onGiveUp={handleRestart}
          currentStep={gameState.currentIndex + 1}
          totalSteps={gameState.eventsPool.length}
          companion={gameState.companion}
        />
      )}
      {appState === 'FEEDBACK' && gameState.eventsPool.length > 0 && selectedOptionId && (
        <FeedbackScreen
          key={gameState.eventsPool[gameState.currentIndex].id}
          event={gameState.eventsPool[gameState.currentIndex]}
          selectedOptionId={selectedOptionId}
          onNext={handleNext}
          companion={gameState.companion}
        />
      )}
      {appState === 'SUMMARY' && (
        <SummaryScreen history={gameState.history} onRestart={handleRestart} />
      )}
    </div>
  );
}
