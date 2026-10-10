import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import timings from '../../episodes/01-chto-takoe-mr/voice/timings.json';
import captionsJson from '../../episodes/01-chto-takoe-mr/voice/captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Clip, EcgLine, useAppearAt } from '../series/components';
import { C, fontFamily, sec } from '../series/theme';
import {
  IconBed, IconBrain, IconBriefcase, IconBuilding, IconCheck, IconDoctor, IconDumbbell, IconFamily,
  IconHand, IconHeart, IconHome, IconNurse, IconPerson, IconShirt, IconSpeech, IconWalk,
} from '../series/icons';

// Выпуск 1. «Что такое медицинская реабилитация и зачем она мне?» — 16:9
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const S = timings.scenes;
const END = timings.duration + 1.5;
const B = [0, S[1].start, S[2].start, S[3].start, S[4].start, S[5].start, END];   // границы визуальных сцен
export const EP01_DURATION = sec(END);

const V = {
  A: 'stock/pexels/A-heart-monitor-6130551.mp4',
  B: 'stock/pexels/B-surgeons-or-35150986.mp4',
  C2: 'stock/pexels/C2-patient-icu-6130032.mp4',
  D: 'stock/pexels/D-crop-woman-stairs.mp4',
  E: 'stock/pexels/E-rehab-gym-6023248.mp4',
  F: 'stock/pexels/F-rehab-woman-6023204.mp4',
  G: 'stock/pexels/G-elderly-couple-home-6023263.mp4',
  H: 'stock/pexels/H-hand-ball-11075640.mp4',
  I: 'stock/pexels/I-nurse-patient-6290536.mp4',
  J: 'stock/pexels/J-family-hug-8057635.mp4',
  K: 'stock/pexels/K-doctor-patient-6998077.mp4',
};

