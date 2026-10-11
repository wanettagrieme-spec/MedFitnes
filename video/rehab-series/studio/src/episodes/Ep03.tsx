import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import timings from '../../episodes/03-tri-etapa/voice/timings.json';
import captionsJson from '../../episodes/03-tri-etapa/voice/captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Clip, useAppearAt } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Frame, Gradient, NextCard, Pop, TitleCard } from '../series/ui';
import {
  IconArrow, IconBed, IconBone, IconBrain, IconBuilding, IconCheck, IconClock, IconDoc, IconDoctor, IconDumbbell, IconHand, IconHeart, IconHome,
  IconNurse, IconPin, IconScreen, IconSpeech, IconWalk,
} from '../series/icons';

// Выпуск 3. «Путь пациента: три этапа» — 16:9
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const S = timings.scenes;
const END = timings.duration + 1.5;
const B = [0, S[1].start, S[2].start, S[3].start, S[4].start, S[5].start, END];
export const EP03_DURATION = sec(END);

const V = {
  A: 'stock/pexels/A-heart-monitor-6130551.mp4',
  B: 'stock/pexels/B-surgeons-or-35150986.mp4',
  C2: 'stock/pexels/C2-patient-icu-6130032.mp4',
  E: 'stock/pexels/E-rehab-gym-6023248.mp4',
  F: 'stock/pexels/F-rehab-woman-6023204.mp4',
  G: 'stock/pexels/G-elderly-couple-home-6023263.mp4',
  I: 'stock/pexels/I-nurse-patient-6290536.mp4',
  K: 'stock/pexels/K-doctor-patient-6998077.mp4',
  N2: 'stock/pexels/N2-balance-training-6023255.mp4',
  N5: 'stock/pexels/N5-treadmill-woman-6286151.mp4',
  N6: 'stock/pexels/N6-seated-exercise-6023276.mp4',
  N9: 'stock/pexels/N9-senior-doctor-talk-8375621.mp4',
  N10: 'stock/pexels/N10-senior-doctor-writing-8375665.mp4',
  P1: 'stock/pexels/P1-hospital-aerial-39973334.mp4',   // здание больницы (новый кадр, 11.10.2026)
  P2: 'stock/pexels/P2-doctor-gives-paper-6998080.mp4', // документ на руки (новый кадр, 11.10.2026)
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const STAGE = [C.skyDeep, C.coral, C.teal];   // цвета этапов: 2 этап — как зона 4–6 ШРМ, 3 этап — как зона 2–3 (выпуск 2)

// ── Общие элементы выпуска ─────────────────────────────────────────────────
const StageBar: React.FC<{ active: number; at: number }> = ({ active, at }) => (
  <Pop at={at} dy={-20} style={{ position: 'absolute', right: 80, top: 44, display: 'flex', gap: 12 }}>
    {[1, 2, 3].map(n => (
      <span key={n} style={{ ...font, fontWeight: 800, fontSize: 28, padding: '8px 22px', borderRadius: 30, background: n === active ? STAGE[n - 1] : 'rgba(19,41,61,0.45)', color: n === active ? C.white : 'rgba(255,255,255,0.7)', transform: n === active ? 'scale(1.1)' : 'none' }}>{n} этап</span>
    ))}
  </Pop>
);
const Shade: React.FC<{ side?: 'left' | 'right' }> = ({ side = 'left' }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${side === 'left' ? 90 : 270}deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.7) 45%, rgba(11,37,69,0) 80%)` }} />
);
const Item: React.FC<{ at: number; Icon: IconT; color: string; text: React.ReactNode; size?: number; sub?: string }> = ({ at, Icon, color, text, size = 40, sub }) => (
  <Pop at={at - 0.3} dy={16} style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 24 }}>
    <div style={{ width: 76, height: 76, borderRadius: 38, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={46} color={C.navy} stroke={5} /></div>
    <div>
      <div style={{ ...font, fontWeight: 800, fontSize: size, lineHeight: 1.15 }}>{text}</div>
      {sub && <div style={{ ...font, fontWeight: 600, fontSize: 28, color: C.mintSoft, marginTop: 4 }}>{sub}</div>}
    </div>
  </Pop>
);
// Норматив занятий этапа: часы по Порядку 788н — дословно
const NormCard: React.FC<{ from: number; to: number; stage: number; lines: { at: number; text: string; size: number; color?: string }[] }> = ({ from, to, stage, lines }) => (
  <At from={from} to={to}>
    <Gradient from={C.ink} to={C.navy} angle={150} />
    <StageBar active={stage} at={from} />
    <div style={{ position: 'absolute', left: 170, top: 250, width: 380, height: 380, borderRadius: 190, background: STAGE[stage - 1], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 80px ${STAGE[stage - 1]}66` }}>
      <IconClock size={230} color={C.white} stroke={3.5} />
    </div>
    <div style={{ position: 'absolute', left: 660, top: 220, width: 1150 }}>
      <Pop at={from + 0.15}><span style={{ ...font, fontWeight: 700, fontSize: 42, color: C.mintSoft }}>Занятия на {stage} этапе</span></Pop>
      {lines.map(l => (
        <Pop key={l.text} at={l.at - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: l.size, color: l.color ?? C.white, lineHeight: 1.08 }}>{l.text}</span></Pop>
      ))}
      <Pop at={from + 0.8} style={{ marginTop: 36 }}><span style={{ ...font, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,0.55)' }}>Порядок организации медицинской реабилитации взрослых (Приказ Минздрава № 788н)</span></Pop>
    </div>
  </At>
);

