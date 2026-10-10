import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import captionsJson from '../../episodes/01-chto-takoe-mr/voice/vertical-captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Clip, EcgLine, useAppearAt } from '../series/components';
import { C, fontFamily, sec } from '../series/theme';
import { IconBed, IconBuilding, IconHome } from '../series/icons';

// Выпуск 1 — вертикальная версия 9:16 (Shorts, Telegram)
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const LAST = captions.words[captions.words.length - 1].endMs / 1000;
const END = LAST + 1.6;
export const EP01V_DURATION = sec(END);

const V = {
  C2: 'stock/pexels/C2-patient-icu-6130032.mp4',
  F: 'stock/pexels/F-rehab-woman-6023204.mp4',
  E: 'stock/pexels/E-rehab-gym-6023248.mp4',
  G: 'stock/pexels/G-elderly-couple-home-6023263.mp4',
  J: 'stock/pexels/J-family-hug-8057635.mp4',
  K: 'stock/pexels/K-doctor-patient-6998077.mp4',
};
const font: React.CSSProperties = { fontFamily, color: C.white, margin: 0 };
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const a = useAppearAt(at);
  return <div style={{ opacity: a, transform: `translateY(${(1 - a) * 30}px)`, ...style }}>{children}</div>;
};
const Strike: React.FC<{ at: number }> = ({ at }) => {
  const a = useAppearAt(at, 0.4);
  return <div style={{ position: 'absolute', left: -10, top: '52%', height: 8, width: `calc(${a * 100}% + 20px)`, background: C.coral, borderRadius: 4, transform: 'rotate(-4deg)' }} />;
};
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.88) 0%, rgba(11,37,69,0.35) 32%, rgba(11,37,69,0.1) 55%, rgba(11,37,69,0.75) 100%)' }} />;

const t1 = wt('медицинская') - 0.3, t2 = wt('дальше') - 0.3, tTeam = wt('работает') - 0.3, t3 = wt('при') - 0.3, t4 = wt('спросите') - 0.3;

const Header = () => (
  <div style={{ position: 'absolute', left: 70, top: 110, width: 940 }}>
    <span style={{ ...font, fontWeight: 800, fontSize: 30, color: C.navy, background: C.sun, padding: '8px 20px', borderRadius: 30 }}>Выпуск 1</span>
    <div style={{ ...font, fontWeight: 800, fontSize: 76, lineHeight: 1.05, marginTop: 24 }}>Медицинская <span style={{ color: C.mint }}>реабилитация</span></div>
  </div>
);