const font: React.CSSProperties = { fontFamily, color: C.white, margin: 0 };
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number }> = ({ at, children, style, dy = 30 }) => {
  const a = useAppearAt(at);
  return <div style={{ opacity: a, transform: `translateY(${(1 - a) * dy}px)`, ...style }}>{children}</div>;
};
const Strike: React.FC<{ at: number; color?: string }> = ({ at, color = C.coral }) => {
  const a = useAppearAt(at, 0.4);
  return <div style={{ position: 'absolute', left: -12, top: '52%', height: 8, width: `calc(${a * 100}% + 24px)`, background: color, borderRadius: 4, transform: 'rotate(-4deg)' }} />;
};
const Gradient: React.FC<{ from: string; to: string; angle?: number }> = ({ from, to, angle = 135 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})` }}>
    <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)', backgroundSize: '42px 42px' }} />
  </AbsoluteFill>
);
const Frame: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode; r?: number }> = ({ x, y, w, h, children, r = 28 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>{children}</div>
);

// ── Сцена 1: крючок + заголовок ─────────────────────────────────────────────
const tTitle = wt('Ответ') - 0.15;
const Scene1 = () => (
  <>
    <At from={0} to={4.3} fadeIn={0}><Clip src={V.B} /></At>
    <At from={4.3} to={8.9}><Clip src={V.A} from={1} /></At>
    <At from={8.9} to={B[1]}><Clip src={V.C2} clipLen={9} /></At>
    <At from={0.6} to={tTitle + 0.6} fadeIn={0.4} fadeOut={0.6}><EcgLine y={800} duration={tTitle} opacity={0.8} /></At>
    <At from={tTitle} to={B[1]} fadeIn={0.5}><TitleCard /></At>
  </>
);
const TitleCard = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.75) 55%, rgba(11,37,69,0.2) 100%)' }}>
    <div style={{ position: 'absolute', left: 130, top: 210 }}>
      <Pop at={tTitle + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 34, color: C.navy, background: C.sun, padding: '8px 22px', borderRadius: 40 }}>Выпуск 1</span></Pop>
      <Pop at={tTitle + 0.25} style={{ marginTop: 34 }}><h1 style={{ ...font, fontWeight: 800, fontSize: 118, lineHeight: 1.02 }}>Медицинская<br /><span style={{ color: C.mint }}>реабилитация</span></h1></Pop>
      <Pop at={tTitle + 0.6} style={{ marginTop: 30 }}><p style={{ ...font, fontWeight: 600, fontSize: 52, color: C.mintSoft }}>Что это и зачем она мне?</p></Pop>
    </div>
  </AbsoluteFill>
);

// ── Сцена 2: что это ────────────────────────────────────────────────────────
const tLaw = wt('законе') - 0.6;
const tIcons = wt('ходить', 2) - 0.4;
const Scene2 = () => (
  <>
    <At from={B[1]} to={B[2]}><Gradient from={C.navy} to={C.teal} /></At>
    <At from={B[1]} to={tLaw} fadeOut={0.4}>
      <Frame x={1060} y={130} w={740} h={640}><Clip src={V.F} /></Frame>
      <div style={{ position: 'absolute', left: 130, top: 190, width: 860 }}>
        <Pop at={wt('санатории') - 0.3} style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ ...font, fontWeight: 700, fontSize: 64, color: C.sky }}>отдых в санатории</span><Strike at={wt('санатории') + 0.35} />
        </Pop>
        <br />
        <Pop at={wt('зарядка') - 0.4} style={{ position: 'relative', display: 'inline-block', marginTop: 30 }}>
          <span style={{ ...font, fontWeight: 700, fontSize: 64, color: C.sky }}>«просто зарядка»</span><Strike at={wt('зарядка') + 0.3} />
        </Pop>
        <Pop at={wt('лечения') - 0.5} style={{ marginTop: 70 }}>
          <span style={{ ...font, fontWeight: 800, fontSize: 104, color: C.sun }}>Часть лечения</span>
        </Pop>
      </div>
    </At>
    <At from={tLaw} to={tIcons} fadeOut={0.4}>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 200 }}>
        <Pop at={tLaw + 0.2}><span style={{ ...font, fontWeight: 700, fontSize: 36, color: C.mint, border: `2px solid ${C.mint}`, padding: '8px 24px', borderRadius: 40 }}>Закон № 323-ФЗ, статья 40</span></Pop>
        <Pop at={wt('восстановить') - 0.3} style={{ marginTop: 60 }}><p style={{ ...font, fontWeight: 800, fontSize: 84, textAlign: 'center' }}>Восстановить то,<br />что нарушила болезнь</p></Pop>
        <Pop at={wt('компенсировать') - 0.7} style={{ marginTop: 40 }}><p style={{ ...font, fontWeight: 700, fontSize: 60, color: C.sun, textAlign: 'center' }}>или научиться это компенсировать</p></Pop>
      </AbsoluteFill>
    </At>
    <At from={tIcons} to={B[2]}>
      <AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40, paddingBottom: 160 }}>
        {[
          { at: wt('ходить', 2), Icon: IconWalk, bg: C.mint, label: 'Ходить' },
          { at: wt('обслуживать', 2), Icon: IconShirt, bg: C.sky, label: 'Обслуживать себя' },
          { at: wt('работать'), Icon: IconBriefcase, bg: C.sun, label: 'Работать' },
          { at: wt('жить'), Icon: IconHeart, bg: C.coral, label: 'Жить полной жизнью' },
        ].map(({ at, Icon, bg, label }) => (
          <Pop key={label} at={at - 0.25} style={{ width: 360, height: 400, borderRadius: 36, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
            <div style={{ width: 170, height: 170, borderRadius: 100, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={104} color={C.navy} stroke={4.5} /></div>
            <span style={{ ...font, fontWeight: 800, fontSize: 42, textAlign: 'center', lineHeight: 1.15, padding: '0 20px' }}>{label}</span>
          </Pop>
        ))}
      </AbsoluteFill>
    </At>
  </>
);

// ── Сцена 3: лечение и реабилитация ─────────────────────────────────────────
const tGoal = wt('например') - 0.25;
const Bullet: React.FC<{ at: number; text: string; color: string }> = ({ at, text, color }) => (
  <Pop at={at - 0.3} dy={16} style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 28 }}>
    <div style={{ width: 22, height: 22, borderRadius: 11, background: color, flexShrink: 0 }} />
    <span style={{ ...font, color: C.textDark, fontWeight: 700, fontSize: 46 }}>{text}</span>
  </Pop>
);
const Card: React.FC<{ x: number; at: number; title: string; color: string; children: React.ReactNode }> = ({ x, at, title, color, children }) => {
  const a = useAppearAt(at);
  return (
    <div style={{ position: 'absolute', left: x, top: 130, width: 780, height: 640, borderRadius: 36, background: C.white, boxShadow: '0 24px 60px rgba(19,41,61,0.12)', overflow: 'hidden', opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>
      <div style={{ background: color, padding: '34px 50px' }}><span style={{ ...font, fontWeight: 800, fontSize: 64, color: C.navy }}>{title}</span></div>
      <div style={{ padding: '20px 50px' }}>{children}</div>
    </div>
  );
};
const Scene3 = () => (
  <>
    <At from={B[2]} to={tGoal + 0.4}><AbsoluteFill style={{ background: C.sand }} /></At>
    <At from={B[2]} to={tGoal + 0.4} fadeIn={0.3}>
      <Card x={120} at={B[2] + 0.1} title="Лечение" color={C.sky}>
        <Bullet at={wt('причиной')} text="причина болезни" color={C.skyDeep} />
        <Bullet at={wt('симптомами')} text="острые симптомы" color={C.skyDeep} />
      </Card>
      <Card x={1020} at={wt('последствиями') - 1.1} title="Реабилитация" color={C.coral}>
        <Bullet at={wt('последствиями')} text="последствия болезни" color={C.coral} />
        <Bullet at={wt('трудно')} text="что трудно делать" color={C.coral} />
        <Bullet at={wt('вернуть')} text="что важно вернуть" color={C.coral} />
        <Bullet at={wt('ставят')} text="цели — вместе с вами" color={C.teal} />
      </Card>
    </At>
    <At from={tGoal} to={B[3]} fadeIn={0.4}>
      <Clip src={V.D} rate={0.82} />
      <GoalCard />
    </At>
  </>
);
const GoalCard = () => {
  const a = useAppearAt(tGoal + 0.5);
  const chk = useAppearAt(wt('этаж') - 0.1, 0.4);
  return (
    <div style={{ position: 'absolute', left: 120, top: 120, display: 'flex', alignItems: 'center', gap: 30, padding: '30px 44px', borderRadius: 30, background: 'rgba(255,255,255,0.95)', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', opacity: a, transform: `translateX(${(1 - a) * -40}px)` }}>
      <div style={{ width: 96, height: 96, borderRadius: 50, background: chk > 0.05 ? C.teal : '#d9e3ea', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.8 + 0.2 * chk})` }}>
        <div style={{ opacity: chk }}><IconCheck size={64} color={C.white} stroke={7} /></div>
      </div>
      <div>
        <div style={{ ...font, color: C.textMuted, fontWeight: 700, fontSize: 30 }}>Цель реабилитации</div>
        <div style={{ ...font, color: C.textDark, fontWeight: 800, fontSize: 54 }}>Подняться на свой этаж</div>
      </div>
    </div>
  );
};

