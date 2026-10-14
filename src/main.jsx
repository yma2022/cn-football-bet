import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Database,
  History,
  MapPin,
  Medal,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  WalletCards,
} from 'lucide-react';
import matches from './data/matches.json';
import './styles.css';

const STARTING_BALANCE = 10000;
const GAME_VERSION = 4;
const FIRST_YEAR = 1990;
const LAST_YEAR = 2026;
const years = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, index) => FIRST_YEAR + index);

const teamNames = {
  Afghanistan: '阿富汗', Algeria: '阿尔及利亚', Andorra: '安道尔', Argentina: '阿根廷', Australia: '澳大利亚',
  Bahrain: '巴林', Bangladesh: '孟加拉国', Belarus: '白俄罗斯', Bhutan: '不丹', Bolivia: '玻利维亚',
  'Bosnia and Herzegovina': '波黑', Botswana: '博茨瓦纳', Brazil: '巴西', Brunei: '文莱', Cambodia: '柬埔寨',
  Cameroon: '喀麦隆', Canada: '加拿大', Chile: '智利', Colombia: '哥伦比亚', Congo: '刚果共和国',
  'Costa Rica': '哥斯达黎加', Croatia: '克罗地亚', Curaçao: '库拉索', Czechia: '捷克', Ecuador: '厄瓜多尔',
  Egypt: '埃及', England: '英格兰', Estonia: '爱沙尼亚', Finland: '芬兰', France: '法国', Gabon: '加蓬',
  Germany: '德国', Ghana: '加纳', Guam: '关岛', Haiti: '海地', Honduras: '洪都拉斯', 'Hong Kong': '中国香港',
  Hungary: '匈牙利', Iceland: '冰岛', India: '印度', Indonesia: '印度尼西亚', Iran: '伊朗', Iraq: '伊拉克',
  Ireland: '爱尔兰', Italy: '意大利', Jamaica: '牙买加', Japan: '日本', Jordan: '约旦', Kazakhstan: '哈萨克斯坦',
  Kenya: '肯尼亚', Kuwait: '科威特', Kyrgyzstan: '吉尔吉斯斯坦', Laos: '老挝', Latvia: '拉脱维亚',
  Lebanon: '黎巴嫩', Macau: '中国澳门', Malaysia: '马来西亚', Maldives: '马尔代夫', Mali: '马里', Mexico: '墨西哥',
  Mongolia: '蒙古', Morocco: '摩洛哥', Myanmar: '缅甸', Nepal: '尼泊尔', Netherlands: '荷兰', 'New Zealand': '新西兰',
  Nigeria: '尼日利亚', 'North Korea': '朝鲜', 'North Macedonia': '北马其顿', Norway: '挪威', Oman: '阿曼',
  Pakistan: '巴基斯坦', Palestine: '巴勒斯坦', Panama: '巴拿马', Paraguay: '巴拉圭', Peru: '秘鲁', Philippines: '菲律宾',
  Poland: '波兰', Portugal: '葡萄牙', Qatar: '卡塔尔', Romania: '罗马尼亚', Russia: '俄罗斯', 'Saudi Arabia': '沙特阿拉伯',
  Senegal: '塞内加尔', Serbia: '塞尔维亚', 'Serbia and Montenegro': '塞尔维亚和黑山', Singapore: '新加坡',
  Slovakia: '斯洛伐克', Slovenia: '斯洛文尼亚', 'South Africa': '南非', 'South Korea': '韩国', Spain: '西班牙',
  'Sri Lanka': '斯里兰卡', Sweden: '瑞典', Switzerland: '瑞士', Syria: '叙利亚', Tajikistan: '塔吉克斯坦',
  Thailand: '泰国', 'Trinidad and Tobago': '特立尼达和多巴哥', Tunisia: '突尼斯', Turkey: '土耳其',
  Turkmenistan: '土库曼斯坦', Ukraine: '乌克兰', 'United Arab Emirates': '阿联酋', 'United States': '美国',
  Uruguay: '乌拉圭', Uzbekistan: '乌兹别克斯坦', Venezuela: '委内瑞拉', Vietnam: '越南', Wales: '威尔士',
  Yemen: '也门', Yugoslavia: '南斯拉夫', Zimbabwe: '津巴布韦',
};