// ── Сцена 1: крючок — дорожка из трёх этапов пишется как кардиограмма ─────
const tPath = wt('по') - 0.3;
const X0 = 80, X1 = 1840, PY = 470, NODES = [400, 960, 1520], BLIPS = [190, 680, 1240, 1730];
const ecg = (x: number) => {
  let v = 0;
  for (const c of BLIPS) {
    const u = x - c;
    if (Math.abs(u) > 80) continue;
    const g = (m: number, w: number, h: number) => h * Math.exp(-(((u - m) / w) ** 2));
    v += g(-48, 9, 0.12) + g(45, 14, 0.2);
    if (u > -12 && u < 20) v += u < -6 ? (-0.15 * (u + 12)) / 6 : u < 0 ? -0.15 + (1.15 * (u + 6)) / 6 : u < 7 ? 1 - (1.4 * u) / 7 : -0.4 + (0.4 * (u - 7)) / 13;
  }
  return PY - v * 130;
};
const PATH_START = wt('три') - 1.0, PATH_DUR = 2.6;
const nodeAt = (x: number) => PATH_START + (PATH_DUR * (x - X0)) / (X1 - X0);
const PathLine = () => {
  const f = useCurrentFrame();   // отрезок начинается в PATH_START
  const head = interpolate(f, [0, sec(PATH_DUR)], [X0, X1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  let d = '';
  for (let x = X0; x <= head; x += 3) d += `${x === X0 ? 'M' : 'L'}${x},${ecg(x).toFixed(1)} `;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <path d={d} fill="none" stroke={C.mint} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${C.mint})` }} />
      {head < X1 && <circle cx={head} cy={ecg(head)} r={10} fill="#fff" style={{ filter: `drop-shadow(0 0 14px ${C.mint})` }} />}
    </svg>
  );
};
const NODE_TEXT = ['больница, где вас лечат — начиная с реанимации', 'стационарное отделение медицинской реабилитации', 'поликлиника, дневной стационар, на дому'];
const Scene1 = () => (
  <>
    <At from={0} to={tPath} fadeIn={0} fadeOut={0.4}>
      <Clip src={V.E} />
      <TitleCard at={0} episode={3} line1="Путь пациента:" line2="три этапа" sub="Не один курс, а путь" />
    </At>
    <At from={tPath} to={B[1]} fadeIn={0.4}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center' }}>
        <Pop at={wt('порядку') - 0.2}><Chip bg="rgba(255,255,255,0.12)" color={C.mintSoft} size={30}>Порядок Минздрава России № 788н</Chip></Pop>
        <Pop at={wt('три') - 0.3} style={{ marginTop: 22 }}><span style={{ ...font, fontWeight: 800, fontSize: 68 }}>Три этапа <span style={{ color: C.mint }}>медицинской реабилитации</span></span></Pop>
      </div>
      <At from={PATH_START} to={B[1]} fadeIn={0}><PathLine /></At>
      {NODES.map((x, i) => (
        <React.Fragment key={x}>
          <Pop at={nodeAt(x) - 0.1} dy={0} style={{ position: 'absolute', left: x - 62, top: PY - 62, width: 124, height: 124, borderRadius: 62, background: STAGE[i], border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${STAGE[i]}` }}>
            <span style={{ ...font, fontWeight: 800, fontSize: 64 }}>{i + 1}</span>
          </Pop>
          <Pop at={nodeAt(x) + 0.1} style={{ position: 'absolute', left: x - 230, top: PY + 90, width: 460, textAlign: 'center' }}>
            <div style={{ ...font, fontWeight: 800, fontSize: 40, color: STAGE[i] === C.skyDeep ? C.sky : STAGE[i] }}>{i + 1} этап</div>
            <div style={{ ...font, fontWeight: 600, fontSize: 30, lineHeight: 1.2, marginTop: 6, color: C.mintSoft }}>{NODE_TEXT[i]}</div>
          </Pop>
        </React.Fragment>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', gap: 26 }}>
        {[['где', 'Где проходит?'], ['направляет', 'Кто направляет?'], ['взять', 'Что взять с собой?']].map(([w, t]) => (
          <Pop key={w} at={wt(w) - 0.3}><Chip size={36}>{t}</Chip></Pop>
        ))}
      </div>
    </At>
  </>
);

