import { allEvents } from '../data/events';
import { GameEvent, GameState, Option, CompanionState, CounterfactualResult } from '../types';
import { C13_VARIANTS, patchEventTags } from '../data/pocEventsPatch';

// --- Mulberry32 PRNG and Positional Hash ---

export function hashPositional(seed: number, stage: number, slot: number): number {
  let h = (seed ^ (stage * 0x9e3779b9) ^ (slot * 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

export function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// --- JIT Pool Generation ---

export function getC13Variant(c03OptionId?: string): GameEvent {
  if (c03OptionId === 'A') return C13_VARIANTS.corp;
  if (c03OptionId === 'C') return C13_VARIANTS.state;
  if (c03OptionId === 'B') return C13_VARIANTS.split;
  if (c03OptionId === 'D') return C13_VARIANTS.open;
  return C13_VARIANTS.corp; // fallback
}

export function generateGamePoolJIT(seed: number, history: GameState['history'] = []): GameEvent[] {
  // Patched base events
  const patchedEvents = allEvents.map(patchEventTags);

  // Stage 1 (2 questions): Q1 is fixed to C-03; Q2 is drawn from remaining S1
  const c03 = patchedEvents.find(e => e.id === 'C-03')!;
  const s1Remaining = patchedEvents.filter(e => e.stage === 1 && e.id !== 'C-03');
  const rngS1 = mulberry32(hashPositional(seed, 1, 1));
  const s1Picked = seededShuffle(s1Remaining, rngS1).slice(0, 1);
  const stage1 = [c03, s1Picked[0]];

  // Stage 2 (3 questions): drawn from S2 events (C-07 to C-12)
  const s2Events = patchedEvents.filter(e => e.stage === 2);
  const rngS2 = mulberry32(hashPositional(seed, 2, 0));
  const stage2 = seededShuffle(s2Events, rngS2).slice(0, 3);

  // Stage 3 (3 questions): Q6 is C-13 variant; Q7-Q8 from fixed pool [C-14, C-16, C-17, C-18]
  const c03Record = history.find(h => h.eventId === 'C-03');
  const c13Variant = getC13Variant(c03Record?.optionId);

  // S3 general pool: strictly [C-14, C-16, C-17, C-18], C-13 and C-15 completely excluded!
  const s3GeneralPool = patchedEvents.filter(
    e => e.stage === 3 && e.id !== 'C-13' && e.id !== 'C-15'
  );
  const rngS3 = mulberry32(hashPositional(seed, 3, 1));
  const s3GeneralPicked = seededShuffle(s3GeneralPool, rngS3).slice(0, 2);
  const stage3 = [c13Variant, s3GeneralPicked[0], s3GeneralPicked[1]];

  // Stage 4 (2 questions): drawn from S4 events (C-19 to C-24)
  const s4Events = patchedEvents.filter(e => e.stage === 4);
  const rngS4 = mulberry32(hashPositional(seed, 4, 0));
  const stage4 = seededShuffle(s4Events, rngS4).slice(0, 2);

  return [...stage1, ...stage2, ...stage3, ...stage4];
}

// Backward compatibility helper
export function generateGamePool(): GameEvent[] {
  return generateGamePoolJIT(Date.now(), []);
}

// --- Companion bond and emotional throughline ---

export type Stats = { tech: number; human: number; equal: number; orthodox: number };

export function computeStats(history: GameState['history']): Stats {
  const stats: Stats = { tech: 0, human: 0, equal: 0, orthodox: 0 };
  const patchedEvents = allEvents.map(patchEventTags);
  const allKnownEvents = [...patchedEvents, ...Object.values(C13_VARIANTS)];

  history.forEach(record => {
    const event = allKnownEvents.find(e => e.id === record.eventId);
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

export function computeBondDelta(
  option: Option,
  companion: string | null
): { delta: number; rawDelta: number; penalty: number } {
  if (companion !== 'girl') {
    return { delta: 0, rawDelta: 0, penalty: 0 };
  }
  const t = option.tech || 0;
  const h = option.human || 0;
  const e = option.equal || 0;
  const o = option.orthodox || 0;

  // Girl preference: (T: 0, H: +1, E: +2, O: -1)
  const dotProduct = 0 * t + 1 * h + 2 * e - 1 * o;
  const rawDelta = 3 * dotProduct;
  let penalty = 0;
  if (option.tags?.includes('privacy_open')) {
    penalty = -10;
  }
  const delta = rawDelta + penalty;
  return { delta, rawDelta, penalty };
}

export function createInitialCompanionState(): CompanionState {
  return {
    bond: 60,
    departed: false,
    memory: {}
  };
}

export function updateCompanionState(
  prevState: CompanionState,
  event: GameEvent,
  option: Option,
  companion: string | null
): CompanionState {
  if (!companion || prevState.departed) return prevState;
  const { delta } = computeBondDelta(option, companion);
  const newBond = Math.max(0, Math.min(100, prevState.bond + delta));
  const memory = { ...prevState.memory };

  if (delta > 0) {
    if (!memory.best || delta > memory.best.delta) {
      memory.best = {
        eventId: event.id,
        eventTitle: event.title,
        optionId: option.id,
        optionLabel: option.label,
        delta
      };
    }
  } else if (delta < 0) {
    if (!memory.worst || delta < memory.worst.delta) {
      memory.worst = {
        eventId: event.id,
        eventTitle: event.title,
        optionId: option.id,
        optionLabel: option.label,
        delta
      };
    }
  }

  return {
    ...prevState,
    bond: newBond,
    memory
  };
}

export function checkStageDeparture(
  state: CompanionState,
  questionIndex: number
): { shouldDepart: boolean; departureReason?: string } {
  // Only evaluate departure at stage transitions: after Q2 (index 1), Q5 (index 4), Q8 (index 7)
  if (state.departed) return { shouldDepart: false };
  if (questionIndex === 1 || questionIndex === 4 || questionIndex === 7) {
    if (state.bond < 20) {
      const worstChoice = state.memory.worst?.optionLabel || '你的冷酷决定';
      return {
        shouldDepart: true,
        departureReason: worstChoice
      };
    }
  }
  return { shouldDepart: false };
}

export function getCompanionMood(companion: string | null, stats: Stats, bond?: number): number {
  if (!companion) return 0;
  if (typeof bond === 'number') {
    // bond 0..100 mapped to -1..1
    return Math.max(-1, Math.min(1, (bond - 50) / 50));
  }
  const axis = companion === 'girl' ? stats.human : companion === 'cat' ? stats.orthodox : stats.tech;
  return Math.max(-1, Math.min(1, axis / 15));
}

// --- Title Resolution Helpers (reused from SummaryScreen logic) ---

export const PREFIXES = [
  { text: '折叠的', condition: (s: Stats) => s.tech > 5 && s.equal < -5 },
  { text: '寡头的', condition: (s: Stats) => s.equal < -8 },
  { text: '废土上的', condition: (s: Stats) => s.tech < -5 && s.human < 0 },
  { text: '数字', condition: (s: Stats) => s.tech > 5 },
  { text: '觉醒的', condition: (s: Stats) => s.human > 0 && s.equal > 0 },
  { text: '沉默的', condition: (s: Stats) => s.equal < -5 },
  { text: '冰冷的', condition: (s: Stats) => s.human < -5 },
  { text: '温柔的', condition: (s: Stats) => s.human > 5 },
  { text: '众生的', condition: (s: Stats) => s.equal > 5 },
];

export const SUFFIXES = [
  { text: '算法利维坦', condition: (s: Stats) => s.tech > 5 && s.equal < -5 },
  { text: '蜂巢共同体', condition: (s: Stats) => s.tech > 5 && s.equal > 5 },
  { text: '永生债务人', condition: (s: Stats) => s.tech > 5 && s.equal < -5 && s.human < 0 },
  { text: '硅基先知', condition: (s: Stats) => s.tech > 8 },
  { text: '最后的人类议会', condition: (s: Stats) => s.orthodox > 0 && s.human > 5 },
  { text: '数字封建庄园', condition: (s: Stats) => s.tech > 0 && s.equal < -8 },
  { text: '平权自治体', condition: (s: Stats) => s.equal > 5 && s.tech <= 5 },
  { text: '碳基保护区', condition: (s: Stats) => s.orthodox > 5 },
  { text: '星际弃儿', condition: (s: Stats) => s.tech < -5 },
];

export function getSummaryTitle(stats: Stats): string {
  const prefix = PREFIXES.find(p => p.condition(stats))?.text || '未知的';
  const suffix = SUFFIXES.find(s => s.condition(stats))?.text || '文明共同体';
  return `${prefix}${suffix}`;
}

// --- Pure Functional Counterfactual Earth Simulation (Strictly no future leakage) ---

export function selectOptionByTendency(
  newEvent: GameEvent,
  pivotOptionVector: Stats
): Option {
  let bestOption: Option = newEvent.options[0];
  let bestScore = -Infinity;

  for (const opt of newEvent.options) {
    const t = opt.tech || 0;
    const h = opt.human || 0;
    const e = opt.equal || 0;
    const o = opt.orthodox || 0;

    // Pure dot product:
    const score = (pivotOptionVector.tech * t) +
                  (pivotOptionVector.human * h) +
                  (pivotOptionVector.equal * e) +
                  (pivotOptionVector.orthodox * o);

    if (score > bestScore) {
      bestScore = score;
      bestOption = opt;
    } else if (score === bestScore) {
      // Tie breaker 1: sum of absolute values (smallest = most moderate)
      const absSumOpt = Math.abs(t) + Math.abs(h) + Math.abs(e) + Math.abs(o);
      const bestT = bestOption.tech || 0;
      const bestH = bestOption.human || 0;
      const bestE = bestOption.equal || 0;
      const bestO = bestOption.orthodox || 0;
      const absSumBest = Math.abs(bestT) + Math.abs(bestH) + Math.abs(bestE) + Math.abs(bestO);

      if (absSumOpt < absSumBest) {
        bestOption = opt;
      } else if (absSumOpt === absSumBest) {
        // Tie breaker 2: alphabetical ID
        if (opt.id < bestOption.id) {
          bestOption = opt;
        }
      }
    }
  }
  return bestOption;
}

export function simulateCounterfactualRun(
  seed: number,
  originalHistory: GameState['history']
): CounterfactualResult {
  // Pivot is Question 1 (C-03)
  const c03 = allEvents.find(e => e.id === 'C-03')!;
  const originalC03Record = originalHistory.find(h => h.eventId === 'C-03');
  const originalChoiceId = originalC03Record?.optionId || 'A';
  const originalChoiceOpt = c03.options.find(o => o.id === originalChoiceId)!;

  // Counter option mapping: A -> B, B -> A, C -> A, D -> A
  const counterOptionId = originalChoiceId === 'A' ? 'B' : 'A';
  const counterOpt = c03.options.find(o => o.id === counterOptionId)!;

  const pivotOptionVector: Stats = {
    tech: counterOpt.tech || 0,
    human: counterOpt.human || 0,
    equal: counterOpt.equal || 0,
    orthodox: counterOpt.orthodox || 0
  };

  // Build parallel history
  const parallelC03HistoryItem = {
    eventId: 'C-03',
    optionId: counterOpt.id,
    optionLabel: counterOpt.label,
    reward: counterOpt.reward,
    cost: counterOpt.cost
  };

  // Generate pool for parallel universe
  const parallelPool = generateGamePoolJIT(seed, [parallelC03HistoryItem]);
  const parallelHistory: GameState['history'] = [];
  let parallelCompanionState = createInitialCompanionState();

  for (let i = 0; i < parallelPool.length; i++) {
    const event = parallelPool[i];
    let chosenOption: Option;

    if (i === 0) {
      chosenOption = counterOpt;
    } else if (i === 5) {
      // Divergent Q6 variant: select by pure dot product of pivotOptionVector
      chosenOption = selectOptionByTendency(event, pivotOptionVector);
    } else {
      // Same questions: preserve original player choice if available
      const origRecord = originalHistory[i];
      const matchingOpt = origRecord ? event.options.find(o => o.id === origRecord.optionId) : null;
      chosenOption = matchingOpt || event.options[0];
    }

    parallelHistory.push({
      eventId: event.id,
      optionId: chosenOption.id,
      optionLabel: chosenOption.label,
      reward: chosenOption.reward,
      cost: chosenOption.cost
    });

    // Update companion bond in parallel world
    parallelCompanionState = updateCompanionState(
      parallelCompanionState,
      event,
      chosenOption,
      'girl'
    );

    // Stage transition departure check
    const depCheck = checkStageDeparture(parallelCompanionState, i);
    if (depCheck.shouldDepart) {
      parallelCompanionState = {
        ...parallelCompanionState,
        departed: true,
        departureReason: depCheck.departureReason
      };
    }
  }

  const parallelStats = computeStats(parallelHistory);
  const parallelTitle = getSummaryTitle(parallelStats);
  const divergentEvent = parallelPool[5];

  const companionFate = parallelCompanionState.departed
    ? '决裂离开'
    : parallelCompanionState.bond >= 75
    ? '亲近相伴'
    : '留在身边';

  return {
    pivotEventId: 'C-03',
    pivotOptionId: originalChoiceId,
    pivotOptionLabel: originalChoiceOpt.label,
    counterOptionId: counterOpt.id,
    counterOptionLabel: counterOpt.label,
    divergentEventId: divergentEvent.id,
    divergentEventTitle: divergentEvent.title,
    parallelTitle,
    companionFate,
    note: '只改了第 1 题；其余相同的题保留你的选择；新出现的事件按第 1 题替代选择的倾向代选。'
  };
}
