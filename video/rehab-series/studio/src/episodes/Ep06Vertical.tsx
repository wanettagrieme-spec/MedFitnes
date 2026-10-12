import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import captionsJson from '../../episodes/06-tretij-etap/voice/vertical-captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Pop } from '../series/ui';
import { IconHome } from '../series/icons';

// Выпуск 6 — вертикальная версия 9:16 (Shorts, Telegram)
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const END = captions.words[captions.words.length - 1].endMs / 1000 + 1.6;
export const EP06V_DURATION = sec(END);

const P = {
  hall: 'stock/canva/C7-polyclinic-hall.png',
  referral: 'stock/canva/C8-referral.png',
  dayHospital: 'stock/canva/C11-day-hospital.png',
  group: 'stock/canva/C9-group-session.png',
  bus: 'stock/canva/C13-bus.png',
  homeVisit: 'stock/canva/C14-home-visit.png',
};
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.45) 28%, rgba(11,37,69,0.25) 50%, rgba(11,37,69,0.88) 100%)' }} />;
const Panel: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 980 }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top }}>{children}</div>
);
const Box: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Pop at={at - 0.3} style={{ marginTop: 16, padding: '20px 26px', borderRadius: 26, background: 'rgba(11,37,69,0.86)', border: '2px solid rgba(255,255,255,0.15)' }}>{children}</Pop>
);
const T: React.FC<{ s?: number; c?: string; children: React.ReactNode }> = ({ s = 50, c = C.white, children }) => <span style={{ ...font, fontWeight: 800, fontSize: s, color: c, lineHeight: 1.12 }}>{children}</span>;

const t1 = wt('направляют') - 0.3, t2 = wt('направляют', 2) - 0.3, t3 = wt('занятия') - 0.3, t4 = wt('задача') - 0.3, t5 = wt('если') - 0.3;

export const Ep06Vertical: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <At from={0} to={t1} fadeIn={0}><Photo src={P.hall} focus="40% center" /><Shade />
        <Panel top={940}>
          <Pop at={0.2}><Chip bg={C.teal} color={C.white} size={40}>3 этап</Chip></Pop>
          <Pop at={wt('ближе') - 0.3} style={{ marginTop: 18 }}><T s={66}>ближе <span style={{ color: C.sun }}>к дому</span></T></Pop>
        </Panel>
      </At>
      <At from={t1} to={t2}><Photo src={P.referral} focus="34% center" /><Shade />
        <Panel top={940}>
          <Pop at={t1 + 0.1}><T s={50} c={C.mint}>Направляют врачи поликлиники</T></Pop>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
            {([['терапевт', 'терапевт'], ['общей', 'врач общей практики'], ['врач-специалист', 'врач-специалист']] as [string, string][]).map(([w, t]) => (
              <Pop key={w} at={wt(w) - 0.3} dy={10}><Chip bg="rgba(11,37,69,0.85)" color={C.white} size={40}>{t}</Chip></Pop>
            ))}
          </div>
        </Panel>
      </At>
      <At from={t2} to={t3}><Photo src={P.dayHospital} focus="24% center" /><Shade />
        <Panel top={880}>
          <Pop at={t2 + 0.1}><T s={50} c={C.mint}>Куда</T></Pop>
          <Box at={wt('отделение')}><T s={40}>отделение медицинской реабилитации поликлиники</T></Box>
          <Box at={wt('дневной')}><T s={40}>дневной стационар поликлиники</T></Box>
          <Box at={wt('центр')}><T s={40}>центр медицинской реабилитации · санаторий</T></Box>
        </Panel>
      </At>
      <At from={t3} to={t4}><Photo src={P.group} focus="40% center" /><Shade />
        <Panel top={940}>
          <Box at={wt('реже')}><T s={46} c={C.mintSoft}>не реже 1 раза в 2 суток</T></Box>
          <Box at={wt('менее')}><T s={60} c={C.sun}>не менее 3 часов</T></Box>
        </Panel>
      </At>
      <At from={t4} to={t5}><Photo src={P.bus} focus="52% center" /><Shade />
        <Panel top={960}>
          <Pop at={t4 + 0.1}><T s={46} c={C.mintSoft}>Задача</T></Pop>
          <Pop at={wt('обычной') - 0.3} style={{ marginTop: 10 }}><T s={60}>вернуться к <span style={{ color: C.sun }}>обычной повседневной жизни</span></T></Pop>
        </Panel>
      </At>
      <At from={t5} to={END} fadeOut={0.5}><Photo src={P.homeVisit} focus="80% center" /><Shade />
        <Panel top={900}>
          <Pop at={wt('дому') - 0.4} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 86, height: 86, borderRadius: 43, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconHome size={54} color={C.navy} stroke={5} /></div>
            <T s={46}>на дому — по решению врачебной комиссии</T>
          </Pop>
          <Pop at={wt('полный') - 0.2} style={{ marginTop: 30 }}><Chip size={40}>Полный выпуск — по ссылке</Chip></Pop>
        </Panel>
      </At>
      <At from={0} to={END} fadeIn={0} fadeOut={0.5}>
        <div style={{ position: 'absolute', left: 60, top: 110, width: 960 }}>
          <Chip size={30}>Выпуск 6</Chip>
          <div style={{ ...font, fontWeight: 800, fontSize: 56, lineHeight: 1.05, marginTop: 22 }}>Третий этап:<br /><span style={{ color: C.mint }}>поликлиника, дневной стационар, дом</span></div>
        </div>
      </At>
      <Captions pages={captions.pages} bottom={250} fontSize={52} maxWidth={940} />
      <Audio src={staticFile('episodes/06/voice-vertical.wav')} />
      <Audio src={staticFile('episodes/06/music-vertical.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};