// ── Сцена 2: первый этап ───────────────────────────────────────────────────
const tEarly = wt('начинают') - 0.4, tNorm1 = wt('занятия') - 0.4, tTeam = wt('команда') - 0.4;
const Dept: React.FC<{ at: number; text: string }> = ({ at, text }) => (
  <Pop at={at - 0.3} dy={14}><Chip bg="rgba(255,255,255,0.14)" color={C.white} size={32}>{text}</Chip></Pop>
);
const EarlyRow: React.FC<{ at: number; title: React.ReactNode; sub?: string; hot?: boolean }> = ({ at, title, sub, hot }) => (
  <Pop at={at - 0.3} dy={16} style={{ display: 'flex', gap: 24, marginTop: 30 }}>
    <div style={{ width: 22, height: 22, borderRadius: 11, background: C.sky, marginTop: 16, flexShrink: 0, boxShadow: `0 0 16px ${C.sky}` }} />
    <div>
      <div style={{ ...font, fontWeight: 800, fontSize: 46, lineHeight: 1.12 }}>{title}</div>
      {sub && <div style={{ ...font, fontWeight: hot ? 800 : 600, fontSize: hot ? 56 : 32, color: hot ? C.sun : C.mintSoft, marginTop: 4 }}>{sub}</div>}
    </div>
  </Pop>
);
const Scene2 = () => (
  <>
    <At from={B[1]} to={tEarly} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.teal} />
      <Frame x={100} y={150} w={820} h={620}>
        <At from={B[1]} to={tEarly} fadeIn={0}><Clip src={V.P1} from={1} /></At>
      </Frame>
      <div style={{ position: 'absolute', left: 1000, top: 150, width: 840 }}>
        <Pop at={B[1] + 0.1}><Chip bg={STAGE[0]} color={C.white} size={38}>1 этап</Chip></Pop>
        <Pop at={wt('больнице') - 0.4} style={{ marginTop: 26 }}><span style={{ ...font, fontWeight: 800, fontSize: 70, lineHeight: 1.05 }}>В больнице,<br />где вас лечат</span></Pop>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 40 }}>
          <Pop at={wt('реанимации') - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: C.sun, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBed size={44} color={C.navy} stroke={5} /></div>
            <span style={{ ...font, fontWeight: 800, fontSize: 40 }}>Реанимация</span>
          </Pop>
          <Pop at={wt('затем') - 0.2} dy={0}><IconArrow size={60} color={C.mint} stroke={5} /></Pop>
          <Pop at={wt('профильном') - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBuilding size={44} color={C.navy} stroke={5} /></div>
            <span style={{ ...font, fontWeight: 800, fontSize: 40 }}>Профильное отделение</span>
          </Pop>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 34 }}>
          <Dept at={wt('неврологии')} text="неврология" />
          <Dept at={wt('травматологии')} text="травматология" />
          <Dept at={wt('кардиологии')} text="кардиология" />
          <Dept at={wt('других')} text="и другие" />
        </div>
      </div>
      <StageBar active={1} at={B[1]} />
    </At>
    <At from={tEarly} to={tNorm1} fadeOut={0.3}>
      <Gradient from={C.ink} to={C.navy} angle={160} />
      <Frame x={1060} y={150} w={760} h={620}>
        <At from={tEarly} to={wt('операции') - 0.5} fadeIn={0}><Clip src={V.A} /></At>
        <At from={wt('операции') - 0.5} to={tNorm1}><Clip src={V.B} /></At>
      </Frame>
      <div style={{ position: 'absolute', left: 120, top: 160, width: 880 }}>
        <Pop at={tEarly + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 64, color: C.mint }}>Начинают как можно раньше</span></Pop>
        <EarlyRow at={wt('острейший')} title="острейший период" sub="с первых 72 часов" hot />
        <EarlyRow at={wt('острый')} title="острый период болезни" />
        <EarlyRow at={wt('операции')} title="после операции" sub="ранний послеоперационный период" />
      </div>
      <StageBar active={1} at={tEarly} />
    </At>
    <NormCard from={tNorm1} to={tTeam} stage={1} lines={[
      { at: wt('ежедневно'), text: 'ежедневно', size: 72 },
      { at: wt('менее'), text: 'не менее 1 часа', size: 112, color: C.sun },
      { at: wt('более'), text: 'но не более 3 часов', size: 60, color: C.mintSoft },
    ]} />
    <At from={tTeam} to={B[2]} fadeOut={0.3}>
      <Clip src={V.I} from={8} />
      <Shade />
      <div style={{ position: 'absolute', left: 120, top: 190, width: 980 }}>
        <Pop at={tTeam + 0.1}><span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mintSoft }}>С вами работает команда</span></Pop>
        <Pop at={wt('отделения') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 74, lineHeight: 1.06 }}>отделения <span style={{ color: C.mint }}>ранней медицинской реабилитации</span></span></Pop>
        <div style={{ display: 'flex', gap: 18, marginTop: 44 }}>
          {([IconDoctor, IconDumbbell, IconHand, IconBrain, IconSpeech, IconNurse] as IconT[]).map((Icon, i) => (
            <Pop key={i} at={wt('ранней') + 0.1 * i} dy={14} style={{ width: 92, height: 92, borderRadius: 46, background: [C.mint, C.sun, C.sky, C.coral, C.mintSoft, C.white][i], display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={56} color={C.navy} stroke={5} /></Pop>
          ))}
        </div>
      </div>
      <StageBar active={1} at={tTeam} />
    </At>
  </>
);

// ── Сцена 3: переход по шкале ──────────────────────────────────────────────
const tScale = wt('шкале') - 0.5;
const Cell: React.FC<{ n: number; active: number }> = ({ n, active }) => (
  <div style={{ width: 150, height: 120, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active > 0.5 ? (n >= 4 ? C.coral : C.teal) : '#dfe8ec', transform: `scale(${1 + 0.06 * active})`, boxShadow: active > 0.5 ? '0 12px 30px rgba(19,41,61,0.2)' : 'none' }}>
    <span style={{ ...font, fontWeight: 800, fontSize: 64, color: active > 0.5 ? C.white : C.textMuted }}>{n}</span>
  </div>
);
const ScaleRow = () => {
  const hi = useAppearAt(wt('четырёх') - 0.3), lo = useAppearAt(wt('два') - 0.3);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', gap: 20 }}>
      {[0, 1, 2, 3, 4, 5, 6].map(n => <Cell key={n} n={n} active={n >= 4 ? hi : n >= 2 ? lo : 0} />)}
    </div>
  );
};
const Route: React.FC<{ x: number; at: number; stage: number; range: string; text: string }> = ({ x, at, stage, range, text }) => {
  const a = useAppearAt(at);
  const color = STAGE[stage - 1];
  return (
    <div style={{ position: 'absolute', left: x, top: 450, width: 760, height: 300, borderRadius: 30, background: C.white, boxShadow: '0 20px 50px rgba(19,41,61,0.12)', padding: '34px 40px', boxSizing: 'border-box', opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ ...font, fontWeight: 800, fontSize: 36, color: C.white, background: color, padding: '6px 20px', borderRadius: 30 }}>{range}</span>
        <IconArrow size={54} color={color} stroke={5} />
        <span style={{ ...font, fontWeight: 800, fontSize: 64, color }}>{stage} этап</span>
      </div>
      <div style={{ ...font, fontWeight: 700, fontSize: 38, color: C.textDark, marginTop: 30, lineHeight: 1.2 }}>{text}</div>
    </div>
  );
};
const Scene3 = () => (
  <>
    <At from={B[2]} to={tScale} fadeOut={0.3}>
      <Clip src={V.N10} from={3} />
      <Shade />
      <div style={{ position: 'absolute', left: 120, top: 260, width: 900 }}>
        <Pop at={wt('переводом') - 0.3}><span style={{ ...font, fontWeight: 700, fontSize: 52, color: C.mintSoft }}>Перед переводом или выпиской</span></Pop>
        <Pop at={wt('оценивает') - 0.4} style={{ marginTop: 22 }}><span style={{ ...font, fontWeight: 800, fontSize: 84, lineHeight: 1.05 }}>команда оценивает <span style={{ color: C.sun }}>состояние</span></span></Pop>
      </div>
    </At>
    <At from={tScale} to={B[3]}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Pop at={tScale + 0.1} style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center' }}>
        <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 52 }}>Шкала реабилитационной маршрутизации</span>
        <div style={{ ...font, color: C.textMuted, fontWeight: 600, fontSize: 30, marginTop: 8 }}>от 0 до 6 баллов — определяет следующий этап</div>
      </Pop>
      <ScaleRow />
      <Route x={150} at={wt('второй') - 0.4} stage={2} range="4–6 баллов" text="стационарное отделение медицинской реабилитации" />
      <Route x={1010} at={wt('третий') - 0.5} stage={3} range="2–3 балла" text="поликлиника или дневной стационар" />
    </At>
  </>
);

