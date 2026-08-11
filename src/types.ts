export type Option = {
  id: string;
  label: string;
  text: string;
  reward: string;
  cost: string;
  tech?: number;
  human?: number;
  equal?: number;
  orthodox?: number;
};

export type GameEvent = {
  id: string;
  stage: number;
  title: string;
  description: string;
  options: Option[];
};

export type AppState = 'INTRO' | 'EVENT' | 'FEEDBACK' | 'SUMMARY';

export type GameState = {
  eventsPool: GameEvent[]; // The 10 selected events
  currentIndex: number;
  history: {
    eventId: string;
    optionId: string;
    optionLabel: string;
    reward: string;
    cost: string;
  }[];
  companion: string | null;
};
