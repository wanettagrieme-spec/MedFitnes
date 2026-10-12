import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import timings from '../../episodes/08-luchshe/voice/timings.json';
import captionsJson from '../../episodes/08-luchshe/voice/captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo, useAppearAt } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Frame, Gradient, NextCard, Pop, TitleCard } from '../series/ui';
import { IconArrow, IconCheck, IconClock, IconDoc, IconShirt, IconWalk } from '../series/icons';

// Выпуск 8. «Как понять, что становится лучше» — 16:9
// Цель по правилу «Сидоров» (СИДоРОВ, SMART), примеры целей в реальной жизни, шкалы и тесты в начале, середине и конце курса,
// реабилитационный цикл, главный признак успеха, итог цели в эпикризе (достигнута / частично / не достигнута).
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const S = timings.scenes;
const END = timings.duration + 1.5;
const B = [0, S[1].start, S[2].start, S[3].start, S[4].start, S[5].start, S[6].start, S[7].start, S[8].start, END];
export const EP08_DURATION = sec(END);

const P = {
  progress: 'stock/canva/C29-progress-chart.png',
  target: 'stock/canva/C30-goal-target.png',
  shop: 'stock/canva/C31-shopping-bags.png',
  buttons: 'stock/canva/C32-buttoning.png',
  walkTest: 'stock/canva/C33-walk-test.png',
  park: 'stock/canva/C34-park-walk.png',
  results: 'stock/canva/C35-results-talk.png',
  victory: 'stock/canva/C36-small-victory.png',
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const ACC = C.coral;

const Circle: React.FC<{ Icon: IconT; color: string; size?: number; iconColor?: string }> = ({ Icon, color, size = 76, iconColor = C.navy }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={size * 0.6} color={iconColor} stroke={5} /></div>
);
const Target: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {[46, 34, 22, 10].map((r, i) => <circle key={r} cx={50} cy={50} r={r} fill={i % 2 ? C.white : ACC} />)}
  </svg>
);

// ── Сцена 1: крючок ────────────────────────────────────────────────────────
const tTitle = wt('для') - 0.3;
const Scene1 = () => (
  <>
    <At from={0} to={tTitle} fadeIn={0} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.teal} angle={150} />
      <Frame x={860} y={110} w={980} h={640}><Photo src={P.progress} focus="center" /></Frame>
      <div style={{ position: 'absolute', left: 110, top: 230, width: 700 }}>
        <Pop at={0.3}><span style={{ ...font, fontWeight: 800, fontSize: 70, lineHeight: 1.05 }}>Как понять, что <span style={{ color: C.sun }}>становится лучше?</span></span></Pop>
        <Pop at={wt('глаз') - 0.3} style={{ marginTop: 30 }}><Chip bg="rgba(255,255,255,0.14)" color={C.white} size={36}>не на глаз · не «вроде бы лучше»</Chip></Pop>
      </div>
    </At>
    <At from={tTitle} to={B[1]} fadeIn={0.3}>
      <Photo src={P.progress} focus="center" zoom={0.04} />
      <TitleCard at={tTitle} episode={8} line1="Как понять," line2="что становится лучше" size={90} sub="Цель · измерения · главный признак успеха" />
    </At>
  </>
);

// ── Сцена 2: всё начинается с цели ────────────────────────────────────────
const Scene2 = () => (
  <At from={B[1]} to={B[2]}>
    <Gradient from={C.navy} to={C.ink} angle={160} />
    <Frame x={1000} y={150} w={820} h={560}><Photo src={P.target} focus="40% center" /></Frame>
    <div style={{ position: 'absolute', left: 110, top: 150, width: 840 }}>
      <Pop at={B[1] + 0.1} style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
        <Target size={120} />
        <span style={{ ...font, fontWeight: 800, fontSize: 64 }}>Всё начинается <span style={{ color: C.sun }}>с цели</span></span>
      </Pop>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 40, alignItems: 'flex-start' }}>
        <Pop at={wt('вместе') - 0.3}><Chip bg="rgba(255,255,255,0.14)" color={C.white} size={40}>ставят вместе с вами</Chip></Pop>
        <Pop at={wt('всегда') - 0.3}><Chip size={40}>цель всегда одна</Chip></Pop>
        <Pop at={wt('обычной') - 0.3}><Chip bg="rgba(255,255,255,0.14)" color={C.white} size={40}>в обычной жизни</Chip></Pop>
        <Pop at={wt('сроку') - 0.3}><Chip bg={ACC} color={C.white} size={40}>к определённому сроку</Chip></Pop>
      </div>
    </div>
  </At>
);

