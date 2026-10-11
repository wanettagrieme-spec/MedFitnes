import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import captionsJson from '../../episodes/05-vtoroj-etap/voice/vertical-captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Pop } from '../series/ui';
import { IconDoc } from '../series/icons';

// Выпуск 5 — вертикальная версия 9:16 (Shorts, Telegram)
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const END = captions.words[captions.words.length - 1].endMs / 1000 + 1.6;
export const EP05V_DURATION = sec(END);

const P = {
  corridor: 'stock/gamma/G4-rehab-corridor.jpg',
  meeting: 'stock/gamma/G5-mdrk-meeting.jpg',
  goal: 'stock/gamma/G6-goal-setting.jpg',
  bars: 'stock/gamma/G7-parallel-bars.jpg',
  discharge: 'stock/gamma/G12-discharge.jpg',
};
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.45) 28%, rgba(11,37,69,0.25) 50%, rgba(11,37,69,0.88) 100%)' }} />;
const Panel: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 980 }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top }}>{children}</div>
);
const Box: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Pop at={at - 0.3} style={{ marginTop: 16, padding: '20px 26px', borderRadius: 26, background: 'rgba(11,37,69,0.86)', border: '2px solid rgba(255,255,255,0.15)' }}>{children}</Pop>
);
const T: React.FC<{ s?: number; c?: string; children: React.ReactNode }> = ({ s = 50, c = C.white, children }) => <span style={{ ...font, fontWeight: 800, fontSize: s, color: c, lineHeight: 1.12 }}>{children}</span>;

const t1 = wt('сначала') - 0.3, t2 = wt('работают') - 0.3, t3 = wt('занятия', 2) - 0.3, t4 = wt('команда', 2) - 0.3, t5 = wt('третье') - 0.3;

export const Ep05Vertical: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <At from={0} to={t1} fadeIn={0}><Photo src={P.corridor} focus="30% center" /><Shade />
        <Panel top={900}>
          <Pop at={0.2}><Chip bg={C.coral} color={C.white} size={40}>2 этап</Chip></Pop>
          <Pop at={wt('стационарное') - 0.3} style={{ marginTop: 18 }}><T s={60}>Стационарное отделение <span style={{ color: C.sun }}>медицинской реабилитации</span></T></Pop>
          <Box at={wt('ежедневно')}><T s={40} c={C.mintSoft}>ежедневно, </T><T s={56} c={C.sun}>не менее 3 часов</T></Box>
        </Panel>
      </At>
      <At from={t1} to={t2}><Photo src={P.goal} focus="62% center" /><Shade />
        <Panel top={940}>
          <Box at={wt('оценивает')}><T s={44}>оценка → реабилитационный диагноз</T></Box>
          <Box at={wt('формулирует')}><T s={44}>цель — <span style={{ color: C.sun }}>вместе с вами</span>, достижимая к выписке</T></Box>
          <Box at={wt('план')}><T s={44}>индивидуальный план (ИПМР)</T></Box>
        </Panel>
      </At>
      <At from={t2} to={t3}><Photo src={P.meeting} focus="22% center" /><Shade />
        <Panel top={960}>
          <Pop at={t2 + 0.1}><T s={48} c={C.mint}>Команда отделения</T></Pop>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
            {([['врач', 'врач ФРМ'], ['инструктор', 'инструктор ЛФК'], ['эрготерапевт', 'эрготерапевт'], ['психолог', 'психолог'], ['логопед', 'логопед'], ['медсестра', 'медсестра']] as [string, string][]).map(([w, t]) => (
              <Pop key={w} at={wt(w) - 0.3} dy={10}><Chip bg="rgba(11,37,69,0.85)" color={C.white} size={38}>{t}</Chip></Pop>
            ))}
          </div>
        </Panel>
      </At>
      <At from={t3} to={t4}><Photo src={P.bars} focus="30% center" /><Shade />
        <Panel top={1000}><Pop at={t3 + 0.2}><Chip size={60}>Только индивидуально</Chip></Pop></Panel>
      </At>
      <At from={t4} to={t5}><Photo src={P.meeting} focus="40% center" /><Shade />
        <Panel top={920}>
          <Pop at={t4 + 0.1}><T s={54}>Команда обсуждает вас <span style={{ color: C.sun }}>минимум 3 раза</span></T></Pop>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {([['начале', '1 · начало'], ['середине', '2 · середина'], ['конце', '3 · конец']] as [string, string][]).map(([w, t]) => (
              <Pop key={w} at={wt(w) - 0.3} dy={10}><Chip bg={C.coral} color={C.white} size={36}>{t}</Chip></Pop>
            ))}
          </div>
        </Panel>
      </At>
      <At from={t5} to={END} fadeOut={0.5}><Photo src={P.discharge} focus="45% center" /><Shade />
        <Panel top={900}>
          <Pop at={t5 + 0.1} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 86, height: 86, borderRadius: 43, background: C.sun, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconDoc size={54} color={C.navy} stroke={5} /></div>
            <T s={50}>3-е обсуждение = <span style={{ color: C.sun }}>выписка</span></T>
          </Pop>
          <Box at={wt('итог')}><T s={42}>итог · шкала маршрутизации · следующий этап</T></Box>
          <Pop at={wt('полный') - 0.2} style={{ marginTop: 26 }}><Chip size={40}>Полный выпуск — по ссылке</Chip></Pop>
        </Panel>
      </At>
      <At from={0} to={END} fadeIn={0} fadeOut={0.5}>
        <div style={{ position: 'absolute', left: 60, top: 110, width: 960 }}>
          <Chip size={30}>Выпуск 5</Chip>
          <div style={{ ...font, fontWeight: 800, fontSize: 56, lineHeight: 1.05, marginTop: 22 }}>Второй этап:<br /><span style={{ color: C.mint }}>отделение медицинской реабилитации</span></div>
        </div>
      </At>
      <Captions pages={captions.pages} bottom={250} fontSize={52} maxWidth={940} />
      <Audio src={staticFile('episodes/05/voice-vertical.wav')} />
      <Audio src={staticFile('episodes/05/music-vertical.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};
