import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import captionsJson from '../../episodes/02-komu-nuzhna/voice/vertical-captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Clip, useAppearAt } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Gradient, Pop } from '../series/ui';
import { IconBone, IconBrain, IconHeart, IconShirt, IconSpeech, IconWalk } from '../series/icons';

// Выпуск 2 — вертикальная версия 9:16 (Shorts, Telegram)
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const END = captions.words[captions.words.length - 1].endMs / 1000 + 1.6;
export const EP02V_DURATION = sec(END);

const V = {
  N1: 'stock/pexels/N1-man-walker-855482.mp4',
  N2: 'stock/pexels/N2-balance-training-6023255.mp4',
  N3: 'stock/pexels/N3-hand-blue-ball-25950159.mp4',
  N4: 'stock/pexels/N4-doctor-reflexes-14936269.mp4',
  N5: 'stock/pexels/N5-treadmill-woman-6286151.mp4',
  N9: 'stock/pexels/N9-senior-doctor-talk-8375621.mp4',
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.9) 0%, rgba(11,37,69,0.35) 32%, rgba(11,37,69,0.15) 55%, rgba(11,37,69,0.8) 100%)' }} />;
const Row: React.FC<{ at: number; Icon: IconT; color: string; text: string }> = ({ at, Icon, color, text }) => (
  <Pop at={at - 0.3} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '22px 28px', marginBottom: 18, borderRadius: 28, background: 'rgba(11,37,69,0.82)', border: '2px solid rgba(255,255,255,0.15)' }}>
    <div style={{ width: 80, height: 80, borderRadius: 40, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={50} color={C.navy} stroke={5} /></div>
    <span style={{ ...font, fontWeight: 800, fontSize: 50 }}>{text}</span>
  </Pop>
);
const Cell: React.FC<{ n: number; on: number }> = ({ n, on }) => (
  <div style={{ width: 118, height: 118, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on > 0.5 ? (n >= 4 ? C.coral : C.teal) : 'rgba(255,255,255,0.14)' }}>
    <span style={{ ...font, fontWeight: 800, fontSize: 58 }}>{n}</span>
  </div>
);

const t1 = wt('она') - 0.3, t2 = wt('а') - 0.3, t3 = wt('три') - 0.3, t4 = wt('где') - 0.3, t5 = wt('стало', 2) - 0.3;

const ScaleBlock = () => {
  const hi = useAppearAt(wt('четырёх') - 0.3), lo = useAppearAt(wt('два') - 0.3);
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 520 }}>
      <Pop at={t4 + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 52 }}>Шкала от 0 до 6</span></Pop>
      <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>{[0, 1, 2, 3, 4, 5, 6].map(n => <Cell key={n} n={n} on={n >= 4 ? hi : n >= 2 ? lo : 0} />)}</div>
      <Pop at={wt('четырёх') + 0.3} style={{ marginTop: 40 }}><Chip bg={C.coral} color={C.white} size={44}>4–6 → отделение в больнице</Chip></Pop>
      <Pop at={wt('два') + 0.3} style={{ marginTop: 24 }}><Chip bg={C.teal} color={C.white} size={44}>2–3 → поликлиника,</Chip></Pop>
      <Pop at={wt('дневной') - 0.2} style={{ marginTop: 14 }}><Chip bg={C.teal} color={C.white} size={44}>дневной стационар или дом</Chip></Pop>
    </div>
  );
};

export const Ep02Vertical: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <At from={0} to={t1} fadeIn={0}><Clip src={V.N3} from={2} focus="55% center" /><Shade />
        <Pop at={wt('инсульта') - 0.6} style={{ position: 'absolute', left: 70, top: 600, width: 940 }}><span style={{ ...font, fontWeight: 800, fontSize: 70, lineHeight: 1.1 }}>Не только <span style={{ color: C.sun }}>после инсульта</span></span></Pop>
      </At>
      <At from={t1} to={t2}><Clip src={V.N1} from={3} focus="40% center" /><Shade />
        <div style={{ position: 'absolute', left: 70, top: 520, width: 940 }}>
          <Pop at={t1 + 0.1} style={{ marginBottom: 26 }}><span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mintSoft }}>Нужна, если стало трудно:</span></Pop>
          <Row at={wt('ходить')} Icon={IconWalk} color={C.mint} text="ходить" />
          <Row at={wt('обслуживать')} Icon={IconShirt} color={C.sky} text="обслуживать себя" />
          <Row at={wt('говорить')} Icon={IconSpeech} color={C.sun} text="говорить, глотать" />
        </div>
      </At>
      <At from={t2} to={t3}><Gradient from={C.navy} to={C.teal} angle={160} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 300px' }}>
          <Pop at={t2 + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 92, textAlign: 'center', display: 'block', lineHeight: 1.08 }}>Нет последствий —<br /><span style={{ color: C.sun }}>не нужна</span></span></Pop>
        </AbsoluteFill>
      </At>
      <At from={t3} to={t4}><Clip src={V.N5} focus="40% center" /><Shade />
        <div style={{ position: 'absolute', left: 70, top: 520, width: 940 }}>
          <Pop at={t3 + 0.1} style={{ marginBottom: 26 }}><span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mintSoft }}>Три направления:</span></Pop>
          <Row at={wt('нервная')} Icon={IconBrain} color={C.sky} text="нервная система" />
          <Row at={wt('суставы')} Icon={IconBone} color={C.coral} text="суставы и кости" />
          <Row at={wt('внутренние')} Icon={IconHeart} color={C.mint} text="внутренние органы" />
        </div>
      </At>
      <At from={t4} to={t5}><Gradient from={C.ink} to={C.navy} angle={160} /><ScaleBlock /></At>
      <At from={t5} to={END} fadeOut={0.5}><Clip src={V.N9} from={2} focus="50% center" /><Shade />
        <div style={{ position: 'absolute', left: 70, top: 1000, width: 940 }}>   {/* ниже лица врача */}
          <Pop at={t5 + 0.1}><span style={{ ...font, fontWeight: 700, fontSize: 48, color: C.mintSoft }}>Стало трудно делать привычные вещи?</span></Pop>
          <Pop at={wt('спросите') - 0.3} style={{ marginTop: 22 }}><span style={{ ...font, fontWeight: 800, fontSize: 74, lineHeight: 1.1 }}>Спросите врача <span style={{ color: C.sun }}>о реабилитации</span></span></Pop>
          <Pop at={wt('полный') - 0.2} style={{ marginTop: 50 }}><Chip size={40}>Полный выпуск — по ссылке</Chip></Pop>
        </div>
      </At>
      <At from={0} to={t5} fadeIn={0} fadeOut={0.3}>
        <div style={{ position: 'absolute', left: 70, top: 110, width: 940 }}>
          <Chip size={30}>Выпуск 2</Chip>
          <div style={{ ...font, fontWeight: 800, fontSize: 76, lineHeight: 1.05, marginTop: 24 }}>Кому нужна <span style={{ color: C.mint }}>реабилитация?</span></div>
        </div>
      </At>
      <Captions pages={captions.pages} bottom={250} fontSize={52} maxWidth={940} />
      <Audio src={staticFile('episodes/02/voice-vertical.wav')} />
      <Audio src={staticFile('episodes/02/music-vertical.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};
