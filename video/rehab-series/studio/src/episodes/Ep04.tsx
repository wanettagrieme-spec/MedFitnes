import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import timings from '../../episodes/04-pervyj-etap/voice/timings.json';
import captionsJson from '../../episodes/04-pervyj-etap/voice/captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo, useAppearAt } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Frame, Gradient, NextCard, Pop, Strike, TitleCard } from '../series/ui';
import {
  IconArrow, IconBed, IconBone, IconBuilding, IconCheck, IconClock, IconCup, IconDoc, IconDumbbell, IconGauge, IconHand, IconHeart, IconLungs,
  IconSpeech, IconWalk,
} from '../series/icons';

// Выпуск 4. «Первый этап: реабилитация в реанимации» — 16:9
// Иллюстрации — сгенерированы (Canva, Gamma) под обязательные кадры владелицы; стоков из прошлых выпусков нет.
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const S = timings.scenes;
const END = timings.duration + 1.5;
const B = [0, S[1].start, S[2].start, S[3].start, S[4].start, S[5].start, S[6].start, S[7].start, END];
export const EP04_DURATION = sec(END);

const P = {
  icu: 'stock/canva/C4-icu-patient.png',
  team: 'stock/canva/C5-team-bedside.png',
  pos: 'stock/canva/C6-positioning.png',
  tilt: 'stock/canva/C1-tilt-table.png',
  cycle: 'stock/canva/C2-bedside-cycle.png',
  magnet: 'stock/canva/C3-magnetotherapy.png',
  speech: 'stock/gamma/G1-speech-therapist.jpg',
  arm: 'stock/gamma/G2-arm-exercise.jpg',
  family: 'stock/gamma/G3-family-hand.jpg',
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const STAGE1 = C.skyDeep;

const Shade: React.FC<{ side?: 'left' | 'right'; k?: number }> = ({ side = 'left', k = 0.92 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${side === 'left' ? 90 : 270}deg, rgba(11,37,69,${k}) 0%, rgba(11,37,69,${k * 0.75}) 42%, rgba(11,37,69,0) 78%)` }} />
);
const StageBar: React.FC<{ at: number }> = ({ at }) => (
  <Pop at={at} dy={-20} style={{ position: 'absolute', right: 80, top: 44, display: 'flex', gap: 12 }}>
    {[1, 2, 3].map(n => (
      <span key={n} style={{ ...font, fontWeight: 800, fontSize: 28, padding: '8px 22px', borderRadius: 30, background: n === 1 ? STAGE1 : 'rgba(19,41,61,0.45)', color: n === 1 ? C.white : 'rgba(255,255,255,0.7)', transform: n === 1 ? 'scale(1.1)' : 'none' }}>{n} этап</span>
    ))}
  </Pop>
);
const Item: React.FC<{ at: number; Icon: IconT; color: string; text: React.ReactNode; size?: number; sub?: string }> = ({ at, Icon, color, text, size = 42, sub }) => (
  <Pop at={at - 0.3} dy={16} style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 22 }}>
    <div style={{ width: 76, height: 76, borderRadius: 38, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={46} color={C.navy} stroke={5} /></div>
    <div>
      <div style={{ ...font, fontWeight: 800, fontSize: size, lineHeight: 1.15 }}>{text}</div>
      {sub && <div style={{ ...font, fontWeight: 600, fontSize: 30, color: C.mintSoft, marginTop: 4 }}>{sub}</div>}
    </div>
  </Pop>
);

// ── Сцена 1: крючок ────────────────────────────────────────────────────────
const tTitle = wt('происходит') - 0.6;
const Scene1 = () => (
  <>
    <At from={0} to={tTitle} fadeIn={0} fadeOut={0.4}>
      <Photo src={P.icu} focus="65% center" />
      <Shade />
      <div style={{ position: 'absolute', left: 120, top: 220, width: 900 }}>
        <Pop at={0.3}><span style={{ ...font, fontWeight: 700, fontSize: 52, color: C.mintSoft }}>Кажется, в реанимации можно</span></Pop>
        <Pop at={wt('лежать') - 0.4} style={{ position: 'relative', display: 'inline-block', marginTop: 16 }}>
          <span style={{ ...font, fontWeight: 800, fontSize: 80 }}>только лежать и ждать</span><Strike at={wt('но') + 0.1} />
        </Pop>
        <Pop at={wt('начинается') - 0.3} style={{ marginTop: 44 }}>
          <span style={{ ...font, fontWeight: 800, fontSize: 62, color: C.sun, lineHeight: 1.1 }}>Именно здесь начинается первый этап медицинской реабилитации</span>
        </Pop>
      </div>
    </At>
    <At from={tTitle} to={B[1]} fadeIn={0.4}>
      <Photo src={P.icu} focus="65% center" zoom={0.04} />
      <TitleCard at={tTitle} episode={4} line1="Первый этап:" line2="реабилитация в реанимации" sub="Что происходит · кто работает · чем помочь" />
    </At>
  </>
);

// ── Сцена 2: где и когда + норматив ────────────────────────────────────────
const tNorm = wt('занятия') - 0.4;
const Badge72 = () => {
  const a = useAppearAt(wt('семидесяти') - 0.5);
  return (
    <div style={{ position: 'absolute', left: 1240, top: 230, width: 480, height: 480, borderRadius: 240, background: C.sun, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: a, transform: `scale(${0.85 + 0.15 * a})`, boxShadow: '0 0 90px rgba(255,209,102,0.45)' }}>
      <span style={{ ...font, color: C.navy, fontWeight: 700, fontSize: 40 }}>с первых</span>
      <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 190, lineHeight: 1 }}>72</span>
      <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 52 }}>часов</span>
    </div>
  );
};
const Scene2 = () => (
  <>
    <At from={B[1]} to={tNorm} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.teal} />
      <StageBar at={B[1]} />
      <div style={{ position: 'absolute', left: 120, top: 150, width: 1020 }}>
        <Pop at={B[1] + 0.1}><Chip bg={STAGE1} color={C.white} size={38}>1 этап</Chip></Pop>
        <Pop at={wt('больнице') - 0.4} style={{ marginTop: 22 }}><span style={{ ...font, fontWeight: 800, fontSize: 76 }}>В больнице</span></Pop>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 30 }}>
          <Pop at={wt('реанимации', 2) - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: C.sun, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBed size={46} color={C.navy} stroke={5} /></div>
            <span style={{ ...font, fontWeight: 800, fontSize: 44 }}>Реанимация</span>
          </Pop>
          <Pop at={wt('затем') - 0.2} dy={0}><IconArrow size={64} color={C.mint} stroke={5} /></Pop>
          <Pop at={wt('профильном') - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBuilding size={46} color={C.navy} stroke={5} /></div>
            <span style={{ ...font, fontWeight: 800, fontSize: 44 }}>Профильное отделение</span>
          </Pop>
        </div>
        <Item at={wt('острейший')} Icon={IconClock} color={C.sky} text="острейший период — до 72 часов" />
        <Item at={wt('операции')} Icon={IconHeart} color={C.sky} text="после операции" sub="ранний послеоперационный период" />
      </div>
      <Badge72 />
    </At>
    <At from={tNorm} to={B[2]}>
      <Gradient from={C.ink} to={C.navy} angle={150} />
      <StageBar at={tNorm} />
      <div style={{ position: 'absolute', left: 170, top: 250, width: 380, height: 380, borderRadius: 190, background: STAGE1, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 80px ${STAGE1}66` }}>
        <IconClock size={230} color={C.white} stroke={3.5} />
      </div>
      <div style={{ position: 'absolute', left: 660, top: 220, width: 1150 }}>
        <Pop at={tNorm + 0.15}><span style={{ ...font, fontWeight: 700, fontSize: 42, color: C.mintSoft }}>Занятия на 1 этапе</span></Pop>
        <Pop at={wt('ежедневно') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 72 }}>ежедневно</span></Pop>
        <Pop at={wt('менее') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 112, color: C.sun }}>не менее 1 часа</span></Pop>
        <Pop at={wt('более') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 60, color: C.mintSoft }}>но не более 3 часов</span></Pop>
        <Pop at={tNorm + 0.8} style={{ marginTop: 36 }}><span style={{ ...font, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,0.55)' }}>Порядок организации медицинской реабилитации взрослых (Приказ Минздрава № 788н)</span></Pop>
      </div>
    </At>
  </>
);

