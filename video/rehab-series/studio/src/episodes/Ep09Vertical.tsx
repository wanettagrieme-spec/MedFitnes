import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import captionsJson from '../../episodes/09-ot-vas/voice/vertical-captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Pop } from '../series/ui';

// Выпуск 9 — вертикальная версия 9:16 (Shorts, Telegram)
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const END = captions.words[captions.words.length - 1].endMs / 1000 + 1.6;
export const EP09V_DURATION = sec(END);

const P = {
  grand: 'stock/canva/C38-grandchildren.png',
  band: 'stock/canva/C46-band-exercise.png',
  jacket: 'stock/canva/C41-jacket-himself.png',
  training: 'stock/canva/C42-training-relatives.png',
  together: 'stock/canva/C45-team-family.png',
};
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.45) 28%, rgba(11,37,69,0.25) 50%, rgba(11,37,69,0.88) 100%)' }} />;
const Panel: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 980 }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top }}>{children}</div>
);
const Box: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Pop at={at - 0.3} style={{ marginTop: 14, padding: '18px 24px', borderRadius: 26, background: 'rgba(11,37,69,0.86)', border: '2px solid rgba(255,255,255,0.15)' }}>{children}</Pop>
);
const T: React.FC<{ s?: number; c?: string; children: React.ReactNode }> = ({ s = 50, c = C.white, children }) => <span style={{ ...font, fontWeight: 800, fontSize: s, color: c, lineHeight: 1.12 }}>{children}</span>;

const t1 = wt('приходите') - 0.3, t2 = wt('близким') - 0.4, t3 = wt('попросите') - 0.3, t4 = wt('поддерживайте') - 0.3;

export const Ep09Vertical: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <At from={0} to={t1} fadeIn={0}><Photo src={P.grand} focus="50% center" /><Shade />
        <Panel top={920}>
          <Pop at={0.2}><T s={60}>Что зависит <span style={{ color: C.sun }}>от вас?</span></T></Pop>
          <Box at={wt('подумайте')}><T s={46}>ради чего вы стараетесь?</T></Box>
        </Panel>
      </At>
      <At from={t1} to={t2}><Photo src={P.band} focus="36% center" /><Shade />
        <Panel top={900}>
          <Box at={t1 + 0.3}><T s={42}>все занятия и задания</T></Box>
          <Box at={wt('делайте')}><T s={42} c={C.sun}>как можно больше — сами</T></Box>
          <Box at={wt('рассказывайте')}><T s={42}>рассказывайте о самочувствии</T></Box>
        </Panel>
      </At>
      <At from={t2} to={t3}><Photo src={P.jacket} focus="62% center" /><Shade />
        <Panel top={920}>
          <Pop at={t2 + 0.1}><T s={50}>Близким — <span style={{ color: C.mint }}>помогать правильно</span></T></Pop>
          <Box at={wt('делать')}><T s={42} c={C.sun}>не делать за человека то, что он может сам</T></Box>
        </Panel>
      </At>
      <At from={t3} to={t4}><Photo src={P.training} focus="50% center" /><Shade />
        <Panel top={1000}><Box at={t3 + 0.3}><T s={46}>попросите команду <span style={{ color: C.sun }}>научить вас</span></T></Box></Panel>
      </At>
      <At from={t4} to={END} fadeOut={0.5}><Photo src={P.together} focus="45% center" /><Shade />
        <Panel top={900}>
          <Box at={t4 + 0.3}><T s={42}>радуйтесь каждой маленькой победе</T></Box>
          <Pop at={wt('реабилитация') - 0.3} style={{ marginTop: 18 }}><T s={54}>Реабилитация — <span style={{ color: C.sun }}>общая работа</span></T></Pop>
          <Pop at={wt('полный') - 0.2} style={{ marginTop: 26 }}><Chip size={40}>Полный выпуск — по ссылке</Chip></Pop>
        </Panel>
      </At>
      <At from={0} to={END} fadeIn={0} fadeOut={0.5}>
        <div style={{ position: 'absolute', left: 60, top: 110, width: 960 }}>
          <Chip size={30}>Выпуск 9</Chip>
          <div style={{ ...font, fontWeight: 800, fontSize: 56, lineHeight: 1.05, marginTop: 22 }}>Что зависит<br /><span style={{ color: C.mint }}>от вас и ваших близких</span></div>
        </div>
      </At>
      <Captions pages={captions.pages} bottom={250} fontSize={52} maxWidth={940} />
      <Audio src={staticFile('episodes/09/voice-vertical.wav')} />
      <Audio src={staticFile('episodes/09/music-vertical.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};