const Stage: React.FC<{ at: number; n: number; title: string; Icon: React.FC<{ size?: number; color?: string; stroke?: number }>; color: string }> = ({ at, n, title, Icon, color }) => (
  <Pop at={at} style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '24px 30px', marginBottom: 20, borderRadius: 28, background: 'rgba(11,37,69,0.82)', border: '2px solid rgba(255,255,255,0.15)' }}>
    <div style={{ width: 84, height: 84, borderRadius: 44, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={52} color={C.navy} stroke={5} /></div>
    <div><div style={{ ...font, fontWeight: 800, fontSize: 30, color }}>{n} этап</div><div style={{ ...font, fontWeight: 800, fontSize: 48 }}>{title}</div></div>
  </Pop>
);

export const Ep01Vertical: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      {/* 1. Ранняя реабилитация — в реанимации */}
      <At from={0} to={t1} fadeIn={0}><Clip src={V.C2} clipLen={9} focus="62% center" /><Shade />
        <EcgLine y={1180} duration={6} opacity={0.75} />
        <Pop at={wt('реанимации') - 0.4} style={{ position: 'absolute', left: 70, top: 560, width: 940 }}>
          <span style={{ ...font, fontWeight: 800, fontSize: 64, lineHeight: 1.12 }}>Начинается уже <span style={{ color: C.sun }}>в реанимации</span></span>
        </Pop>
      </At>
      {/* 2. Не санаторий — часть лечения */}
      <At from={t1} to={t2}><Clip src={V.F} focus="40% center" /><Shade />
        <div style={{ position: 'absolute', left: 70, top: 560, width: 940 }}>
          <Pop at={wt('санаторий') - 0.3} style={{ position: 'relative', display: 'inline-block' }}><span style={{ ...font, fontWeight: 700, fontSize: 60, color: C.sky }}>санаторий</span><Strike at={wt('санаторий') + 0.3} /></Pop><br />
          <Pop at={wt('зарядка') - 0.4} style={{ position: 'relative', display: 'inline-block', marginTop: 20 }}><span style={{ ...font, fontWeight: 700, fontSize: 60, color: C.sky }}>«просто зарядка»</span><Strike at={wt('зарядка') + 0.3} /></Pop>
          <Pop at={wt('лечения') - 0.2} style={{ marginTop: 50 }}><span style={{ ...font, fontWeight: 800, fontSize: 96, color: C.sun }}>Часть лечения</span></Pop>
        </div>
      </At>
      {/* 3. Этапы */}
      <At from={t2} to={tTeam}><Clip src={V.E} clipLen={7} focus="45% center" /><Shade />
        <div style={{ position: 'absolute', left: 70, top: 520, width: 940 }}>
          <Stage at={t2 + 0.1} n={1} title="Реанимация" Icon={IconBed} color={C.coral} />
          <Stage at={wt('отделение') - 0.3} n={2} title="Отделение реабилитации" Icon={IconBuilding} color={C.sky} />
          <Stage at={wt('поликлиника') - 0.3} n={3} title="Поликлиника или дом" Icon={IconHome} color={C.mint} />
        </div>
      </At>
      {/* Команда — и вы с близкими */}
      <At from={tTeam} to={t3}><Clip src={V.J} focus="55% center" /><Shade />
        <Pop at={tTeam + 0.2} style={{ position: 'absolute', left: 70, top: 600, width: 940 }}><span style={{ ...font, fontWeight: 800, fontSize: 68, lineHeight: 1.12 }}>Команда специалистов —<br /><span style={{ color: C.sun }}>и вы с близкими</span></span></Pop>
      </At>
      {/* Бесплатно по ОМС */}
      <At from={t3} to={t4}><AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.teal}, #14919b)` }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 200 }}>
          <Pop at={t3 + 0.1}><span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mintSoft }}>При медицинских показаниях</span></Pop>
          <Pop at={wt('бесплатно') - 0.3} style={{ marginTop: 20 }}><span style={{ ...font, fontWeight: 800, fontSize: 150, color: C.sun }}>бесплатно</span></Pop>
          <Pop at={wt('ОМС') - 0.4}><span style={{ ...font, fontWeight: 800, fontSize: 70 }}>по полису ОМС</span></Pop>
        </AbsoluteFill>
      </At>
      {/* Вопрос врачу + полный выпуск */}
      <At from={t4} to={END} fadeOut={0.5}><Clip src={V.K} focus="30% center" /><Shade />
        <div style={{ position: 'absolute', left: 70, top: 560, width: 940 }}>
          <Pop at={t4 + 0.1}><span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mint }}>Спросите лечащего врача:</span></Pop>
          <Pop at={wt('нужна') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 76, lineHeight: 1.1 }}>Нужна ли мне реабилитация?</span></Pop>
          <Pop at={wt('полный') - 0.2} style={{ marginTop: 60 }}><span style={{ ...font, fontWeight: 800, fontSize: 40, color: C.navy, background: C.sun, padding: '14px 30px', borderRadius: 40 }}>Полный выпуск — по ссылке</span></Pop>
        </div>
      </At>
      <At from={0} to={t3} fadeIn={0} fadeOut={0.3}><Header /></At>
      <Captions pages={captions.pages} bottom={250} fontSize={52} maxWidth={940} />
      <Audio src={staticFile('episodes/01/voice-vertical.wav')} />
      <Audio src={staticFile('episodes/01/music-vertical.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};