const tournamentNames = {
  Friendly: '国际友谊赛', 'FIFA World Cup qualification': '世界杯预选赛', 'AFC Asian Cup': '亚洲杯',
  'AFC Asian Cup qualification': '亚洲杯预选赛', 'EAFF Championship': '东亚杯', 'Asian Games': '亚运会',
  'Dynasty Cup': '皇朝杯', "King's Cup": '泰王杯', 'Kirin Cup': '麒麟杯', 'China Cup': '中国杯',
  'Four Nations Tournament': '四国邀请赛', 'FIFA Series': 'FIFA 系列赛', 'Confederations Cup': '联合会杯',
  'FIFA World Cup': '世界杯', 'Lunar New Year Cup': '贺岁杯', 'Nehru Cup': '尼赫鲁杯',
};

const choiceMeta = [
  { key: 'W', label: '中国胜', short: '胜' },
  { key: 'D', label: '平局', short: '平' },
  { key: 'L', label: '对手胜', short: '负' },
];

const seedLeaders = [
  { name: '龙之队老炮', balance: 48620, matches: matches.length },
  { name: '越位线哲学家', balance: 32180, matches: matches.length },
  { name: '工体北看台', balance: 27840, matches: 376 },
  { name: '只买平局', balance: 19650, matches: matches.length },
  { name: '九号球衣', balance: 14320, matches: 289 },
];

const money = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
const teamName = (name) => teamNames[name] || name;
const tournamentName = (name) => tournamentNames[name] || name;
const locationLabel = { home: '主场', away: '客场', neutral: '中立场' };

function newGame(player = '匿名球迷') {
  return { version: GAME_VERSION, index: 0, balance: STARTING_BALANCE, history: [], finished: false, player };
}

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem('cftm-game'));
    if (saved?.version === GAME_VERSION && typeof saved.balance === 'number') return saved;
    return newGame(saved?.player || '匿名球迷');
  } catch {
    return newGame();
  }
}

