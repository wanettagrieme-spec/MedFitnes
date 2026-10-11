import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import captionsJson from '../../episodes/04-pervyj-etap/voice/vertical-captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Pop } from '../series/ui';
import { IconBed, IconClock, IconHand, IconHeart, IconPerson } from '../series/icons';

// Выпуск 4 — вертикальная версия 9:16 (Shorts, Telegram)
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const END = captions.words[captions.words.length - 1].endMs / 1000 + 1.6;
export const EP04V_DURATION = sec(END);

const P = {
  icu: 'stock/canva/C4-icu-patient.png',
  team: 'stock/canva/C5-team-bedside.png',
  pos: 'stock/canva/C6-positioning.png',
  tilt: 'stock/canva/C1-tilt-table.png',
  cycle: 'stock/canva/C2-bedside-cycle.png',
  magnet: 'stock/canva/C3-magnetotherapy.png',
  family: 'stock/gamma/G3-family-hand.jpg',
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.45) 28%, rgba(11,37,69,0.25) 50%, rgba(11,37,69,0.88) 100%)' }} />;
const Panel: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 560 }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top }}>{children}</div>
);
const Row: React.FC<{ at: number; n?: number; Icon?: IconT; color: string; text: string; sub?: string; size?: number }> = ({ at, n, Icon, color, text, sub, size = 54 }) => (
  <Pop at={at - 0.3} style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', borderRadius: 28, background: 'rgba(11,37,69,0.85)', border: '2px solid rgba(255,255,255,0.15)' }}>
    <div style={{ width: 86, height: 86, borderRadius: 43, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {Icon ? <Icon size={52} color={C.navy} stroke={5} /> : <span style={{ ...font, fontWeight: 800, fontSize: 50, color: C.navy }}>{n}</span>}
    </div>
    <div>
      <div style={{ ...font, fontWeight: 800, fontSize: size, lineHeight: 1.1 }}>{text}</div>
      {sub && <div style={{ ...font, fontWeight: 600, fontSize: 34, color: C.mintSoft, marginTop: 4 }}>{sub}</div>}
    </div>
  </Pop>
);

const t1 = wt('начинают') - 0.4, t2 = wt('первых') - 0.4, t3 = wt('постепенно') - 0.3, t4 = wt('а') - 0.3, t5 = wt('медсестра') - 0.3, t6 = wt('работает') - 0.3, t7 = wt('близкие') - 0.3;

export const Ep04Vertical: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <At from={0} to={t2} fadeIn={0}><Photo src={P.icu} focus="68% center" /><Shade />
        <Panel top={560}>
          <Pop at={0.3}><Chip bg={C.skyDeep} color={C.white} size={40}>1 этап</Chip></Pop>
          <Pop at={wt('реанимации') - 0.5} style={{ marginTop: 22 }}><span style={{ ...font, fontWeight: 800, fontSize: 64, lineHeight: 1.08 }}>Реабилитация начинается <span style={{ color: C.sun }}>уже в реанимации</span></span></Pop>
          <At from={t1} to={t2} fadeIn={0.3}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 370, padding: '24px 30px', borderRadius: 28, background: 'rgba(11,37,69,0.88)', border: `3px solid ${C.sun}` }}>
              <Pop at={wt('семидесяти') - 0.4}><span style={{ ...font, fontWeight: 800, fontSize: 52 }}>с первых <span style={{ color: C.sun }}>72 часов</span></span></Pop>
              <Pop at={wt('ежедневно') - 0.3} style={{ marginTop: 12 }}><span style={{ ...font, fontWeight: 700, fontSize: 40, color: C.mintSoft }}>ежедневно</span></Pop>
              <Pop at={wt('менее') - 0.3}><span style={{ ...font, fontWeight: 800, fontSize: 70, color: C.sun }}>не менее 1 часа</span></Pop>
              <Pop at={wt('более') - 0.3}><span style={{ ...font, fontWeight: 700, fontSize: 44 }}>но не более 3 часов</span></Pop>
            </div>
          </At>
        </Panel>
      </At>
      <At from={t2} to={t3}><Photo src={P.pos} focus="50% center" /><Shade /><Panel top={1020}><Row at={t2 + 0.3} n={1} color={C.sun} text="Позиционирование" sub="с первых суток" /></Panel></At>
      <At from={t3} to={t4}><Photo src={P.tilt} focus="38% center" /><Shade /><Panel top={1020}><Row at={t3 + 0.3} n={2} color={C.sun} text="Вертикализатор" sub="поворотный стол" /></Panel></At>
      <At from={t4} to={t5}><Photo src={P.cycle} focus="66% center" /><Shade /><Panel top={1020}><Row at={t4 + 0.3} n={3} color={C.sun} text="Прикроватный велоэргометр" sub="даже в дыхательной маске" size={50} /></Panel></At>
      <At from={t5} to={t6}><Photo src={P.magnet} focus="45% center" /><Shade /><Panel top={1020}><Row at={t5 + 0.3} n={4} color={C.sun} text="Физиотерапия" sub="по показаниям — прямо в палате" /></Panel></At>
      <At from={t6} to={t7}><Photo src={P.team} focus="38% center" /><Shade />
        <Panel top={1000}>
          <Row at={t6 + 0.3} Icon={IconPerson} color={C.mint} text="Команда отделения ранней медицинской реабилитации" size={44} />
          <Pop at={wt('реаниматологом') - 0.3} style={{ marginTop: 18 }}><Chip size={38}>+ реаниматолог</Chip></Pop>
        </Panel>
      </At>
      <At from={t7} to={END} fadeOut={0.5}><Photo src={P.family} focus="55% center" /><Shade />
        <Panel top={980}>
          <Pop at={t7 + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 70, lineHeight: 1.08 }}>Близкие <span style={{ color: C.sun }}>тоже помогают</span></span></Pop>
          <div style={{ display: 'flex', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
            {([['голос', IconHeart], ['разговор', IconHand], ['музыка', IconClock]] as [string, IconT][]).map(([w]) => (
              <Pop key={w} at={wt(w) - 0.3} dy={12}><Chip bg="rgba(255,255,255,0.16)" color={C.white} size={40}>{w}</Chip></Pop>
            ))}
          </div>
          <Pop at={wt('полный') - 0.2} style={{ marginTop: 34 }}><Chip size={40}>Полный выпуск — по ссылке</Chip></Pop>
        </Panel>
      </At>
      <At from={0} to={t7} fadeIn={0} fadeOut={0.3}>
        <div style={{ position: 'absolute', left: 60, top: 110, width: 960 }}>
          <Chip size={30}>Выпуск 4</Chip>
          <div style={{ ...font, fontWeight: 800, fontSize: 62, lineHeight: 1.05, marginTop: 22 }}>Первый этап:<br /><span style={{ color: C.mint }}>реабилитация в реанимации</span></div>
        </div>
      </At>
      <Captions pages={captions.pages} bottom={250} fontSize={52} maxWidth={940} />
      <Audio src={staticFile('episodes/04/voice-vertical.wav')} />
      <Audio src={staticFile('episodes/04/music-vertical.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};
