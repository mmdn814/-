import { GameState, CompanionState } from '../types';
import { useMemo, useEffect } from 'react';
import { audio } from '../utils/audio';
import { allEvents } from '../data/events';
import { computeStats, Stats, getCompanionMood, simulateCounterfactualRun, PREFIXES, SUFFIXES } from '../utils/gameLogic';
import CompanionPortrait from './CompanionPortrait';

const QUOTES = [
  { text: "“效率是你的信仰，代价是别人的骨头。”", condition: (s: any) => s.tech > 8 && s.human < -5 },
  { text: "“文明变慢了，但终于没有人被留在后面。”", condition: (s: any) => s.equal > 8 && s.tech < 0 },
  { text: "“你选择不再定义'人'是什么——这也算一种勇敢，或逃避。”", condition: (s: any) => s.orthodox < -8 },
  { text: "“没有赢，也没打算认输——你只是让故事停在了这里。”", condition: (s: any) => s.orthodox > 5 && s.tech < -5 },
  { text: "“你赢得了秩序，输掉了每一个愿意反驳你的人。”", condition: (s: any) => s.equal < -5 && s.human < 0 },
  { text: "“在你的文明里，安全是用自由折现的。”", condition: (s: any) => s.tech > 0 && s.orthodox < -5 },
  { text: "“没能救所有人，但你没有假装可以选择放弃谁。”", condition: (s: any) => s.equal > 5 && s.human > 0 },
  { text: "“你把权力还给了普通人，然后祈祷他们别搞砸。”", condition: (s: any) => s.equal > 5 && s.orthodox > 0 },
  { text: "“你把方向盘交了出去，理由是：反正握不住。”", condition: (s: any) => s.tech > 5 && s.human < -5 },
  { text: "“你把人类交给了更聪明的东西，然后松了口气。”", condition: (s: any) => s.tech > 5 && s.human < 0 },
  { text: "“文明的狂飙，不需要被淘汰者的同意。”", condition: (s: any) => s.tech > 5 && s.equal < 0 },
];

const COMPANION_AXIS: Record<string, keyof Stats> = {
  girl: 'human',
  cat: 'orthodox',
  robot: 'tech'
};

const COMPANION_FATE: Record<string, { pos: string; neu: string; neg: string }> = {
  girl: {
    pos: "她一直在你身边，眼神清亮。在这个文明的最终账本里，'人'这个字被好好保留了下来。",
    neu: "她一直安静地跟着，看着这个文明一步步走到了终局。",
    neg: "她虽然留到了最后，但眼底的光芒早已熄灭。她不知该如何评价你创造的世界。"
  },
  cat: {
    pos: "小猫窝在你怀里睡着了，呼吸均匀。这个世界还留着一点，可以被称为'自然'的东西。",
    neu: "小猫始终警惕地竖着耳朵，像是分不清哪边才是危险。它活下来了，但没人知道它还算不算'猫'。",
    neg: "小猫的毛皮下渐渐显出电路的纹路。你没注意到它是什么时候，被这个世界改造成别的样子的。"
  },
  robot: {
    pos: "机器人的外壳换了一轮又一轮，最后连它自己都说不清，自己还是不是出发时的那一台。但它一直没有关机。",
    neu: "机器人偶尔会卡顿，像是在两种记忆之间反复横跳。它跟到了最后，只是有点，认不清自己是谁了。",
    neg: "机器人在半路彻底报废，你没能找到能修好它的地方——这个文明已经不再需要修理工了。"
  }
};

