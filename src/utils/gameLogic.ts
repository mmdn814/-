import { allEvents } from '../data/events';
import { GameEvent, GameState } from '../types';

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

// --- Added for companion emotional throughline ---

export type Stats = { tech: number; human: number; equal: number; orthodox: number };

export function computeStats(history: GameState['history']): Stats {
  const stats: Stats = { tech: 0, human: 0, equal: 0, orthodox: 0 };
  history.forEach(record => {
    const event = allEvents.find(e => e.id === record.eventId);
    const option = event?.options.find(o => o.id === record.optionId);
    if (option) {
      stats.tech += option.tech || 0;
      stats.human += option.human || 0;
      stats.equal += option.equal || 0;
      stats.orthodox += option.orthodox || 0;
    }
  });
  return stats;
}

// Maps the companion's bound axis score into a -1..1 mood value for Companion.tsx
export function getCompanionMood(companion: string | null, stats: Stats): number {
  if (!companion) return 0;
  const axis = companion === 'girl' ? stats.human : companion === 'cat' ? stats.orthodox : stats.tech;
  // Realistic axis range across a 10-question run is roughly -20..20; 15 keeps
  // mood near -1/1 only once a run leans clearly negative/positive.
  return Math.max(-1, Math.min(1, axis / 15));
}