// ── Сцена 4: второй этап ───────────────────────────────────────────────────
const tProf = wt('одного', 2) - 0.3, tWhere = wt('такие') - 0.4, tWho = wt('направляет', 2) - 0.4, tNorm2 = wt('занятия', 2) - 0.4;
const Profile: React.FC<{ x: number; at: number; n: number; title: string; color: string; Icon: IconT }> = ({ x, at, n, title, color, Icon }) => {
  const a = useAppearAt(at);
  return (
    <div style={{ position: 'absolute', left: x, top: 250, width: 540, height: 550, borderRadius: 34, background: C.white, boxShadow: '0 24px 60px rgba(19,41,61,0.12)', padding: '40px 40px', boxSizing: 'border-box', opacity: a, transform: `translateY(${(1 - a) * 50}px)` }}>
      <div style={{ width: 100, height: 100, borderRadius: 50, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={64} color={C.white} stroke={5} /></div>
      <div style={{ ...font, color, fontWeight: 800, fontSize: 30, marginTop: 24 }}>Профиль {n} · для пациентов</div>
      <div style={{ ...font, color: C.textDark, fontWeight: 800, fontSize: 41, marginTop: 10, lineHeight: 1.15 }}>{title}</div>
    </div>
  );
};
const Scene4 = () => (
  <>
    <At from={B[3]} to={tProf} fadeOut={0.3}>
      <Clip src={V.E} from={1} />
      <Shade />
      <div style={{ position: 'absolute', left: 120, top: 230, width: 1000 }}>
        <Pop at={B[3] + 0.1}><Chip bg={STAGE[1]} color={C.white} size={38}>2 этап</Chip></Pop>
        <Pop at={wt('стационарное') - 0.4} style={{ marginTop: 30 }}><span style={{ ...font, fontWeight: 800, fontSize: 84, lineHeight: 1.05 }}>Стационарное отделение <span style={{ color: C.sun }}>медицинской реабилитации</span></span></Pop>
      </div>
      <StageBar active={2} at={B[3]} />
    </At>
    <At from={tProf} to={tWhere} fadeOut={0.3}>
      <AbsoluteFill style={{ background: C.sand }} />
      <Pop at={tProf + 0.1} style={{ position: 'absolute', left: 120, top: 70 }}>
        <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 52 }}>Отделения одного из трёх профилей</span>
        <div style={{ ...font, color: C.textMuted, fontWeight: 600, fontSize: 30, marginTop: 6 }}>по нарушенным функциям — Порядок 788н</div>
      </Pop>
      <Profile x={120} at={wt('центральной') - 0.4} n={1} color={C.skyDeep} Icon={IconBrain} title="с нарушением функций центральной нервной системы" />
      <Profile x={690} at={wt('периферической') - 0.4} n={2} color={C.coral} Icon={IconBone} title="с нарушением функций периферической нервной системы и костно-мышечной системы" />
      <Profile x={1260} at={wt('соматическими') - 0.4} n={3} color={C.teal} Icon={IconHeart} title="с соматическими заболеваниями" />
      <StageBar active={2} at={tProf} />
    </At>
    <At from={tWhere} to={tWho} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <Frame x={100} y={150} w={760} h={620}><Clip src={V.P1} from={16} /></Frame>
      <div style={{ position: 'absolute', left: 940, top: 170, width: 900 }}>
        <Pop at={tWhere + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 54, color: C.mint }}>Где есть такие отделения</span></Pop>
        <Item at={wt('каждом')} Icon={IconBuilding} color={C.sun} text="в каждом крупном многопрофильном учреждении" size={42} />
        <Item at={wt('центрах')} Icon={IconDumbbell} color={C.mint} text="в центрах медицинской реабилитации" size={42} />
        <Item at={wt('санаторно-курортных')} Icon={IconPin} color={C.sky} text="в санаторно-курортных организациях" size={42} />
      </div>
      <StageBar active={2} at={tWhere} />
    </At>
    <At from={tWho} to={tNorm2} fadeOut={0.3}>
      <Clip src={V.K} from={4} />
      <Shade side="right" />
      <div style={{ position: 'absolute', right: 120, top: 170, width: 820 }}>
        <Pop at={tWho + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 64, color: C.sun }}>Кто направляет</span></Pop>
        <Item at={wt('лечащий')} Icon={IconDoctor} color={C.mint} text="лечащий врач первого этапа" />
        <Item at={wt('терапевт')} Icon={IconDoctor} color={C.mint} text="врач-терапевт" />
        <Item at={wt('общей')} Icon={IconDoctor} color={C.mint} text="врач общей практики" />
        <Item at={wt('врач-специалист')} Icon={IconDoctor} color={C.mint} text="врач-специалист" />
      </div>
      <StageBar active={2} at={tWho} />
    </At>
    <NormCard from={tNorm2} to={B[4]} stage={2} lines={[
      { at: wt('ежедневно', 2), text: 'ежедневно', size: 72 },
      { at: wt('менее', 2), text: 'не менее 3 часов', size: 112, color: C.sun },
    ]} />
  </>
);