// ── Сцена 3: зачем так рано — ПИТ-синдром ─────────────────────────────────
const tTerm = wt('врачи') - 0.4;
const Harm: React.FC<{ at: number; Icon: IconT; text: string }> = ({ at, Icon, text }) => {
  const a = useAppearAt(at - 0.3);
  const crossed = useAppearAt(wt('ранняя') + 0.2, 0.4);
  return (
    <div style={{ width: 300, height: 300, borderRadius: 34, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: a, transform: `translateY(${(1 - a) * 30}px)`, position: 'relative' }}>
      <div style={{ width: 130, height: 130, borderRadius: 65, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={80} color={C.white} stroke={5} /></div>
      <span style={{ ...font, fontWeight: 800, fontSize: 38, textAlign: 'center', lineHeight: 1.1 }}>{text}</span>
      <div style={{ position: 'absolute', right: 18, top: 18, width: 64, height: 64, borderRadius: 32, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: crossed, transform: `scale(${0.6 + 0.4 * crossed})` }}><IconCheck size={40} color={C.navy} stroke={7} /></div>
    </div>
  );
};
const Scene3 = () => (
  <>
    <At from={B[2]} to={B[3]}>
      <Gradient from={C.ink} to={C.navy} angle={160} />
      <Pop at={B[2] + 0.1} style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center' }}>
        <span style={{ ...font, fontWeight: 800, fontSize: 72, color: C.mint }}>Зачем так рано?</span>
        <div style={{ ...font, fontWeight: 600, fontSize: 38, color: C.mintSoft, marginTop: 8 }}>Долгое лежание само по себе вредит</div>
      </Pop>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', gap: 28 }}>
        <Harm at={wt('мышцы')} Icon={IconDumbbell} text="слабеют мышцы" />
        <Harm at={wt('суставы')} Icon={IconBone} text="суставы теряют подвижность" />
        <Harm at={wt('лёгкие')} Icon={IconLungs} text="хуже работают лёгкие" />
        <Harm at={wt('сосуды')} Icon={IconHeart} text="и сосуды" />
        <Harm at={wt('пролежни')} Icon={IconBed} text="пролежни" />
      </div>
      <Pop at={tTerm} style={{ position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center' }}>
        <span style={{ ...font, fontWeight: 800, fontSize: 46, color: C.navy, background: C.sun, padding: '14px 34px', borderRadius: 50 }}>ПИТ-синдром — синдром последствий интенсивной терапии</span>
      </Pop>
      <Pop at={wt('ранняя') - 0.3} style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center' }}>
        <span style={{ ...font, fontWeight: 800, fontSize: 44, color: C.mint }}>Ранняя реабилитация помогает его предупредить</span>
      </Pop>
    </At>
  </>
);

// ── Сцена 4: кто работает ─────────────────────────────────────────────────
const tSafe = wt('перед') - 0.4;
const Scene4 = () => (
  <>
    <At from={B[3]} to={B[4]}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <Frame x={900} y={130} w={920} h={540}><Photo src={P.team} focus="40% center" /></Frame>
      <StageBar at={B[3]} />
      <div style={{ position: 'absolute', left: 110, top: 140, width: 760 }}>
        <Pop at={wt('команда') - 0.4}><span style={{ ...font, fontWeight: 700, fontSize: 40, color: C.mintSoft }}>С пациентом работает команда</span></Pop>
        <Pop at={wt('отделения') - 0.3} style={{ marginTop: 14 }}><span style={{ ...font, fontWeight: 800, fontSize: 60, lineHeight: 1.08 }}>отделения <span style={{ color: C.mint }}>ранней медицинской реабилитации</span></span></Pop>
        <Pop at={wt('прямо') - 0.3} style={{ marginTop: 24 }}><Chip size={36}>прямо у постели</Chip></Pop>
        <Pop at={wt('лечащим') - 0.3} style={{ marginTop: 20 }}><span style={{ ...font, fontWeight: 700, fontSize: 36, color: C.white }}>+ лечащий врач и анестезиолог-реаниматолог</span></Pop>
      </div>
      <At from={tSafe} to={B[4]} fadeIn={0.4}>
        <div style={{ position: 'absolute', left: 110, top: 712, width: 1700, display: 'flex', alignItems: 'center', gap: 22, padding: '22px 30px', borderRadius: 28, background: 'rgba(11,37,69,0.9)', border: `3px solid ${C.sun}`, boxSizing: 'border-box' }}>
          <span style={{ ...font, fontWeight: 700, fontSize: 36, color: C.mintSoft }}>Перед каждым занятием:</span>
          {([[IconGauge, 'давление', 'давление'], [IconHeart, 'пульс', 'пульс'], [IconLungs, 'дыхание', 'дыхание']] as [IconT, string, string][]).map(([Icon, w, t]) => (
            <Pop key={t} at={wt(w) - 0.3} dy={10} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 58, height: 58, borderRadius: 29, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={36} color={C.navy} stroke={5} /></div>
              <span style={{ ...font, fontWeight: 800, fontSize: 38 }}>{t}</span>
            </Pop>
          ))}
          <Pop at={wt('нагрузку') - 0.3} dy={10} style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <IconCheck size={46} color={C.mint} stroke={7} /><span style={{ ...font, fontWeight: 800, fontSize: 38, color: C.mint }}>безопасно</span>
          </Pop>
        </div>
      </At>
    </At>
  </>
);

// ── Сцена 5: что делают — лестница ранней реабилитации ────────────────────
const t5 = [wt('первых') - 0.4, wt('постепенно') - 0.3, wt('даже') - 0.3, wt('медицинская') - 0.3, wt('клинический') - 0.4];
const Step: React.FC<{ from: number; to: number; src: string; focus?: string; n: number; title: string; sub?: string; drift?: number }> = ({ from, to, src, focus, n, title, sub, drift = 0 }) => (
  <At from={from} to={to} fadeIn={0.35}>
    <Photo src={src} focus={focus} drift={drift} />
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.75) 0%, rgba(11,37,69,0) 32%, rgba(11,37,69,0) 70%, rgba(11,37,69,0.55) 100%)' }} />
    <div style={{ position: 'absolute', left: 90, top: 70, display: 'flex', alignItems: 'center', gap: 20 }}>
      <Pop at={from + 0.2} dy={-12}><div style={{ width: 84, height: 84, borderRadius: 42, background: C.sun, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ ...font, fontWeight: 800, fontSize: 48, color: C.navy }}>{n}</span></div></Pop>
      <Pop at={from + 0.35} dy={-12}>
        <div style={{ ...font, fontWeight: 800, fontSize: 58 }}>{title}</div>
        {sub && <div style={{ ...font, fontWeight: 700, fontSize: 32, color: C.mintSoft, marginTop: 2 }}>{sub}</div>}
      </Pop>
    </div>
  </At>
);
const Scene5 = () => (
  <>
    <At from={B[4]} to={t5[0]} fadeIn={0.3}>
      <Gradient from={C.navy} to={C.teal} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 120 }}>
        <Pop at={B[4] + 0.05}><span style={{ ...font, fontWeight: 800, fontSize: 96 }}>Что делают <span style={{ color: C.sun }}>на первом этапе?</span></span></Pop>
      </AbsoluteFill>
    </At>
    <Step from={t5[0]} to={t5[1]} src={P.pos} focus="50% 40%" n={1} title="Позиционирование" sub="с первых суток — правильная поза и её регулярная смена" drift={-1.5} />
    <Step from={t5[1]} to={t5[2]} src={P.tilt} focus="40% center" n={2} title="Вертикализация" sub="поворотный стол — вертикализатор" drift={1.5} />
    <Step from={t5[2]} to={t5[3]} src={P.cycle} focus="55% center" n={3} title="Прикроватный велоэргометр" sub="даже если пациент дышит через маску" drift={-1.5} />
    <Step from={t5[3]} to={t5[4]} src={P.magnet} focus="45% center" n={4} title="Физиотерапия по показаниям" sub="например, магнитотерапия — прямо в палате" drift={1.5} />
    <Step from={t5[4]} to={B[5]} src={P.speech} focus="50% center" n={5} title="Клинический логопед" sub="проверяет глотание — особенно после дыхательной трубки" drift={-1.5} />
  </>
);