export default function SummaryScreen({
  history,
  companion,
  companionState,
  seed = 12345,
  onRestart
}: {
  history: GameState['history'];
  companion: string | null;
  companionState?: CompanionState;
  seed?: number;
  onRestart: () => void;
}) {
  const stats = useMemo(() => computeStats(history), [history]);

  const { title, quote, traits } = useMemo(() => {
    const prefix = PREFIXES.find(p => p.condition(stats))?.text || "未知的";
    const suffix = SUFFIXES.find(s => s.condition(stats))?.text || "文明共同体";
    const quoteStr = QUOTES.find(q => q.condition(stats))?.text || "“所有的选择，最终都沉淀为历史的尘埃。”";

    const tags = [];
    if (stats.tech > 0) tags.push("拥抱奇点"); else tags.push("拒绝异化");
    if (stats.human > 0) tags.push("人本主义"); else tags.push("优胜劣汰");
    if (stats.equal > 0) tags.push("资源平权"); else tags.push("极致效率");

    return {
      title: `${prefix}${suffix}`,
      quote: quoteStr,
      traits: tags
    };
  }, [stats]);

  const moodVal = useMemo(
    () => getCompanionMood(companion, stats, companionState?.bond),
    [companion, stats, companionState?.bond]
  );

  const fateText = useMemo(() => {
    if (!companion) return null;
    const axis = COMPANION_AXIS[companion];
    if (!axis) return null;
    const val = stats[axis];
    const fate = COMPANION_FATE[companion];
    if (!fate) return null;
    return val >= 5 ? fate.pos : val <= -5 ? fate.neg : fate.neu;
  }, [companion, stats]);

  // Compute Parallel Earth Counterfactual
  const parallelResult = useMemo(() => {
    if (history.length === 0) return null;
    return simulateCounterfactualRun(seed, history);
  }, [seed, history]);

  // Pick defining moments
  const definingMoments = useMemo(() => {
    if (history.length < 2) return history;
    return [history[0], history[history.length - 1]];
  }, [history]);

  useEffect(() => {
    audio.playTada();
  }, []);

  const mapToPercentage = (val: number) => Math.max(0, Math.min(100, (val + 15) / 30 * 100));
  const pT = `50,${50 - (mapToPercentage(stats.tech)/100)*40}`;
  const pH = `${50 + (mapToPercentage(stats.human)/100)*40},50`;
  const pE = `50,${50 + (mapToPercentage(stats.equal)/100)*40}`;
  const pO = `${50 - (mapToPercentage(stats.orthodox)/100)*40},50`;

  const isDeparted = companionState?.departed;
  const worstMemoryLabel = companionState?.memory.worst?.optionLabel;

  return (
    <div className="min-h-screen bg-[#008080] flex flex-col items-center justify-center py-6 px-4 md:px-8 selection:bg-[#000080] selection:text-white">
      {/* Poster Container */}
      <div
        className="w-full max-w-lg win95-window p-[3px] mb-6"
        id="share-poster"
      >
        {/* Title Bar */}
        <div className="win95-titlebar mb-4">
          <span className="pixel-font tracking-wide">分析报告.exe</span>
          <div className="flex gap-1">
            <button className="win95-button !py-0 !px-1.5 font-bold" disabled>_</button>
            <button className="win95-button !py-0 !px-1.5 font-bold">X</button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="win95-inset bg-white p-4">
            <div className="text-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold mb-1 pixel-font">
                {title}
              </h2>
              {/* Removed fake percentage: Honest attribution */}
              <div className="text-xs md:text-sm text-gray-700 pixel-font mb-4">
                基于历史因果推导生成的文明终局画像
              </div>
              <div className="font-bold italic text-sm md:text-base px-2 py-2 bg-black text-white pixel-font inline-block">
                {quote}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {traits.map(trait => (
                <span key={trait} className="px-2 py-1 text-xs font-bold border-2 border-black bg-black text-white pixel-font">
                  {trait}
                </span>
              ))}
            </div>

            {/* Radar Chart */}
            <div className="relative w-full max-w-[220px] mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-auto overflow-visible">
                {/* Background grids */}
                <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="#ccc" strokeWidth="0.5" />
                <polygon points="50,30 70,50 50,70 30,50" fill="none" stroke="#ccc" strokeWidth="0.5" />
                <polygon points="50,40 60,50 50,60 40,50" fill="none" stroke="#ccc" strokeWidth="0.5" />
                {/* Axes */}
                <line x1="50" y1="10" x2="50" y2="90" stroke="#ccc" strokeWidth="0.5" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="#ccc" strokeWidth="0.5" />
                {/* Data polygon */}
                <polygon points={`${pT} ${pH} ${pE} ${pO}`} fill="rgba(0,0,0,0.15)" stroke="black" strokeWidth="1.5" />
                {/* Axis labels */}
                <text x="50" y="5" fontSize="4.5" textAnchor="middle" className="font-bold pixel-font">科技</text>
                <text x="96" y="51.5" fontSize="4.5" textAnchor="start" className="font-bold pixel-font">人文</text>
                <text x="50" y="98" fontSize="4.5" textAnchor="middle" className="font-bold pixel-font">平权</text>
                <text x="4" y="51.5" fontSize="4.5" textAnchor="end" className="font-bold pixel-font">原教旨</text>
              </svg>
            </div>

            {/* Companion Fate with Portrait */}
            {isDeparted ? (
              <div className="win95-inset bg-[#fbeaea] border-l-4 border-l-red-600 p-3 mb-6 text-xs md:text-sm pixel-font leading-relaxed flex items-center gap-3">
                <div className="opacity-30 grayscale shrink-0">
                  <CompanionPortrait companion={companion} mood={-1} size={54} />
                </div>
                <div className="text-left text-red-900">
                  <div className="font-bold mb-0.5">【决裂离去】</div>
                  <div>
                    {worstMemoryLabel ? `「${worstMemoryLabel}」` : '那次决定'}之后，她再也没有回来。窗口旁的位置永远空着。
                  </div>
                </div>
              </div>
            ) : (
              fateText && (
                <div className="win95-inset bg-[#f5f5f5] border-l-4 border-l-blue-600 p-3 mb-6 text-xs md:text-sm pixel-font leading-relaxed flex items-center gap-3 text-left">
                  <CompanionPortrait companion={companion} mood={moodVal} size={54} />
                  <div>
                    <div className="font-bold mb-0.5">【{companion === 'girl' ? '少女命运' : '伙伴结局'}】</div>
                    <div>{fateText}</div>
                  </div>
                </div>
              )
            )}

            {/* Parallel Earth Counterfactual Card */}
            {parallelResult && (
              <div className="win95-window p-3 mb-6 bg-[#f0f4f8] border-2 border-dashed border-[#000080]/60">
                <div className="font-bold pixel-font text-xs sm:text-sm border-b border-gray-400 pb-1 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#000080]">
                    <span>🌍</span> 平行地球反事实对照
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 border border-blue-400 font-normal">
                    同种子纯函数重放
                  </span>
                </div>
                <div className="pixel-font text-xs sm:text-sm text-gray-800 space-y-1.5 text-left">
                  <div>
                    <span className="font-bold">分水岭对照：</span>
                    如果你在第 1 题【{parallelResult.pivotOptionLabel}】改选为【<span className="text-blue-700 font-bold">{parallelResult.counterOptionLabel}</span>】
                  </div>
                  <div>
                    <span className="font-bold">衍生分支：</span>
                    第 6 题将会触发【<span className="text-purple-700 font-bold">{parallelResult.divergentEventTitle}</span>】
                  </div>
                  <div>
                    <span className="font-bold">平行结局：</span>
                    文明称号走向【<span className="text-black font-bold">{parallelResult.parallelTitle}</span>】
                  </div>
                  <div>
                    <span className="font-bold">少女命运：</span>
                    <span className={parallelResult.companionFate === '决裂离开' ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
                      {parallelResult.companionFate}
                    </span>
                  </div>
                  <div className="text-xs text-gray-800 pt-1.5 border-t border-gray-300 font-medium leading-relaxed">
                    * {parallelResult.note}
                  </div>
                </div>
              </div>
            )}

            {/* Defining Moments */}
            <div className="border-t border-black pt-4">
              <h3 className="text-sm font-bold mb-3 pixel-font">关键决策</h3>
              <div className="space-y-2">
                {definingMoments.map((moment, idx) => {
                  const event = allEvents.find(e => e.id === moment.eventId);
                  const option = event?.options.find(o => o.id === moment.optionId);
                  return (
                    <div key={idx} className="text-xs md:text-sm pixel-font flex flex-col md:flex-row md:items-center gap-1">
                      <span className="font-bold opacity-70">{moment.eventId}</span>
                      <span className="hidden md:inline mx-1">/</span>
                      <span>
                        {event?.title.replace(moment.eventId + ' ', '')} → <span className="font-bold">{option?.label}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-lg flex flex-row gap-4">
        <button
          onClick={() => {
            audio.playClick();
            alert("请截图保存这张文明画像！");
          }}
          className="win95-button flex-1 py-3 min-h-[48px] text-sm md:text-base font-bold flex items-center justify-center gap-2 pixel-font bg-[#c0c0c0] cursor-pointer hover:bg-[#dfdfdf] active:bg-[#a0a0a0]"
        >
          晒出文明画像
        </button>
        <button
          onClick={() => {
            audio.playClick();
            onRestart();
          }}
          className="win95-button flex-1 py-3 min-h-[48px] text-sm md:text-base font-bold flex items-center justify-center gap-2 pixel-font bg-[#c0c0c0] cursor-pointer hover:bg-[#dfdfdf] active:bg-[#a0a0a0]"
        >
          还有23种结局
        </button>
      </div>
    </div>
  );
}