// ── Сцена 3: правило «Сидоров» ────────────────────────────────────────────
const SID: [string, string, string, string][] = [
  ['специфичная', 'С', 'специфичная', 'то есть конкретная'],
  ['измеримая', 'И', 'измеримая', 'можно измерить'],
  ['достижимая', 'ДО', 'достижимая', 'по силам'],
  ['реалистичная', 'Р', 'реалистичная', 'важная для вас'],
  ['определенная', 'ОВ', 'определённая во времени', 'есть срок'],
];
const Letter: React.FC<{ at: number; l: string; t: string; d: string; i: number }> = ({ at, l, t, d, i }) => {
  const a = useAppearAt(at - 0.3);
  const col = [C.sun, C.mint, C.sky, ACC, C.mintSoft][i];
  return (
    <div style={{ width: 318, height: 420, borderRadius: 30, background: C.white, boxShadow: '0 18px 44px rgba(19,41,61,0.14)', padding: '30px 24px', boxSizing: 'border-box', textAlign: 'center', opacity: 0.25 + 0.75 * a, transform: `translateY(${(1 - a) * 24}px) scale(${0.96 + 0.04 * a})` }}>
      <div style={{ width: 150, height: 150, borderRadius: 75, background: col, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ ...font, fontWeight: 800, fontSize: l.length > 1 ? 70 : 90, color: C.navy }}>{l}</span></div>
      <div style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 32, marginTop: 26, lineHeight: 1.1 }}>{t}</div>
      <div style={{ ...font, color: C.textMuted, fontWeight: 700, fontSize: 26, marginTop: 10 }}>{d}</div>
    </div>
  );
};
const Scene3 = () => (
  <At from={B[2]} to={B[3]}>
    <AbsoluteFill style={{ background: C.paper }} />
    <Pop at={B[2] + 0.1} style={{ position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center' }}>
      <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 52 }}>Хорошая цель — <span style={{ color: ACC }}>умная</span></span>
    </Pop>
    <Pop at={wt('сидоров') - 0.4} style={{ position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center' }}>
      <span style={{ ...font, color: C.textMuted, fontWeight: 800, fontSize: 36 }}>запомнить легко: <span style={{ color: C.navy, letterSpacing: 4 }}>СИДоРОВ</span> <span style={{ fontSize: 26 }}>(SMART)</span></span>
    </Pop>
    <div style={{ position: 'absolute', left: 105, top: 250, display: 'flex', gap: 24 }}>
      {SID.map(([w, l, t, d], i) => <Letter key={w} at={wt(w)} l={l} t={t} d={d} i={i} />)}
    </div>
  </At>
);

// ── Сцена 4: примеры целей ────────────────────────────────────────────────
const GoalCard: React.FC<{ at: number; x: number; src: string; when: string; text: string }> = ({ at, x, src, when, text }) => {
  const a = useAppearAt(at - 0.3);
  return (
    <div style={{ position: 'absolute', left: x, top: 210, width: 830, opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>
      <div style={{ width: 830, height: 430, borderRadius: 28, overflow: 'hidden', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}><Photo src={src} focus="center" zoom={0.05} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
        <span style={{ ...font, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 28, color: C.navy, background: C.sun, padding: '8px 18px', borderRadius: 30, flexShrink: 0 }}><IconClock size={30} color={C.navy} stroke={5} />{when}</span>
        <span style={{ ...font, fontWeight: 800, fontSize: 32, lineHeight: 1.15 }}>{text}</span>
      </div>
    </div>
  );
};
const Scene4 = () => (
  <At from={B[3]} to={B[4]}>
    <Gradient from={C.navy} to={C.teal} angle={160} />
    <Pop at={B[3] + 0.1} style={{ position: 'absolute', left: 100, top: 70, display: 'flex', alignItems: 'center', gap: 24 }}>
      <span style={{ ...font, fontWeight: 800, fontSize: 46, color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through', textDecorationColor: ACC, textDecorationThickness: 6 }}>пройти по коридору больницы</span>
      <IconArrow size={56} color={C.sun} stroke={5} />
      <span style={{ ...font, fontWeight: 800, fontSize: 46, color: C.sun }}>жизнь за дверью</span>
    </Pop>
    <GoalCard at={wt('например')} x={100} src={P.shop} when="через 3 недели" text="сам — в магазин и с сумками" />
    <GoalCard at={wt('или')} x={990} src={P.buttons} when="через неделю" text="сам надеть рубашку и застегнуть пуговицы" />
  </At>
);

// ── Сцена 5: шкалы и тесты ────────────────────────────────────────────────
const Measure: React.FC<{ at: number; Icon: IconT; color: string; text: string }> = ({ at, Icon, color, text }) => (
  <Pop at={at - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 18 }}>
    <Circle Icon={Icon} color={color} size={78} />
    <span style={{ ...font, fontWeight: 800, fontSize: 40 }}>{text}</span>
  </Pop>
);
const Bar: React.FC<{ at: number; h: number; label: string; color: string }> = ({ at, h, label, color }) => {
  const a = useAppearAt(at - 0.2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: a }}>
      <div style={{ width: 120, height: 200, display: 'flex', alignItems: 'flex-end' }}><div style={{ width: 120, height: h * a, borderRadius: 16, background: color }} /></div>
      <span style={{ ...font, fontWeight: 800, fontSize: 30 }}>{label}</span>
    </div>
  );
};
const Scene5 = () => (
  <At from={B[4]} to={B[5]}>
    <Gradient from={C.ink} to={C.navy} angle={150} />
    <Frame x={90} y={130} w={820} h={540}><Photo src={P.walkTest} focus="center" /></Frame>
    <div style={{ position: 'absolute', left: 980, top: 120, width: 860 }}>
      <Pop at={B[4] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 56 }}>Шкалы <span style={{ color: C.sun }}>и тесты</span></span></Pop>
      <Measure at={wt('метров')} Icon={IconWalk} color={C.mint} text="сколько метров вы проходите" />
      <Measure at={wt('секунд')} Icon={IconClock} color={C.sky} text="сколько секунд — равновесие" />
      <Measure at={wt('обслуживаете')} Icon={IconShirt} color={C.sun} text="насколько сами себя обслуживаете" />
      <div style={{ display: 'flex', gap: 40, marginTop: 40, alignItems: 'flex-end' }}>
        <Bar at={wt('начале', 2)} h={70} label="начало" color={C.sky} />
        <Bar at={wt('середине')} h={130} label="середина" color={C.mint} />
        <Bar at={wt('конце')} h={195} label="конец" color={C.sun} />
      </div>
    </div>
  </At>
);

// ── Сцена 6: круг реабилитации ────────────────────────────────────────────
const NODES: [string, number, string, string][] = [['оценка', 1, 'Оценка', C.sky], ['цель', 6, 'Цель', C.sun], ['занятия', 1, 'Занятия', C.mint], ['оценка', 2, 'Снова оценка', ACC]];
const POS = [[960, 175], [1330, 430], [960, 685], [590, 430]];
const Scene6 = () => {
  const f = useCurrentFrame();
  const rot = interpolate(f, [sec(B[5]), sec(B[6])], [0, 120]);
  return (
    <At from={B[5]} to={B[6]}>
      <Gradient from={C.navy} to={C.teal} angle={150} />
      <Pop at={B[5] + 0.1} style={{ position: 'absolute', left: 100, top: 60 }}><span style={{ ...font, fontWeight: 800, fontSize: 52 }}>Круг <span style={{ color: C.sun }}>реабилитации</span></span></Pop>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx={960} cy={430} r={255} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={8} strokeDasharray="22 18" transform={`rotate(${rot} 960 430)`} />
      </svg>
      {NODES.map(([w, n, t, color], i) => (
        <Pop key={t} at={wt(w, n) - 0.3} dy={0} style={{ position: 'absolute', left: POS[i][0] - 150, top: POS[i][1] - 55, width: 300, height: 110, borderRadius: 55, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }}>
          <span style={{ ...font, fontWeight: 800, fontSize: 40, color: C.navy }}>{t}</span>
        </Pop>
      ))}
      <Pop at={wt('меняет') - 0.4} style={{ position: 'absolute', left: 1390, top: 650 }}>
        <Chip bg={C.white} color={C.navy} size={34}>если нужно — план меняют</Chip>
      </Pop>
    </At>
  );
};

// ── Сцена 7: главный признак успеха ───────────────────────────────────────
const Scene7 = () => (
  <At from={B[6]} to={B[7]}>
    <AbsoluteFill style={{ background: C.paper }} />
    <Frame x={80} y={130} w={1000} h={600}><Photo src={P.park} focus="center" /></Frame>
    <div style={{ position: 'absolute', left: 1140, top: 150, width: 700 }}>
      <Pop at={B[6] + 0.1}><span style={{ ...font, color: C.textMuted, fontWeight: 800, fontSize: 38 }}>Главный признак успеха</span></Pop>
      <Pop at={wt('пользуетесь') - 0.3} style={{ marginTop: 14 }}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 62, lineHeight: 1.05 }}>вы пользуетесь навыком <span style={{ color: ACC }}>сами</span></span></Pop>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 34 }}>
        <Pop at={wt('каждый') - 0.3}><Chip size={36}>каждый день</Chip></Pop>
        <Pop at={wt('дома') - 0.3}><Chip bg={C.teal} color={C.white} size={36}>дома и на улице</Chip></Pop>
      </div>
    </div>
  </At>
);

