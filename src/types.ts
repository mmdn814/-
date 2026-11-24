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
  tags?: string[];
};

export type GameEvent = {
  id: string;
  stage: number;
  title: string;
  description: string;
  options: Option[];
  recall?: string;
  isBranchEvent?: boolean;
};

export type AppState = 'INTRO' | 'EVENT' | 'FEEDBACK' | 'SUMMARY';

export type CompanionMemory = {
  eventId: string;
  eventTitle: string;
  optionId: string;
  optionLabel: string;
  delta: number;
};

export type CompanionState = {
  bond: number;
  departed: boolean;
  departureReason?: string;
  memory: {
    best?: CompanionMemory;
    worst?: CompanionMemory;
  };
};

export type CounterfactualResult = {
  pivotEventId: string;
  pivotOptionId: string;
  pivotOptionLabel: string;
  counterOptionId: string;
  counterOptionLabel: string;
  divergentEventId: string;
  divergentEventTitle: string;
  parallelTitle: string;
  companionFate: string;
  note: string;
};

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
  companionState: CompanionState;
  seed: number;
};
