import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import captionsJson from '../../episodes/07-komanda/voice/vertical-captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Pop } from '../series/ui';

// Выпуск 7 — вертикальная версия 9:16 (Shorts, Telegram)
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const END = captions.words[captions.words.length - 1].endMs / 1000 + 1.6;
export const EP07V_DURATION = sec(END);

const P = {
  meeting: 'stock/canva/C19-team-meeting.png',
  doctor: 'stock/canva/C20-frm-doctor-leads.png',
  balance: 'stock/canva/C21-balance-test.png',
  psych: 'stock/canva/C23-psychologist-memory.png',
  stairs: 'stock/canva/C26-stairs-family.png',
  goal: 'stock/canva/C28-goal-together.png',
};
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.45) 28%, rgba(11,37,69,0.25) 50%, rgba(11,37,69,0.88) 100%)' }} />;
const Panel: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 980 }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top }}>{children}</div>
);
const Box: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Pop at={at - 0.3} style={{ marginTop: 14, padding: '18px 24px', borderRadius: 26, background: 'rgba(11,37,69,0.86)', border: '2px solid rgba(255,255,255,0.15)' }}>{children}</Pop>
);
const T: React.FC<{ s?: number; c?: string; children: React.ReactNode }> = ({ s = 50, c = C.white, children }) => <span style={{ ...font, fontWeight: 800, fontSize: s, color: c, lineHeight: 1.12 }}>{children}</span>;

const t1 = wt('мультидисциплинарная') - 0.3, t2 = wt('каждый') - 0.3, t3 = wt('вместе') - 0.3, t4 = wt('определяют') - 0.3, t5 = wt('цель') - 0.3;
const CATS: [string, string][] = [['B', 'функции'], ['S', 'структуры'], ['D', 'активность'], ['D', 'участие'], ['E', 'среда + личностные']];

export const Ep07Vertical: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <At from={0} to={t1} fadeIn={0}><Photo src={P.meeting} focus="57% center" /><Shade />
        <Panel top={960}><Pop at={0.2}><T s={66}>Кто будет с вами <span style={{ color: C.sun }}>работать?</span></T></Pop></Panel>
      </At>
      <At from={t1} to={t2}><Photo src={P.doctor} focus="63% center" /><Shade />
        <Panel top={900}>
          <Pop at={t1 + 0.1}><T s={52}>Мультидисциплинарная <span style={{ color: C.mint }}>реабилитационная команда</span></T></Pop>
          <Box at={wt('руководит')}><T s={40}>руководит — врач физической и реабилитационной медицины</T></Box>
        </Panel>
      </At>
      <At from={t2} to={t3}><Photo src={P.balance} focus="47% center" /><Shade />
        <Panel top={980}><Box at={t2 + 0.3}><T s={50}>каждый оценивает вас <span style={{ color: C.sun }}>в своей области</span></T></Box></Panel>
      </At>
      <At from={t3} to={t4}><Photo src={P.psych} focus="35% center" /><Shade />
        <Panel top={880}>
          <Pop at={t3 + 0.1}><T s={46}>Реабилитационный диагноз — <span style={{ color: C.sun }}>5 категорий здоровья</span></T></Pop>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
            {CATS.map(([l, t], i) => (
              <Pop key={t} at={wt('пяти') + i * 0.18} dy={10}><Chip bg="rgba(11,37,69,0.88)" color={C.white} size={34}><span style={{ color: C.sun }}>{l}</span> · {t}</Chip></Pop>
            ))}
          </div>
        </Panel>
      </At>
      <At from={t4} to={t5}><Photo src={P.stairs} focus="52% center" /><Shade />
        <Panel top={880}>
          <Pop at={t4 + 0.1}><T s={52}>Реабилитационный <span style={{ color: C.sun }}>потенциал</span></T></Pop>
          <Box at={wt('насколько')}><T s={40}>насколько можно восстановиться — и за какое время</T></Box>
          <Box at={wt('зависит')}><T s={36} c={C.mintSoft}>тяжесть состояния · желание заниматься · близкие</T></Box>
        </Panel>
      </At>
      <At from={t5} to={END} fadeOut={0.5}><Photo src={P.goal} focus="45% center" /><Shade />
        <Panel top={900}>
          <Pop at={t5 + 0.1}><T s={54}>Цель — <span style={{ color: C.sun }}>вместе с вами</span></T></Pop>
          <Box at={wt('главный')}><T s={44}>главный участник команды — вы</T></Box>
          <Pop at={wt('полный') - 0.2} style={{ marginTop: 26 }}><Chip size={40}>Полный выпуск — по ссылке</Chip></Pop>
        </Panel>
      </At>
      <At from={0} to={END} fadeIn={0} fadeOut={0.5}>
        <div style={{ position: 'absolute', left: 60, top: 110, width: 960 }}>
          <Chip size={30}>Выпуск 7</Chip>
          <div style={{ ...font, fontWeight: 800, fontSize: 56, lineHeight: 1.05, marginTop: 22 }}>Кто будет с вами работать:<br /><span style={{ color: C.mint }}>команда специалистов</span></div>
        </div>
      </At>
      <Captions pages={captions.pages} bottom={250} fontSize={52} maxWidth={940} />
      <Audio src={staticFile('episodes/07/voice-vertical.wav')} />
      <Audio src={staticFile('episodes/07/music-vertical.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};