// ── Сцена 8: итог курса в эпикризе ────────────────────────────────────────
const Mark: React.FC<{ at: number; color: string; text: string; sym: string }> = ({ at, color, text, sym }) => (
  <Pop at={at - 0.25} dy={12} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 0', borderTop: '2px solid #e6eef0' }}>
    <div style={{ width: 56, height: 56, borderRadius: 28, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ ...font, fontWeight: 800, fontSize: 34, color: C.white }}>{sym}</span></div>
    <span style={{ ...font, color: C.textDark, fontWeight: 800, fontSize: 38 }}>{text}</span>
  </Pop>
);
const Scene8 = () => (
  <At from={B[7]} to={B[8]}>
    <AbsoluteFill style={{ background: C.paper }} />
    <Frame x={80} y={130} w={820} h={560}><Photo src={P.results} focus="center" /></Frame>
    <Pop at={B[7] + 0.1} style={{ position: 'absolute', left: 960, top: 120, width: 880, background: C.white, borderRadius: 28, boxShadow: '0 24px 60px rgba(19,41,61,0.14)', padding: '28px 40px 18px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><IconDoc size={50} color={C.teal} stroke={4.5} /><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 42 }}>Реабилитационный эпикриз</span></div>
      <div style={{ ...font, color: C.textMuted, fontWeight: 700, fontSize: 28, margin: '10px 0 14px' }}>достигнута ли цель?</div>
      <Mark at={wt('достигнута', 2)} color={C.teal} sym="✓" text="достигнута" />
      <Mark at={wt('частично')} color={C.sun} sym="½" text="достигнута частично" />
      <Mark at={wt('достигнута', 4)} color={ACC} sym="–" text="не достигнута" />
    </Pop>
    <Pop at={wt('ориентир') - 0.4} style={{ position: 'absolute', left: 960, top: 640, width: 880 }}>
      <span style={{ ...font, fontWeight: 800, fontSize: 34, color: C.navy, background: C.sun, padding: '12px 24px', borderRadius: 22, display: 'inline-block', lineHeight: 1.25 }}>не оценка вам — ориентир для следующего шага</span>
    </Pop>
  </At>
);

// ── Сцена 9: маленькие победы и анонс ─────────────────────────────────────
const tNext = wt('следующем') - 0.5;
const Scene9 = () => (
  <>
    <At from={B[8]} to={tNext} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <Frame x={80} y={130} w={1000} h={600}><Photo src={P.victory} focus="center" /></Frame>
      <div style={{ position: 'absolute', left: 1140, top: 170, width: 700 }}>
        <Pop at={B[8] + 0.2}><span style={{ ...font, fontWeight: 800, fontSize: 64, lineHeight: 1.05 }}>Замечайте <span style={{ color: C.sun }}>маленькие победы</span></span></Pop>
        <Pop at={wt('рассказывайте') - 0.3} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36 }}>
          <Circle Icon={IconCheck} color={C.mint} size={70} />
          <span style={{ ...font, fontWeight: 800, fontSize: 36, lineHeight: 1.2 }}>рассказывайте команде, что получается, а что пока нет</span>
        </Pop>
      </div>
    </At>
    <At from={tNext} to={END} fadeOut={0.6}><NextCard at={tNext} title={<>Что зависит<br /><span style={{ color: C.mint }}>от вас и ваших близких</span></>} /></At>
  </>
);

const Music = () => {
  const f = useCurrentFrame();
  return <Audio src={staticFile('episodes/08/music.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />;
};

export const Ep08: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Scene1 />
    <Scene2 />
    <Scene3 />
    <Scene4 />
    <Scene5 />
    <Scene6 />
    <Scene7 />
    <Scene8 />
    <Scene9 />
    <Captions pages={captions.pages} />
    <Audio src={staticFile('episodes/08/voice.wav')} />
    <Music />
  </AbsoluteFill>
);
