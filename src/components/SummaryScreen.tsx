import { GameState } from '../types';
import { useMemo, useEffect, useState } from 'react';
import { Share2, RotateCcw } from 'lucide-react';
import { audio } from '../utils/audio';
import { allEvents } from '../data/events';
import { computeStats, Stats } from '../utils/gameLogic';

const PREFIXES = [
  { text: "折叠的", condition: (s: any) => s.tech > 5 && s.equal < -5 },
  { text: "寡头的", condition: (s: any) => s.equal < -8 },
  { text: "废土上的", condition: (s: any) => s.tech < -5 && s.human < 0 },
  { text: "数字", condition: (s: any) => s.tech > 5 },
  { text: "觉醒的", condition: (s: any) => s.human > 0 && s.equal > 0 },
  { text: "沉默的", condition: (s: any) => s.equal < -5 },
  { text: "冰冷的", condition: (s: any) => s.human < -5 },
  { text: "温柔的", condition: (s: any) => s.human > 5 },
  { text: "众生的", condition: (s: any) => s.equal > 5 },
];

const SUFFIXES = [
  { text: "算法利维坦", condition: (s: any) => s.tech > 5 && s.equal < -5 },
  { text: "蜂巢共同体", condition: (s: any) => s.tech > 5 && s.equal > 5 },
  { text: "永生债务人", condition: (s: any) => s.tech > 5 && s.equal < -5 && s.human < 0 },
  { text: "硅基先知", condition: (s: any) => s.tech > 8 },
  { text: "最后的人类议会", condition: (s: any) => s.orthodox > 0 && s.human > 5 },
  { text: "数字封建庄园", condition: (s: any) => s.tech > 0 && s.equal < -8 },
  { text: "平权自治体", condition: (s: any) => s.equal > 5 && s.tech <= 5 },
  { text: "碳基保护区", condition: (s: any) => s.orthodox > 5 },
  { text: "星际弃儿", condition: (s: any) => s.tech < -5 },
];

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
    pos: "她还在你身边，眼神比出发时更亮了一些。至少在这个文明的账本里，'人'这个字没有被划掉。",
    neu: "她一直安静地跟着，像是在等一个你没能给出的承诺。旅途结束时，她只是笑了笑，什么也没说。",
    neg: "她在某次确认执行后不再说话。你后来才明白，那个选项没有留给'她'活下去的理由。"
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
  onRestart
}: {
  history: GameState['history'];
  companion: string | null;
  onRestart: () => void;
}) {
  const [rarity] = useState(() => (Math.random() * 5 + 0.1).toFixed(1));

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

  const fateText = useMemo(() => {
    if (!companion) return null;
    const axis = COMPANION_AXIS[companion];
    if (!axis) return null;
    const val = stats[axis];
    const fate = COMPANION_FATE[companion];
    if (!fate) return null;
    return val >= 5 ? fate.pos : val <= -5 ? fate.neg : fate.neu;
  }, [companion, stats]);

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
              <div className="text-xs md:text-sm text-gray-700 pixel-font mb-4">
                全服仅 <span className="font-bold text-black">{rarity}%</span> 玩家抵达此结局
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

            {/* Companion Fate */}
            {fateText && (
              <div className="win95-inset bg-[#f5f5f5] p-3 mb-6 text-xs md:text-sm pixel-font leading-relaxed text-center">
                {fateText}
              </div>
            )}

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
          className="win95-button flex-1 py-2 text-sm md:text-base font-bold flex items-center justify-center gap-2 pixel-font bg-[#c0c0c0]"
        >
          晒出文明画像
        </button>
        <button
          onClick={() => {
            audio.playClick();
            onRestart();
          }}
          className="win95-button flex-1 py-2 text-sm md:text-base font-bold flex items-center justify-center gap-2 pixel-font bg-[#c0c0c0]"
        >
          还有23种结局
        </button>
      </div>
    </div>
  );
}
