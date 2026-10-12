import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import captionsJson from '../../episodes/10-kak-popast/voice/vertical-captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Pop } from '../series/ui';

// Выпуск 10 — вертикальная версия 9:16 (Shorts, Telegram)
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const END = captions.words[captions.words.length - 1].endMs / 1000 + 1.8;
export const EP10V_DURATION = sec(END);

const P = {
  reception: 'stock/canva/C47-reception.png',
  docs: 'stock/canva/C48-documents.png',
  ward: 'stock/canva/C49-ward-referral.png',
  gp: 'stock/canva/C50-gp-office.png',
  motivation: 'stock/canva/C55-motivation.png',
};
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.45) 28%, rgba(11,37,69,0.25) 50%, rgba(11,37,69,0.88) 100%)' }} />;
const Panel: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 980 }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top }}>{children}</div>
);
const Box: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Pop at={at - 0.3} style={{ marginTop: 14, padding: '18px 24px', borderRadius: 26, background: 'rgba(11,37,69,0.86)', border: '2px solid rgba(255,255,255,0.15)' }}>{children}</Pop>
);
const T: React.FC<{ s?: number; c?: string; children: React.ReactNode }> = ({ s = 50, c = C.white, children }) => <span style={{ ...font, fontWeight: 800, fontSize: s, color: c, lineHeight: 1.12 }}>{children}</span>;

const t1 = wt('если') - 0.3, t2 = wt('если', 2) - 0.3, t3 = wt('возьмите') - 0.3, t4 = wt('самое') - 0.4;

export const Ep10Vertical: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <At from={0} to={t1} fadeIn={0}><Photo src={P.reception} focus="30% center" /><Shade />
        <Panel top={920}>
          <Pop at={0.2}><T s={60}>Сколько стоит <span style={{ color: C.sun }}>реабилитация?</span></T></Pop>
          <Box at={wt('бесплатно')}><T s={56} c={C.sun}>бесплатно</T><T s={40}> — по полису ОМС, при медицинских показаниях</T></Box>
        </Panel>
      </At>
      <At from={t1} to={t2}><Photo src={P.ward} focus="40% center" /><Shade />
        <Panel top={920}>
          <Pop at={t1 + 0.1}><T s={50}>В больнице — <span style={{ color: C.mint }}>начинается там же</span></T></Pop>
          <Box at={wt('направит')}><T s={42}>лечащий врач направит на следующий этап</T></Box>
        </Panel>
      </At>
      <At from={t2} to={t3}><Photo src={P.gp} focus="35% center" /><Shade />
        <Panel top={980}><Box at={t2 + 0.3}><T s={46}>дома — <span style={{ color: C.sun }}>к врачу поликлиники</span></T></Box></Panel>
      </At>
      <At from={t3} to={t4}><Photo src={P.docs} focus="50% center" /><Shade />
        <Panel top={960}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {([['паспорт', 'паспорт'], ['полис', 'полис ОМС'], ['выписку', 'выписка']] as [string, string][]).map(([w, t]) => (
              <Pop key={w} at={wt(w) - 0.3} dy={10}><Chip size={44}>{t}</Chip></Pop>
            ))}
          </div>
        </Panel>
      </At>
      <At from={t4} to={END} fadeOut={0.6}><Photo src={P.motivation} focus="40% center" /><Shade />
        <Panel top={880}>
          <Pop at={t4 + 0.2}><T s={50}>И самое главное —</T></Pop>
          <Pop at={wt('мотивация') - 0.3} style={{ marginTop: 8 }}><T s={78} c={C.sun}>ваша мотивация</T></Pop>
          <Box at={wt('без')}><T s={42}>без неё всё теряет смысл</T></Box>
          <Pop at={wt('полный') - 0.2} style={{ marginTop: 22 }}><Chip size={36}>Полный выпуск и мифы — по ссылке</Chip></Pop>
        </Panel>
      </At>
      <At from={0} to={END} fadeIn={0} fadeOut={0.5}>
        <div style={{ position: 'absolute', left: 60, top: 110, width: 960 }}>
          <Chip size={30}>Выпуск 10</Chip>
          <div style={{ ...font, fontWeight: 800, fontSize: 54, lineHeight: 1.05, marginTop: 22 }}>Как попасть на реабилитацию<br /><span style={{ color: C.mint }}>и сколько это стоит</span></div>
        </div>
      </At>
      <Captions pages={captions.pages} bottom={250} fontSize={52} maxWidth={940} />
      <Audio src={staticFile('episodes/10/voice-vertical.wav')} />
      <Audio src={staticFile('episodes/10/music-vertical.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};
