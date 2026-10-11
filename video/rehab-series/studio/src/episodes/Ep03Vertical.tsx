import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import captionsJson from '../../episodes/03-tri-etapa/voice/vertical-captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Clip, useAppearAt } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Pop } from '../series/ui';
import { IconBed, IconDoc, IconHome } from '../series/icons';

// Выпуск 3 — вертикальная версия 9:16 (Shorts, Telegram)
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const END = captions.words[captions.words.length - 1].endMs / 1000 + 1.6;
export const EP03V_DURATION = sec(END);

const V = {
  C2: 'stock/pexels/C2-patient-icu-6130032.mp4',
  E: 'stock/pexels/E-rehab-gym-6023248.mp4',
  G: 'stock/pexels/G-elderly-couple-home-6023263.mp4',
  K: 'stock/pexels/K-doctor-patient-6998077.mp4',
  N2: 'stock/pexels/N2-balance-training-6023255.mp4',
  N10: 'stock/pexels/N10-senior-doctor-writing-8375665.mp4',
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const STAGE = [C.skyDeep, C.coral, C.teal];
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.55) 30%, rgba(11,37,69,0.35) 50%, rgba(11,37,69,0.85) 100%)' }} />;
const Panel: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 560 }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top }}>{children}</div>
);
const Row: React.FC<{ at: number; Icon: IconT; color: string; text: string; size?: number }> = ({ at, Icon, color, text, size = 46 }) => (
  <Pop at={at - 0.3} style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '20px 26px', marginTop: 18, borderRadius: 28, background: 'rgba(11,37,69,0.82)', border: '2px solid rgba(255,255,255,0.15)' }}>
    <div style={{ width: 76, height: 76, borderRadius: 38, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={48} color={C.navy} stroke={5} /></div>
    <span style={{ ...font, fontWeight: 800, fontSize: size, lineHeight: 1.12 }}>{text}</span>
  </Pop>
);
const Norm: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Pop at={at - 0.3} style={{ marginTop: 24, padding: '24px 30px', borderRadius: 28, background: 'rgba(11,37,69,0.85)', border: `3px solid ${C.sun}` }}>{children}</Pop>
);
const Cell: React.FC<{ n: number; on: number; color: string }> = ({ n, on, color }) => (
  <div style={{ width: 118, height: 110, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on > 0.5 ? color : 'rgba(255,255,255,0.16)' }}>
    <span style={{ ...font, fontWeight: 800, fontSize: 56 }}>{n}</span>
  </div>
);
const Scale: React.FC<{ at: number; lo: number; hi: number; color: string }> = ({ at, lo, hi, color }) => {
  const on = useAppearAt(at);
  return <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>{[0, 1, 2, 3, 4, 5, 6].map(n => <Cell key={n} n={n} on={n >= lo && n <= hi ? on : 0} color={color} />)}</div>;
};

const t1 = wt('первый') - 0.3, t2 = wt('дальше') - 0.3, t3 = wt('два') - 0.3, t4 = wt('при') - 0.3;

