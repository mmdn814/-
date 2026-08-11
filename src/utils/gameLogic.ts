import { allEvents } from '../data/events';
import { GameEvent } from '../types';

// Helper to shuffle an array
export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateGamePool(): GameEvent[] {
  // We want 10 events: e.g., 2 from stage 1, 3 from stage 2, 3 from stage 3, 2 from stage 4
  const stage1 = shuffle(allEvents.filter(e => e.stage === 1)).slice(0, 2);
  const stage2 = shuffle(allEvents.filter(e => e.stage === 2)).slice(0, 3);
  const stage3 = shuffle(allEvents.filter(e => e.stage === 3)).slice(0, 3);
  const stage4 = shuffle(allEvents.filter(e => e.stage === 4)).slice(0, 2);

  const selected = [...stage1, ...stage2, ...stage3, ...stage4];

  // Ensure chronological narrative progression by sorting by ID
  selected.sort((a, b) => {
    const numA = parseInt(a.id.replace('C-', ''), 10);
    const numB = parseInt(b.id.replace('C-', ''), 10);
    return numA - numB;
  });

  return selected;
}