// ── Сцена 6: памятка пациенту ─────────────────────────────────────────────
const Scene6 = () => (
  <>
    <At from={B[5]} to={B[6]}>
      <AbsoluteFill style={{ background: C.sand }} />
      <Frame x={90} y={120} w={760} h={660}><Photo src={P.arm} focus="45% center" /></Frame>
      <div style={{ position: 'absolute', left: 920, top: 110, width: 920 }}>
        <Pop at={B[5] + 0.1}><span style={{ ...font, fontWeight: 700, fontSize: 36, color: C.textMuted }}>Если предстоит плановая операция —</span></Pop>
        <Pop at={wt('правила') - 0.4} style={{ marginTop: 6 }}><span style={{ ...font, fontWeight: 800, fontSize: 56, color: C.navy }}>после пробуждения:</span></Pop>
        {([
          [wt('двигайтесь'), IconWalk, C.teal, 'двигаться', 'хотя бы по 10 движений в суставах'],
          [wt('дышать'), IconLungs, C.skyDeep, 'дышать', ''],
          [wt('глотать'), IconCup, C.skyDeep, 'глотать', ''],
          [wt('говорите'), IconSpeech, C.coral, 'говорить', 'как только уберут трубку'],
          [wt('спрашивайте'), IconClock, C.coral, 'спрашивать, какое сегодня число', ''],
          [wt('ложку'), IconHand, C.teal, 'обслуживать себя', 'взять ложку самому'],
        ] as [number, IconT, string, string, string][]).map(([at, Icon, color, t, sub]) => (
          <Pop key={t} at={at - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14 }}>
            <div style={{ width: 62, height: 62, borderRadius: 31, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={38} color={C.white} stroke={5} /></div>
            <div>
              <span style={{ ...font, fontWeight: 800, fontSize: 38, color: C.textDark }}>{t}</span>
              {sub && <span style={{ ...font, fontWeight: 600, fontSize: 28, color: C.textMuted }}> — {sub}</span>}
            </div>
          </Pop>
        ))}
      </div>
    </At>
  </>
);

// ── Сцена 7: близкие ──────────────────────────────────────────────────────
const Scene7 = () => (
  <>
    <At from={B[6]} to={B[7]}>
      <Gradient from={C.navy} to={C.teal} angle={150} />
      <Frame x={880} y={130} w={940} h={640}><Photo src={P.family} focus="50% center" drift={-1} /></Frame>
      <div style={{ position: 'absolute', left: 110, top: 170, width: 740 }}>
        <Pop at={B[6] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 70, lineHeight: 1.05 }}>Близкие — <span style={{ color: C.sun }}>тоже часть команды</span></span></Pop>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 36 }}>
          <Pop at={wt('разговор') - 0.3} dy={12}><Chip bg="rgba(255,255,255,0.16)" color={C.white} size={38}>разговор</Chip></Pop>
          <Pop at={wt('прикосновение') - 0.3} dy={12}><Chip bg="rgba(255,255,255,0.16)" color={C.white} size={38}>прикосновение</Chip></Pop>
          <Pop at={wt('любимая') - 0.3} dy={12}><Chip bg="rgba(255,255,255,0.16)" color={C.white} size={38}>любимая музыка</Chip></Pop>
        </div>
        <Pop at={wt('спросите') - 0.3} style={{ marginTop: 44 }}>
          <span style={{ ...font, fontWeight: 800, fontSize: 40, color: C.navy, background: C.sun, padding: '14px 28px', borderRadius: 26, display: 'inline-block', lineHeight: 1.25 }}>Спросите команду, чем помочь<br />и когда можно навестить</span>
        </Pop>
      </div>
    </At>
  </>
);