// ── Сцена 4: три этапа ──────────────────────────────────────────────────────
const StageCard: React.FC<{ x: number; at: number; n: number; title: string; sub: string; subAt?: number; clip: string; clipLen: number; from?: number; Icon: React.FC<{ size?: number; color?: string; stroke?: number }>; color: string }> = ({ x, at, n, title, sub, subAt, clip, clipLen, from = 0, Icon, color }) => {
  const a = useAppearAt(at);
  const s = useAppearAt(subAt ?? at + 0.4);
  return (
    <div style={{ position: 'absolute', left: x, top: 150, width: 520, height: 620, borderRadius: 34, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.14)', overflow: 'hidden', opacity: a, transform: `translateY(${(1 - a) * 50}px)` }}>
      <div style={{ position: 'relative', height: 300 }}><Clip src={clip} clipLen={clipLen} from={from} /></div>
      <div style={{ padding: '26px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={40} color={C.navy} stroke={5} /></div>
          <span style={{ ...font, fontWeight: 800, fontSize: 34, color }}>{n} этап</span>
        </div>
        <div style={{ ...font, fontWeight: 800, fontSize: 50, marginTop: 18, lineHeight: 1.1 }}>{title}</div>
        <div style={{ ...font, fontWeight: 600, fontSize: 36, marginTop: 10, color: C.mintSoft, opacity: s }}>{sub}</div>
      </div>
    </div>
  );
};
const Scene4 = () => (
  <>
    <At from={B[3]} to={B[4]}><Gradient from={C.ink} to={C.navy} angle={160} /></At>
    <At from={B[3]} to={B[4]}>
      <Pop at={B[3] + 0.1} style={{ position: 'absolute', left: 120, top: 58 }}><span style={{ ...font, fontWeight: 800, fontSize: 52, color: C.mint }}>Этапы медицинской реабилитации</span></Pop>
      <StageCard x={120} at={wt('реанимации') - 0.7} n={1} title="Реанимация" sub="ранняя реабилитация" subAt={wt('ранней') - 0.2} clip={V.C2} clipLen={9} from={1} Icon={IconBed} color={C.coral} />
      <StageCard x={700} at={wt('отделение') - 0.4} n={2} title="Отделение реабилитации" sub="в больнице или центре" clip={V.E} clipLen={7} Icon={IconBuilding} color={C.sky} />
      <StageCard x={1280} at={wt('поликлиника') - 0.4} n={3} title="Поликлиника или дом" sub="занятия рядом с домом" subAt={wt('дома') - 0.2} clip={V.G} clipLen={8} Icon={IconHome} color={C.mint} />
    </At>
  </>
);

// ── Сцена 5: команда ────────────────────────────────────────────────────────
const tDoc = wt('врач') - 0.3, tLfk = wt('инструктор') - 0.3, tErgo = wt('эрготерапевт') - 0.3, tPsy = wt('психолог') - 0.6, tLogo = wt('логопед') - 0.4, tNurse = wt('сестра') - 0.7, tYou = wt('сами') - 0.4, tFam = wt('близкие') - 0.3;
const tFamClip = wt('участников') - 1.2;
const Role: React.FC<{ at: number; Icon: React.FC<{ size?: number; color?: string; stroke?: number }>; color: string; title: string; note?: string; highlight?: boolean }> = ({ at, Icon, color, title, note, highlight }) => (
  <Pop at={at} dy={18} style={{ display: 'flex', alignItems: 'center', gap: 22, height: 80, padding: '0 22px', marginBottom: 8, borderRadius: 22, background: highlight ? C.sun : C.white, boxShadow: '0 8px 24px rgba(19,41,61,0.08)' }}>
    <div style={{ width: 58, height: 58, borderRadius: 30, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={36} color={C.white} stroke={5} /></div>
    <span style={{ ...font, color: C.textDark, fontWeight: 800, fontSize: 36 }}>{title}</span>
    {note && <span style={{ ...font, color: C.textMuted, fontWeight: 600, fontSize: 28 }}>— {note}</span>}
  </Pop>
);
const Scene5 = () => (
  <>
    <At from={B[4]} to={B[5]}><AbsoluteFill style={{ background: C.paper }} /></At>
    <At from={B[4]} to={B[5]}>
      <Frame x={100} y={120} w={820} h={700} r={34}>
        <At from={B[4]} to={tDoc} fadeIn={0}><Clip src={V.F} clipLen={8} /></At>
        <At from={tDoc} to={tLfk}><Clip src={V.K} from={3} /></At>
        <At from={tLfk} to={tErgo}><Clip src={V.E} clipLen={7} /></At>
        <At from={tErgo} to={tPsy}><Clip src={V.H} /></At>
        <At from={tPsy} to={tNurse}><Clip src={V.K} from={12} /></At>
        <At from={tNurse} to={tFamClip}><Clip src={V.I} /></At>
        <At from={tFamClip} to={B[5]}><Clip src={V.J} /></At>
      </Frame>
      <div style={{ position: 'absolute', left: 980, top: 110, width: 860 }}>
        <Pop at={B[4] + 0.2} style={{ marginBottom: 18 }}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 46 }}>Команда реабилитации</span></Pop>
        <Role at={tDoc} Icon={IconDoctor} color={C.teal} title="Врач ФРМ" note="ведёт программу" />
        <Role at={tLfk} Icon={IconDumbbell} color={C.skyDeep} title="Инструктор ЛФК" note="движение" />
        <Role at={tErgo} Icon={IconHand} color={C.coral} title="Эрготерапевт" note="бытовые навыки" />
        <Role at={tPsy} Icon={IconBrain} color="#5b8e3e" title="Клинический психолог" />
        <Role at={tLogo} Icon={IconSpeech} color="#e09f3e" title="Клинический логопед" />
        <Role at={tNurse} Icon={IconNurse} color="#d1495b" title="Медсестра по реабилитации" />
        <Role at={tYou} Icon={IconPerson} color={C.navy} title="Вы" highlight />
        <Role at={tFam} Icon={IconFamily} color={C.navy} title="Ваши близкие" highlight />
      </div>
    </At>
  </>
);

// ── Сцена 6: ОМС, вопросы врачу, анонс ─────────────────────────────────────
const tQ = wt('спросите') - 0.4, tNext = wt('следующем') - 0.5;
const Scene6 = () => (
  <>
    <At from={B[5]} to={tQ} fadeOut={0.3}>
      <Gradient from={C.teal} to="#14919b" angle={120} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 150 }}>
        <Pop at={wt('показаниях') - 0.6}><span style={{ ...font, fontWeight: 700, fontSize: 48, color: C.mintSoft }}>При медицинских показаниях</span></Pop>
        <Pop at={wt('бесплатно') - 0.3} dy={50} style={{ marginTop: 20 }}><span style={{ ...font, fontWeight: 800, fontSize: 170, color: C.sun, letterSpacing: -2 }}>бесплатно</span></Pop>
        <Pop at={wt('ОМС') - 0.4} style={{ marginTop: 10 }}><span style={{ ...font, fontWeight: 800, fontSize: 76 }}>по полису ОМС</span></Pop>
      </AbsoluteFill>
    </At>
    <At from={tQ} to={tNext} fadeOut={0.3}>
      <Clip src={V.K} dim={0.25} />
      <AbsoluteFill style={{ background: 'linear-gradient(270deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.7) 50%, rgba(11,37,69,0) 85%)' }} />
      <div style={{ position: 'absolute', right: 120, top: 150, width: 820 }}>
        <Pop at={tQ + 0.2}><span style={{ ...font, fontWeight: 800, fontSize: 58, color: C.sun }}>3 вопроса лечащему врачу</span></Pop>
        {[
          { at: wt('нужна'), q: 'Нужна ли мне реабилитация?' },
          { at: wt('начинать'), q: 'Когда её начинать?' },
          { at: wt('направят'), q: 'Куда меня направят?' },
        ].map(({ at, q }, i) => (
          <Pop key={q} at={at - 0.4} style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 36 }}>
            <div style={{ width: 76, height: 76, borderRadius: 40, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ ...font, fontWeight: 800, fontSize: 42, color: C.navy }}>{i + 1}</span></div>
            <span style={{ ...font, fontWeight: 700, fontSize: 50 }}>{q}</span>
          </Pop>
        ))}
      </div>
    </At>
    <At from={tNext} to={END} fadeOut={0.6}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <EcgLine y={790} duration={3.5} opacity={0.6} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 180 }}>
        <Pop at={tNext + 0.2}><span style={{ ...font, fontWeight: 800, fontSize: 38, color: C.navy, background: C.sun, padding: '10px 28px', borderRadius: 40 }}>Следующий выпуск</span></Pop>
        <Pop at={tNext + 0.5} style={{ marginTop: 40 }}><span style={{ ...font, fontWeight: 800, fontSize: 104 }}>Кому нужна <span style={{ color: C.mint }}>реабилитация?</span></span></Pop>
      </AbsoluteFill>
    </At>
  </>
);

const Music = () => {
  const f = useCurrentFrame();
  return <Audio src={staticFile('episodes/01/music.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />;
};

export const Ep01: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Scene1 />
    <Scene2 />
    <Scene3 />
    <Scene4 />
    <Scene5 />
    <Scene6 />
    <Captions pages={captions.pages} />
    <Audio src={staticFile('episodes/01/voice.wav')} />
    <Music />
  </AbsoluteFill>
);