const Dots = () => (
  <div style={{ position: 'absolute', left: 90, right: 90, top: 760, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ position: 'absolute', left: 60, right: 60, top: 68, height: 8, borderRadius: 4, background: C.mint, opacity: 0.6 }} />
    {[0, 1, 2].map(i => (
      <Pop key={i} at={wt('три') - 0.3 + 0.25 * i} style={{ width: 144, height: 144, borderRadius: 72, background: STAGE[i], border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${STAGE[i]}` }}>
        <span style={{ ...font, fontWeight: 800, fontSize: 76 }}>{i + 1}</span>
      </Pop>
    ))}
  </div>
);

export const Ep03Vertical: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <At from={0} to={t1} fadeIn={0}><Clip src={V.E} focus="50% center" /><Shade /><Dots />
        <Pop at={wt('этапа') - 0.2} style={{ position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center' }}><span style={{ ...font, fontWeight: 800, fontSize: 64 }}>три этапа — <span style={{ color: C.sun }}>один путь</span></span></Pop>
      </At>
      <At from={t1} to={t2}><Clip src={V.C2} rate={0.9} focus="50% center" /><Shade />
        <Panel>
          <Pop at={t1 + 0.1}><Chip bg={STAGE[0]} color={C.white} size={40}>1 этап</Chip></Pop>
          <Pop at={wt('больнице') - 0.3} style={{ marginTop: 22 }}><span style={{ ...font, fontWeight: 800, fontSize: 68, lineHeight: 1.08 }}>В больнице, где вас лечат</span></Pop>
          <Row at={wt('реанимации')} Icon={IconBed} color={C.sun} text="начиная с реанимации" />
          <Norm at={wt('ежедневно')}>
            <div style={{ ...font, fontWeight: 700, fontSize: 40, color: C.mintSoft }}>ежедневно</div>
            <div style={{ ...font, fontWeight: 800, fontSize: 80, color: C.sun, marginTop: 4 }}>не менее 1 часа</div>
            <Pop at={wt('более') - 0.3} dy={10}><div style={{ ...font, fontWeight: 700, fontSize: 46, marginTop: 4 }}>но не более 3 часов</div></Pop>
          </Norm>
        </Panel>
      </At>
      <At from={t2} to={t3}>
        <At from={t2} to={wt('стационарное') - 0.3} fadeIn={0}><Clip src={V.N2} focus="45% center" /></At>
        <At from={wt('стационарное') - 0.3} to={t3}><Clip src={V.E} from={1} focus="50% center" /></At>
        <Shade />
        <Panel top={520}>
          <Pop at={t2 + 0.1}><span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mintSoft }}>По шкале маршрутизации</span></Pop>
          <Scale at={wt('четырёх') - 0.3} lo={4} hi={6} color={C.coral} />
          <Pop at={wt('второй') - 0.3} style={{ marginTop: 30 }}><Chip bg={STAGE[1]} color={C.white} size={44}>4–6 баллов → 2 этап</Chip></Pop>
          <Pop at={wt('стационарное') - 0.3} style={{ marginTop: 24 }}><span style={{ ...font, fontWeight: 800, fontSize: 58, lineHeight: 1.1 }}>стационарное отделение медицинской реабилитации</span></Pop>
          <Norm at={wt('ежедневно', 2)}>
            <span style={{ ...font, fontWeight: 700, fontSize: 40, color: C.mintSoft }}>ежедневно, </span>
            <span style={{ ...font, fontWeight: 800, fontSize: 60, color: C.sun }}>не менее 3 часов</span>
          </Norm>
        </Panel>
      </At>
      <At from={t3} to={t4}>
        <At from={t3} to={wt('если') - 0.4} fadeIn={0}><Clip src={V.K} from={4} focus="50% center" /></At>
        <At from={wt('если') - 0.4} to={t4}><Clip src={V.G} focus="50% center" /></At>
        <Shade />
        <Panel top={520}>
          <Pop at={t3 + 0.1}><span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mintSoft }}>По шкале маршрутизации</span></Pop>
          <Scale at={t3 + 0.1} lo={2} hi={3} color={C.teal} />
          <Pop at={wt('третий') - 0.3} style={{ marginTop: 30 }}><Chip bg={STAGE[2]} color={C.white} size={44}>2–3 балла → 3 этап</Chip></Pop>
          <Pop at={wt('поликлиника') - 0.3} style={{ marginTop: 24 }}><span style={{ ...font, fontWeight: 800, fontSize: 58, lineHeight: 1.1 }}>поликлиника или дневной стационар</span></Pop>
          <Row at={wt('если')} Icon={IconHome} color={C.sun} text="если добираться трудно — на дому" size={44} />
        </Panel>
      </At>
      <At from={t4} to={END} fadeOut={0.5}><Clip src={V.N10} from={3} focus="50% center" /><Shade />
        <Panel top={940}>
          <Pop at={t4 + 0.1} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 90, height: 90, borderRadius: 45, background: C.sun, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconDoc size={56} color={C.navy} stroke={5} /></div>
            <span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mintSoft }}>При выписке</span>
          </Pop>
          <Pop at={wt('сохраните') - 0.3} style={{ marginTop: 22 }}><span style={{ ...font, fontWeight: 800, fontSize: 68, lineHeight: 1.1 }}>сохраните документ <span style={{ color: C.sun }}>с оценкой и планом</span></span></Pop>
          <Pop at={wt('нужен') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 700, fontSize: 44, color: C.mintSoft }}>он нужен на следующем этапе</span></Pop>
          <Pop at={wt('полный') - 0.2} style={{ marginTop: 34 }}><Chip size={40}>Полный выпуск — по ссылке</Chip></Pop>
        </Panel>
      </At>
      <At from={0} to={t4} fadeIn={0} fadeOut={0.3}>
        <div style={{ position: 'absolute', left: 60, top: 110, width: 960 }}>
          <Chip size={30}>Выпуск 3</Chip>
          <div style={{ ...font, fontWeight: 800, fontSize: 76, lineHeight: 1.05, marginTop: 22 }}>Путь пациента:<br /><span style={{ color: C.mint }}>три этапа</span></div>
        </div>
      </At>
      <Captions pages={captions.pages} bottom={250} fontSize={52} maxWidth={940} />
      <Audio src={staticFile('episodes/03/voice-vertical.wav')} />
      <Audio src={staticFile('episodes/03/music-vertical.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};