function App() {
  const [game, setGame] = useState(loadGame);
  const [pick, setPick] = useState('W');
  const [stake, setStake] = useState(() => Math.min(500, game.balance));
  const [reveal, setReveal] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const match = matches[Math.min(game.index, matches.length - 1)];

  useEffect(() => localStorage.setItem('cftm-game', JSON.stringify(game)), [game]);

  const yearSummary = useMemo(() => years.map((year) => {
    const yearMatches = matches.filter((item) => item.year === year);
    return {
      year,
      count: yearMatches.length,
      firstIndex: yearMatches.length ? matches.findIndex((item) => item.id === yearMatches[0].id) : -1,
    };
  }), []);

  const currentYearMatches = useMemo(() => matches.filter((item) => item.year === match.year), [match.year]);
  const matchInYear = currentYearMatches.findIndex((item) => item.id === match.id) + 1;

  const leaderboard = useMemo(() => {
    let local = [];
    try { local = JSON.parse(localStorage.getItem('cftm-leaderboard-v2')) || []; } catch {}
    const current = { name: game.player || '匿名球迷', balance: game.balance, matches: game.history.length, you: true };
    return [...seedLeaders, ...local.filter((item) => item.name !== current.name), current]
      .sort((a, b) => b.balance - a.balance).slice(0, 7);
  }, [game]);

  const lockBet = () => {
    const bet = Math.max(1, Math.min(Math.floor(Number(stake) || 0), game.balance));
    const won = pick === match.result;
    const delta = won ? bet : -bet;
    setReveal({ won, bet, delta, nextBalance: game.balance + delta, match, pick });
  };

  const nextMatch = () => {
    const last = game.index >= matches.length - 1 || reveal.nextBalance <= 0;
    const entry = {
      id: match.id,
      date: match.date,
      year: match.year,
      opponent: match.opponent,
      pick,
      result: match.result,
      score: `${match.chinaScore}–${match.opponentScore}`,
      stake: reveal.bet,
      delta: reveal.delta,
    };
    const next = {
      ...game,
      index: last ? game.index : game.index + 1,
      balance: reveal.nextBalance,
      history: [...game.history, entry],
      finished: last,
    };
    if (last) {
      let local = [];
      try { local = JSON.parse(localStorage.getItem('cftm-leaderboard-v2')) || []; } catch {}
      local = [...local.filter((item) => item.name !== next.player), { name: next.player, balance: next.balance, matches: next.history.length }];
      localStorage.setItem('cftm-leaderboard-v2', JSON.stringify(local.slice(-12)));
    }
    setGame(next);
    setReveal(null);
    setStake(Math.min(500, next.balance));
    setPick('W');
  };

  const resetGame = () => {
    setGame(newGame(game.player || '匿名球迷'));
    setReveal(null);
    setStake(500);
    setPick('W');
  };

  const changeName = () => {
    const name = window.prompt('给这次穿越起个名字（最多 10 个字）', game.player);
    if (name?.trim()) setGame((current) => ({ ...current, player: name.trim().slice(0, 10) }));
  };

  const profit = game.balance - STARTING_BALANCE;
  const progress = game.finished ? 100 : (game.index / matches.length) * 100;
  const correct = game.history.filter((item) => item.pick === item.result).length;
  const next = matches[game.index + 1];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">中</span>
          <div><strong>国足时光机</strong><span>CHINA FOOTBALL TIME MACHINE</span></div>
        </div>
        <nav>
          <button className="nav-link" onClick={() => document.querySelector('#archive')?.scrollIntoView({ behavior: 'smooth' })}>年份档案</button>
          <button className="nav-link" onClick={() => setShowRules(true)}>游戏规则</button>
          <button className="player-chip" onClick={changeName} title="修改昵称"><UserRound size={16} />{game.player}</button>
        </nav>
      </header>

      <main>
        <section className="intro-row">
          <div>
            <p className="eyebrow"><Sparkles size={14} /> 真实赛果 · 完整时间线</p>
            <h1>{matches.length} 场比赛，<em>你能押中多少？</em></h1>
            <p className="subtitle">从 1990 到 2026，按时间顺序重走中国男足成年国家队的完整国际比赛档案。</p>
          </div>
          <div className="era-stamp"><span>当前坐标</span><strong>{game.finished ? '终局' : match.year}</strong><small>— 2026</small></div>
        </section>

        <section className="stats-grid" aria-label="游戏状态">
          <article><span className="stat-icon red"><WalletCards size={20} /></span><div><small>当前资产</small><strong>¥ {money.format(game.balance)}</strong><em className={profit >= 0 ? 'up' : 'down'}>{profit >= 0 ? '+' : ''}{money.format(profit)} 本金盈亏</em></div></article>
          <article><span className="stat-icon blue"><Clock3 size={20} /></span><div><small>比赛进度</small><strong>{game.finished ? matches.length : game.index + 1}<i> / {matches.length} 场</i></strong><div className="mini-progress"><span style={{ width: `${progress}%` }} /></div></div></article>
          <article><span className="stat-icon gold"><Target size={20} /></span><div><small>预测命中</small><strong>{correct}<i> / {game.history.length} 场</i></strong><em>{game.history.length ? Math.round(correct / game.history.length * 100) : 0}% 命中率</em></div></article>
        </section>

        <div className="content-grid">
          <section className="game-column">
            {game.finished ? (
              <article className="finish-card">
                <div className="finish-seal"><Trophy size={34} /></div>
                <p className="eyebrow">穿越完成</p>
                <h2>{game.balance <= 0 ? '哨响，资金归零' : '你走完了国足完整时间线'}</h2>
                <p>最终资产</p><strong className="final-money">¥ {money.format(game.balance)}</strong>
                <div className="finish-metrics"><span>完成 <b>{game.history.length} 场</b></span><span>命中 <b>{correct} 场</b></span><span>收益 <b className={profit >= 0 ? 'up' : 'down'}>{profit >= 0 ? '+' : ''}¥{money.format(profit)}</b></span></div>
                <button className="primary-action" onClick={resetGame}><RotateCcw size={18} />重新穿越</button>
              </article>
            ) : (
              <article className="match-card">
                <div className="match-card-head">
                  <div><span className="round-tag">第 {game.index + 1} / {matches.length} 场</span><span>{tournamentName(match.tournament)}</span></div>
                  <time>{match.date.replaceAll('-', '.')}</time>
                </div>
                <div className="year-progress-bar">
                  <span>{match.year} 年第 {matchInYear} 场</span>
                  <div><i style={{ width: `${(matchInYear / currentYearMatches.length) * 100}%` }} /></div>
                  <b>{matchInYear} / {currentYearMatches.length}</b>
                </div>
                <div className="match-stage">
                  <div className="team home"><div className="crest china">★</div><h3>中国</h3><span>CHINA</span></div>
                  <div className="versus"><small>{locationLabel[match.venue]}</small><strong>VS</strong><span>赛果待揭晓</span></div>
                  <div className="team away"><div className="crest opponent">{teamName(match.opponent).slice(0, 1)}</div><h3>{teamName(match.opponent)}</h3><span>{match.opponent.toUpperCase()}</span></div>
                </div>
                <div className="match-meta-row">
                  <span><CalendarDays size={13} />{dateFormatter.format(new Date(`${match.date}T00:00:00`))}</span>
                  <span><MapPin size={13} />{match.city} · {match.country}</span>
                  <span><Database size={13} />历史记录 #{match.id}</span>
                </div>

                <div className="bet-panel">
                  <div className="section-title"><div><span>01</span><h4>预测真实赛果</h4></div><small>三选一 · 统一计分规则</small></div>
                  <div className="outcome-grid">
                    {choiceMeta.map((choice) => (
                      <button key={choice.key} className={pick === choice.key ? 'outcome selected' : 'outcome'} onClick={() => setPick(choice.key)}>
                        <span>{choice.label}</span><strong>{choice.key === 'W' ? '支持国足' : choice.key === 'D' ? '双方战平' : '看好对手'}</strong><small>{choice.short}</small>
                      </button>
                    ))}
                  </div>
                  <div className="section-title stake-title"><div><span>02</span><h4>投入金额</h4></div><small>可用 ¥{money.format(game.balance)}</small></div>
                  <div className="stake-row">
                    <div className="stake-input"><span>¥</span><input aria-label="投入金额" type="number" min="1" step="1" max={game.balance} value={stake} onChange={(event) => { const value = event.target.value; setStake(value === '' ? '' : Math.min(game.balance, Math.max(0, Math.floor(Number(value) || 0)))); }} /></div>
                    <div className="quick-stakes">
                      {[100, 500, 1000].map((amount) => <button key={amount} disabled={amount > game.balance} onClick={() => setStake(amount)}>¥{amount >= 1000 ? '1K' : amount}</button>)}
                      <button onClick={() => setStake(game.balance)}>全部</button>
                    </div>
                  </div>
                  <div className="bet-summary"><span>选中：<b>{choiceMeta.find((choice) => choice.key === pick)?.label}</b> · 猜对增加、猜错扣除</span><strong>¥ {money.format(Number(stake) || 0)}</strong></div>
                  <button className="primary-action" disabled={game.balance <= 0 || Number(stake) < 1 || Number(stake) > game.balance} onClick={lockBet}>锁定预测 <ArrowRight size={19} /></button>
                  <p className="fair-note"><ShieldCheck size={14} /> 结算只读取档案中的真实比分，提交后不可更改</p>
                </div>
              </article>
            )}

            <article className="timeline-card">
              <div className="panel-heading"><div><History size={18} /><h3>穿越记录</h3></div><span>{game.history.length} 场</span></div>
              {game.history.length === 0 ? <div className="empty-history">第一张赛果单，将从 1990 年 7 月开始。</div> : (
                <div className="history-list">
                  {[...game.history].reverse().slice(0, 6).map((item) => <div className="history-item" key={item.id}><time>{item.date.slice(2).replaceAll('-', '.')}</time><span>中国 {item.score} {teamName(item.opponent)}</span><small>押{choiceMeta.find((choice) => choice.key === item.pick)?.short}</small><strong className={item.delta >= 0 ? 'up' : 'down'}>{item.delta >= 0 ? '+' : ''}¥{money.format(item.delta)}</strong></div>)}
                </div>
              )}
            </article>
          </section>

          <aside>
            <article className="archive-card" id="archive">
              <div className="panel-heading"><div><CalendarDays size={18} /><h3>年份档案</h3></div><span>1990—2026</span></div>
              <p className="panel-copy">共 {matches.length} 场成年国家队国际比赛。无比赛年份以“—”标记。</p>
              <div className="year-list">
                {yearSummary.map((item) => {
                  const completed = item.count > 0 && game.index > item.firstIndex + item.count - 1;
                  const active = !game.finished && item.year === match.year;
                  return <div className={`year-row${active ? ' active' : ''}${completed ? ' completed' : ''}`} key={item.year}><span>{item.year}</span><i>{item.count ? `${item.count} 场` : '—'}</i>{completed ? <Check size={14} /> : active ? <b>{matchInYear}/{item.count}</b> : <em />}</div>;
                })}
              </div>
            </article>

            <article className="leaderboard-card" id="rankings">
              <div className="panel-heading"><div><Medal size={18} /><h3>玩家排行</h3></div><span>本机</span></div>
              <p className="panel-copy">同一浏览器完成或正在挑战的玩家记录。</p>
              <div className="leader-list">
                {leaderboard.map((player, index) => <div className={player.you ? 'leader you' : 'leader'} key={`${player.name}-${index}`}><b className={`rank r${index + 1}`}>{index + 1}</b><div className="avatar">{player.name.slice(0, 1)}</div><div className="leader-name"><strong>{player.name}{player.you && <i>你</i>}</strong><small>完成 {player.matches} 场</small></div><span>¥{money.format(player.balance)}</span></div>)}
              </div>
            </article>

            <article className="source-card"><Database size={18} /><div><strong>真实赛果档案</strong><p>合并 international_results（CC0）与公开的中国队逐年比赛记录，当前收录至 2026-10-06。</p><a href="https://github.com/martj42/international_results" target="_blank" rel="noreferrer">查看主数据源 <ArrowRight size={13} /></a></div></article>
            <article className="disclaimer"><ShieldCheck size={17} /><p><strong>纯属娱乐模拟</strong><br />不涉及真实金钱，不构成任何投注建议。</p></article>
          </aside>
        </div>
      </main>

      <footer><span>国足时光机 · 1990—2026</span><span>{matches.length} 场真实赛果 · 3 个无赛年份 · 每一次选择都是另一条时间线。</span></footer>

      {reveal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="result-modal">
            <div className={reveal.won ? 'result-icon win' : 'result-icon lose'}>{reveal.won ? <Trophy size={34} /> : <span>哨</span>}</div>
            <p className="eyebrow">{match.date.replaceAll('-', '.')} · 真实赛果</p>
            <div className="scoreline"><span>中国</span><strong>{match.chinaScore}–{match.opponentScore}</strong><span>{teamName(match.opponent)}</span></div>
            <h2>{reveal.won ? '判断准确，漂亮！' : '这次，历史没有站在你这边'}</h2>
            <p className="result-context">{tournamentName(match.tournament)} · {match.city} · {locationLabel[match.venue]}</p>
            <div className="settlement"><span>本轮投入<b>¥{money.format(reveal.bet)}</b></span><span>资产变化<b className={reveal.delta >= 0 ? 'up' : 'down'}>{reveal.delta >= 0 ? '+' : '−'}¥{money.format(Math.abs(reveal.delta))}</b></span><span>剩余资产<b>¥{money.format(reveal.nextBalance)}</b></span></div>
            <button className="primary-action" onClick={nextMatch}>{game.index >= matches.length - 1 || reveal.nextBalance <= 0 ? '查看最终成绩' : next?.year === match.year ? `继续 ${match.year} 年` : `进入 ${next?.year} 年`}<ArrowRight size={19} /></button>
          </div>
        </div>
      )}

      {showRules && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onMouseDown={() => setShowRules(false)}>
          <div className="rules-modal" onMouseDown={(event) => event.stopPropagation()}><div className="panel-heading"><div><CircleDollarSign size={19} /><h3>游戏规则</h3></div><button onClick={() => setShowRules(false)}>×</button></div><ol><li><b>从 ¥10,000 出发</b><span>你有一笔固定初始资产，进度会保存在当前浏览器。</span></li><li><b>逐场预测，按年推进</b><span>从 1990 年开始，对 {matches.length} 场真实国际比赛依次选择中国胜、平局或对手胜。</span></li><li><b>固定金额结算</b><span>猜对时资产增加本轮投入金额，猜错时资产扣除本轮投入金额。</span></li><li><b>走到 2026</b><span>完成全部比赛，或资产提前归零，挑战结束。1991、1999、2020 无收录比赛，会自动跳过。</span></li></ol><button className="primary-action" onClick={() => setShowRules(false)}>我明白了</button></div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