// ── Сцена 8: перевод + анонс ──────────────────────────────────────────────
const tNext = wt('следующем') - 0.5;
const Scene8 = () => (
  <>
    <At from={B[7]} to={tNext} fadeOut={0.3}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Pop at={B[7] + 0.1} style={{ position: 'absolute', left: 240, top: 120, width: 1440, background: C.white, borderRadius: 30, boxShadow: '0 24px 60px rgba(19,41,61,0.14)', padding: '40px 56px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <IconDoc size={76} color={C.teal} stroke={4.5} />
          <div>
            <div style={{ ...font, color: C.textMuted, fontWeight: 700, fontSize: 32 }}>При переводе из реанимации</div>
            <div style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 60 }}>Переводной эпикриз</div>
          </div>
        </div>
        <Pop at={wt('шкале') - 0.4} dy={12} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 30, paddingTop: 22, borderTop: '2px solid #e6eef0' }}>
          <div style={{ width: 54, height: 54, borderRadius: 27, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCheck size={34} color={C.white} stroke={7} /></div>
          <span style={{ ...font, color: C.textDark, fontWeight: 700, fontSize: 42 }}>оценка по шкале реабилитационной маршрутизации</span>
        </Pop>
        <div style={{ display: 'flex', gap: 24, marginTop: 34 }}>
          <Pop at={wt('второй') - 0.3} dy={12}><Chip bg={C.coral} color={C.white} size={42}>4–6 баллов → 2 этап</Chip></Pop>
          <Pop at={wt('третий') - 0.3} dy={12}><Chip bg={C.teal} color={C.white} size={42}>2–3 балла → 3 этап</Chip></Pop>
        </div>
      </Pop>
    </At>
    <At from={tNext} to={END} fadeOut={0.6}><NextCard at={tNext} title={<>Второй этап:<br /><span style={{ color: C.mint }}>отделение медицинской реабилитации</span></>} /></At>
  </>
);

const Music = () => {
  const f = useCurrentFrame();
  return <Audio src={staticFile('episodes/04/music.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />;
};

export const Ep04: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Scene1 />
    <Scene2 />
    <Scene3 />
    <Scene4 />
    <Scene5 />
    <Scene6 />
    <Scene7 />
    <Scene8 />
    <Captions pages={captions.pages} />
    <Audio src={staticFile('episodes/04/voice.wav')} />
    <Music />
  </AbsoluteFill>
);
