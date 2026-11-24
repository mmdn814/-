import { GameEvent } from '../types';

export const C13_VARIANTS: Record<'corp' | 'state' | 'split' | 'open', GameEvent> = {
  corp: {
    id: 'C-13α',
    stage: 3,
    title: 'C-13α 寡头拉闸',
    description: '寒潮逼停电网。你当年默许扩张的巨头宣布：电网是它的资产，先保超算，居民区轮流拉闸。',
    recall: '📎 因为你在「寡头跨界」选了「资本利维坦」',
    isBranchEvent: true,
    options: [
      {
        id: 'A',
        label: '交钱赎电',
        text: '政府高价向巨头买电保供暖',
        reward: '居民熬过了这个冬天',
        cost: '财政又被巨头吸走一大口',
        tech: 1,
        human: 1,
        equal: 0,
        orthodox: 0
      },
      {
        id: 'B',
        label: '紧急征用',
        text: '动用紧急状态法征用电网',
        reward: '电回到了公众手里',
        cost: '巨头撤资，算力断崖下跌',
        tech: -2,
        human: 1,
        equal: 2,
        orthodox: 1
      },
      {
        id: 'C',
        label: '接受安排',
        text: '默认巨头的调度方案',
        reward: '超算不停，经济稳住',
        cost: '寒夜里的居民区没人管',
        tech: 2,
        human: -2,
        equal: -2,
        orthodox: -1
      }
    ]
  },
  state: {
    id: 'C-13β',
    stage: 3,
    title: 'C-13β 国有超算抢电',
    description: '凛冬寒潮逼停电网，算力中心与居民供暖开始抢电，医院备用电已亮起红灯。这次拉闸的命令，要你自己签字。',
    recall: '📎 因为你在「寡头跨界」选了「算力公有」，这道拉闸令只能由你来签',
    isBranchEvent: true,
    options: [
      {
        id: 'A',
        label: '算力即命脉',
        text: '确保超算不断电，底层居民区轮流拉闸',
        reward: '稳住了国家最核心的智能系统与经济底盘',
        cost: '冻死骨重现街头，弱势群体在寒夜中绝望',
        tech: 2,
        human: -2,
        equal: -2,
        orthodox: -1
      },
      {
        id: 'B',
        label: '生命的重量',
        text: '强行斩断AI负荷，将最后的一度电送往医院与供暖',
        reward: '挽救了无数平民，稳固了人性的最后底线',
        cost: '金融与物流网络全面瘫痪，AI产业遭遇重创',
        tech: -2,
        human: 2,
        equal: 2,
        orthodox: 1
      },
      {
        id: 'C',
        label: '冰冷市场',
        text: '开启竞价供电，谁出价高谁优先获得能源',
        reward: '用最纯粹的市场机制解开死结',
        cost: '生存资源沦为待价而沽的商品，底层只能等死',
        tech: 0,
        human: -2,
        equal: -2,
        orthodox: 0
      },
      {
        id: 'D',
        label: '算法轮盘赌',
        text: '全市不论贫富贵贱，每15分钟随机断电均摊负荷',
        reward: '实现了机器逻辑下最冷酷无情的绝对公平',
        cost: '全社会陷入无规律停电的恐慌，秩序濒临崩溃',
        tech: 2,
        human: -2,
        equal: -2,
        orthodox: -1
      }
    ]
  },
  split: {
    id: 'C-13γ',
    stage: 3,
    title: 'C-13γ 无人掌舵',
    description: '寒潮来了。电网分散在几十家小运营商手里，没有任何人能统一调度。',
    recall: '📎 因为你在「寡头跨界」拆分了巨头',
    isBranchEvent: true,
    options: [
      {
        id: 'A',
        label: '临时授权',
        text: '授权一家运营商统一调度',
        reward: '混乱很快止住',
        cost: '新的垄断可能就此诞生',
        tech: 1,
        human: 0,
        equal: -1,
        orthodox: 0
      },
      {
        id: 'B',
        label: '社区自救',
        text: '组织社区互助、分片供电',
        reward: '邻里撑过了寒夜',
        cost: '效率低，医院也要排队',
        tech: -1,
        human: 2,
        equal: 1,
        orthodox: 1
      },
      {
        id: 'C',
        label: '交给 AI',
        text: '让 AI 自动协调所有节点',
        reward: '调度瞬间完成',
        cost: '没人看得懂它怎么分的电',
        tech: 2,
        human: -1,
        equal: 0,
        orthodox: -1
      }
    ]
  },
  open: {
    id: 'C-13γ',
    stage: 3,
    title: 'C-13γ 无人掌舵',
    description: '寒潮来了。电网分散在几十家小运营商手里，没有任何人能统一调度。',
    recall: '📎 因为你在「寡头跨界」把希望押在了开源网络',
    isBranchEvent: true,
    options: [
      {
        id: 'A',
        label: '临时授权',
        text: '授权一家运营商统一调度',
        reward: '混乱很快止住',
        cost: '新的垄断可能就此诞生',
        tech: 1,
        human: 0,
        equal: -1,
        orthodox: 0
      },
      {
        id: 'B',
        label: '社区自救',
        text: '组织社区互助、分片供电',
        reward: '邻里撑过了寒夜',
        cost: '效率低，医院也要排队',
        tech: -1,
        human: 2,
        equal: 1,
        orthodox: 1
      },
      {
        id: 'C',
        label: '交给 AI',
        text: '让 AI 自动协调所有节点',
        reward: '调度瞬间完成',
        cost: '没人看得懂它怎么分的电',
        tech: 2,
        human: -1,
        equal: 0,
        orthodox: -1
      }
    ]
  }
};

export function patchEventTags(event: GameEvent): GameEvent {
  if (event.id === 'C-07') {
    return {
      ...event,
      options: event.options.map(opt => {
        if (opt.id === 'A') {
          return {
            ...opt,
            tags: ['privacy_open']
          };
        }
        return opt;
      })
    };
  }
  return event;
}
