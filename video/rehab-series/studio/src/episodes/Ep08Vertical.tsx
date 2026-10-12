import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import captionsJson from '../../episodes/08-luchshe/voice/vertical-captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Pop } from '../series/ui';

// Выпуск 8 — вертикальная версия 9:16 (Shorts, Telegram)
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const END = captions.words[captions.words.length - 1].endMs / 1000 + 1.6;
export const EP08V_DURATION = sec(END);

const P = {
  progress: 'stock/canva/C29-progress-chart.png',
  target: 'stock/canva/C30-goal-target.png',
  shop: 'stock/canva/C31-shopping-bags.png',
  walkTest: 'stock/canva/C33-walk-test.png',
  park: 'stock/canva/C34-park-walk.png',
};
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.45) 28%, rgba(11,37,69,0.25) 50%, rgba(11,37,69,0.88) 100%)' }} />;
const Panel: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 980 }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top }}>{children}</div>
);
const Box: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Pop at={at - 0.3} style={{ marginTop: 14, padding: '18px 24px', borderRadius: 26, background: 'rgba(11,37,69,0.86)', border: '2px solid rgba(255,255,255,0.15)' }}>{children}</Pop>
);
const T: React.FC<{ s?: number; c?: string; children: React.ReactNode }> = ({ s = 50, c = C.white, children }) => <span style={{ ...font, fontWeight: 800, fontSize: s, color: c, lineHeight: 1.12 }}>{children}</span>;

const t1 = wt('начале') - 0.3, t2 = wt('умной') - 0.6, t3 = wt('например') - 0.3, t4 = wt('оценивают') - 0.6, t5 = wt('главный') - 0.3;
const SID: [string, string][] = [['специфичной', 'С'], ['измеримой', 'И'], ['достижимой', 'ДО'], ['реалистичной', 'Р'], ['определенной', 'ОВ']];

export const Ep08Vertical: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <At from={0} to={t1} fadeIn={0}><Photo src={P.progress} focus="38% center" /><Shade />
        <Panel top={960}><Pop at={0.2}><T s={64}>Как понять, что реабилитация <span style={{ color: C.sun }}>помогает?</span></T></Pop></Panel>
      </At>
      <At from={t1} to={t2}><Photo src={P.target} focus="40% center" /><Shade />
        <Panel top={980}><Box at={t1 + 0.3}><T s={50}>цель — <span style={{ color: C.sun }}>вместе с вами</span></T></Box></Panel>
      </At>
      <At from={t2} to={t3}><Photo src={P.target} focus="55% center" zoom={0.1} /><Shade />
        <Panel top={900}>
          <Pop at={t2 + 0.1}><T s={54}>Умная цель — <span style={{ color: C.sun }}>как Сидоров</span></T></Pop>
          <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
            {SID.map(([w, l], i) => (
              <Pop key={w} at={wt(w) - 0.3} dy={10} style={{ width: 170, height: 170, borderRadius: 85, background: [C.sun, C.mint, C.sky, C.coral, C.mintSoft][i], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ ...font, fontWeight: 800, fontSize: l.length > 1 ? 64 : 80, color: C.navy }}>{l}</span>
              </Pop>
            ))}
          </div>
        </Panel>
      </At>
      <At from={t3} to={t4}><Photo src={P.shop} focus="37% center" /><Shade />
        <Panel top={940}><Box at={t3 + 0.3}><T s={46}>через 3 недели — <span style={{ color: C.sun }}>сам в магазин</span></T></Box></Panel>
      </At>
      <At from={t4} to={t5}><Photo src={P.walkTest} focus="52% center" /><Shade />
        <Panel top={940}>
          <Pop at={t4 + 0.1}><T s={50}>Оценка: <span style={{ color: C.sun }}>начало · середина · конец</span></T></Pop>
        </Panel>
      </At>
      <At from={t5} to={END} fadeOut={0.5}><Photo src={P.park} focus="34% center" /><Shade />
        <Panel top={900}>
          <Pop at={t5 + 0.1}><T s={50}>Главный признак успеха —</T></Pop>
          <Box at={wt('пользуетесь')}><T s={46} c={C.sun}>вы пользуетесь навыком сами, каждый день</T></Box>
          <Pop at={wt('полный') - 0.2} style={{ marginTop: 26 }}><Chip size={40}>Полный выпуск — по ссылке</Chip></Pop>
        </Panel>
      </At>
      <At from={0} to={END} fadeIn={0} fadeOut={0.5}>
        <div style={{ position: 'absolute', left: 60, top: 110, width: 960 }}>
          <Chip size={30}>Выпуск 8</Chip>
          <div style={{ ...font, fontWeight: 800, fontSize: 56, lineHeight: 1.05, marginTop: 22 }}>Как понять,<br /><span style={{ color: C.mint }}>что становится лучше</span></div>
        </div>
      </At>
      <Captions pages={captions.pages} bottom={250} fontSize={52} maxWidth={940} />
      <Audio src={staticFile('episodes/08/voice-vertical.wav')} />
      <Audio src={staticFile('episodes/08/music-vertical.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};