// ── Сцена 5: третий этап ───────────────────────────────────────────────────
const tNorm3 = wt('занятия', 3) - 0.4, tHome = wt('если') - 0.4, tFar = wt('жителям') - 0.5;
const Scene5 = () => (
  <>
    <At from={B[4]} to={tNorm3} fadeOut={0.3}>
      <Gradient from={C.ink} to={C.teal} />
      <Frame x={1060} y={150} w={760} h={620}>
        <At from={B[4]} to={wt('дневном') - 0.4} fadeIn={0}><Clip src={V.N5} /></At>
        <At from={wt('дневном') - 0.4} to={tNorm3}><Clip src={V.N6} /></At>
      </Frame>
      <div style={{ position: 'absolute', left: 120, top: 150, width: 880 }}>
        <Pop at={B[4] + 0.1}><Chip bg={STAGE[2]} color={C.white} size={38}>3 этап</Chip></Pop>
        <Item at={wt('поликлинике')} Icon={IconBuilding} color={C.mint} text="поликлиника" sub="амбулаторное отделение медицинской реабилитации" size={52} />
        <Item at={wt('дневном')} Icon={IconBed} color={C.sun} text="дневной стационар" size={52} />
        <Pop at={wt('центрах', 2) - 0.3} style={{ marginTop: 40 }}><span style={{ ...font, fontWeight: 700, fontSize: 36, color: C.mintSoft, lineHeight: 1.25 }}>в том числе в центрах медицинской реабилитации и санаториях</span></Pop>
      </div>
      <StageBar active={3} at={B[4]} />
    </At>
    <NormCard from={tNorm3} to={tHome} stage={3} lines={[
      { at: wt('реже'), text: 'не реже 1 раза в 48 часов', size: 84 },
      { at: wt('двое'), text: 'то есть раз в двое суток', size: 44, color: C.mintSoft },
      { at: wt('менее', 3), text: 'не менее 3 часов', size: 112, color: C.sun },
    ]} />
    <At from={tHome} to={tFar} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <Frame x={100} y={150} w={760} h={620}>
        <At from={tHome} to={wt('дому') - 0.5} fadeIn={0}><Clip src={V.G} /></At>
        <At from={wt('дому') - 0.5} to={tFar}><Clip src={V.N9} from={2} /></At>
      </Frame>
      <div style={{ position: 'absolute', left: 940, top: 150, width: 900 }}>
        <Pop at={tHome + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 54, color: C.mint }}>Если добираться трудно</span></Pop>
        <Item at={wt('далеко')} Icon={IconPin} color={C.sky} text="живёте далеко" />
        <Item at={wt('ограничены')} Icon={IconWalk} color={C.sky} text="ограничены в передвижении" />
        <Pop at={wt('дому') - 0.5} style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ width: 96, height: 96, borderRadius: 48, background: C.sun, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconHome size={60} color={C.navy} stroke={5} /></div>
          <div>
            <div style={{ ...font, fontWeight: 800, fontSize: 60 }}>реабилитация на дому</div>
            <div style={{ ...font, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Приказ Минздрава № 81н</div>
          </div>
        </Pop>
        <Item at={wt('телемедицины')} Icon={IconScreen} color={C.mint} text="в том числе с применением телемедицины" size={36} />
      </div>
      <StageBar active={3} at={tHome} />
    </At>
    <At from={tFar} to={B[5]} fadeOut={0.3}>
      <Clip src={V.N2} />
      <Shade />
      <div style={{ position: 'absolute', left: 120, top: 250, width: 980 }}>
        <Pop at={tFar + 0.1}><span style={{ ...font, fontWeight: 700, fontSize: 52, color: C.mintSoft }}>Жителям отдалённых мест</span></Pop>
        <Pop at={wt('третий', 3) - 0.3} style={{ marginTop: 20 }}><span style={{ ...font, fontWeight: 800, fontSize: 80, lineHeight: 1.06 }}>третий этап могут провести <span style={{ color: C.sun }}>в стационаре</span></span></Pop>
      </div>
      <StageBar active={3} at={tFar} />
    </At>
  </>
);

// ── Сцена 6: документ при выписке + анонс ──────────────────────────────────
const tNext = wt('следующем') - 0.5;
const DocLine: React.FC<{ at: number; text: string; color: string }> = ({ at, text, color }) => (
  <Pop at={at - 0.3} dy={12} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 0', borderTop: '2px solid #e6eef0' }}>
    <div style={{ width: 48, height: 48, borderRadius: 24, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconCheck size={30} color={C.white} stroke={7} /></div>
    <span style={{ ...font, color: C.textDark, fontWeight: 700, fontSize: 36, lineHeight: 1.15 }}>{text}</span>
  </Pop>
);
const Sticker: React.FC<{ at: number }> = ({ at }) => {
  const a = useAppearAt(at, 0.45);
  return (
    <div style={{ position: 'absolute', left: 760, top: 752, opacity: a, transform: `rotate(-1.5deg) scale(${0.8 + 0.2 * a})`, transformOrigin: 'left center', background: C.sun, borderRadius: 26, padding: '14px 34px', boxShadow: '0 14px 34px rgba(19,41,61,0.25)' }}>
      <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 38, whiteSpace: 'nowrap' }}>Сохраните и возьмите с собой на следующий этап</span>
    </div>
  );
};
const Scene6 = () => (
  <>
    <At from={B[5]} to={tNext} fadeOut={0.3}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Frame x={80} y={250} w={740} h={416}><Clip src={V.P2} from={3} zoom={0.03} /></Frame>
      <Pop at={B[5] + 0.1} style={{ position: 'absolute', left: 860, top: 90, width: 960, background: C.white, borderRadius: 26, boxShadow: '0 24px 60px rgba(19,41,61,0.14)', padding: '30px 44px 14px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 18 }}>
          <IconDoc size={64} color={C.teal} stroke={4.5} />
          <div>
            <div style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 50 }}>Выписка</div>
            <div style={{ ...font, color: C.textMuted, fontWeight: 600, fontSize: 26 }}>документ при переводе или выписке</div>
          </div>
        </div>
        <DocLine at={wt('реабилитационный')} text="реабилитационный диагноз" color={C.skyDeep} />
        <DocLine at={wt('реабилитационный', 2)} text="реабилитационный потенциал" color={C.skyDeep} />
        <DocLine at={wt('индивидуальный')} text="индивидуальный план медицинской реабилитации (ИПМР)" color={C.teal} />
        <DocLine at={wt('оценка')} text="оценка по шкале реабилитационной маршрутизации (ШРМ)" color={C.coral} />
        <DocLine at={wt('следующий')} text="следующий этап" color={C.coral} />
      </Pop>
      <Sticker at={wt('сохраните') - 0.2} />
    </At>
    <At from={tNext} to={END} fadeOut={0.6}><NextCard at={tNext} title={<>Первый этап:<br /><span style={{ color: C.mint }}>реабилитация в реанимации</span></>} /></At>
  </>
);

const Music = () => {
  const f = useCurrentFrame();
  return <Audio src={staticFile('episodes/03/music.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />;
};

export const Ep03: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Scene1 />
    <Scene2 />
    <Scene3 />
    <Scene4 />
    <Scene5 />
    <Scene6 />
    <Captions pages={captions.pages} />
    <Audio src={staticFile('episodes/03/voice.wav')} />
    <Music />
  </AbsoluteFill>
);
