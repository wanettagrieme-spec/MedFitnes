import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import timings from '../../episodes/02-komu-nuzhna/voice/timings.json';
import captionsJson from '../../episodes/02-komu-nuzhna/voice/captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Clip, useAppearAt } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Frame, Gradient, NextCard, Pop, Strike, TitleCard } from '../series/ui';
import {
  IconBone, IconBrain, IconBuilding, IconCheck, IconDumbbell, IconGauge, IconHeart, IconHome, IconShirt, IconSpeech, IconThermometer, IconWalk,
} from '../series/icons';

// Выпуск 2. «Кому нужна реабилитация?» — 16:9
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const S = timings.scenes;
const END = timings.duration + 1.5;
const B = [0, S[1].start, S[2].start, S[3].start, S[4].start, S[5].start, END];
export const EP02_DURATION = sec(END);

const V = {
  A: 'stock/pexels/A-heart-monitor-6130551.mp4',
  E: 'stock/pexels/E-rehab-gym-6023248.mp4',
  G: 'stock/pexels/G-elderly-couple-home-6023263.mp4',
  K: 'stock/pexels/K-doctor-patient-6998077.mp4',
  N1: 'stock/pexels/N1-man-walker-855482.mp4',
  N2: 'stock/pexels/N2-balance-training-6023255.mp4',
  N3: 'stock/pexels/N3-hand-blue-ball-25950159.mp4',
  N4: 'stock/pexels/N4-doctor-reflexes-14936269.mp4',
  N5: 'stock/pexels/N5-treadmill-woman-6286151.mp4',
  N6: 'stock/pexels/N6-seated-exercise-6023276.mp4',
  N7: 'stock/pexels/N7-blood-pressure-8670942.mp4',
  N8: 'stock/pexels/N8-thermometer-8375452.mp4',
  N9: 'stock/pexels/N9-senior-doctor-talk-8375621.mp4',
  N10: 'stock/pexels/N10-senior-doctor-writing-8375665.mp4',
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;

// ── Сцена 1: крючок — пять поводов, затем заголовок ────────────────────────
const tTitle = wt('так') - 0.2;
const CutLabel: React.FC<{ at: number; text: string }> = ({ at, text }) => (
  <Pop at={at} style={{ position: 'absolute', left: 120, top: 110 }}><Chip bg="rgba(11,37,69,0.85)" color={C.white} size={44}>{text}</Chip></Pop>
);
const Scene1 = () => {
  const c1 = wt('замены') - 0.15, c2 = wt('перелома') - 0.25, c3 = wt('инфаркта') - 0.2, c4 = wt('последствиях') - 0.2;
  return (
    <>
      <At from={0} to={c1} fadeIn={0}><Clip src={V.N3} from={2} /><CutLabel at={0.5} text="инсульт" /></At>
      <At from={c1} to={c2}><Clip src={V.N2} /><CutLabel at={c1 + 0.1} text="замена сустава" /></At>
      <At from={c2} to={c3}><Clip src={V.E} from={1} /><CutLabel at={c2 + 0.1} text="перелом" /></At>
      <At from={c3} to={c4}><Clip src={V.A} from={2} /><CutLabel at={c3 + 0.1} text="инфаркт" /></At>
      <At from={c4} to={B[1]}><Clip src={V.N6} /></At>
      <At from={c4} to={tTitle} fadeIn={0} fadeOut={0.3}><CutLabel at={c4 + 0.1} text="последствия пневмонии" /></At>   {/* подпись гаснет до заголовка */}
      <At from={tTitle} to={B[1]} fadeIn={0.5}><TitleCard at={tTitle} episode={2} line1="Кому нужна" line2="реабилитация?" sub="Не по диагнозу — по жизни" /></At>
    </>
  );
};

// ── Сцена 2: главное правило ───────────────────────────────────────────────
const tIcons = wt('ходить') - 0.4, tTerm = wt('врачи') - 0.3;
const Scene2 = () => (
  <>
    <At from={B[1]} to={B[2]}><Gradient from={C.navy} to={C.teal} /></At>
    <At from={B[1]} to={tIcons} fadeOut={0.4}>
      <Frame x={1060} y={130} w={740} h={640}><Clip src={V.N1} from={3} /></Frame>
      <div style={{ position: 'absolute', left: 130, top: 220, width: 860 }}>
        <Pop at={wt('диагнозу') - 0.5} style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ ...font, fontWeight: 700, fontSize: 70, color: C.sky }}>не по диагнозу</span><Strike at={wt('диагнозу') + 0.3} />
        </Pop>
        <Pop at={wt('изменилось') - 0.5} style={{ marginTop: 60 }}>
          <span style={{ ...font, fontWeight: 800, fontSize: 84, color: C.sun, lineHeight: 1.1 }}>а по тому, что<br />изменилось в жизни</span>
        </Pop>
      </div>
    </At>
    <At from={tIcons} to={tTerm} fadeOut={0.4}>
      <AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 36, paddingBottom: 170 }}>
        {([
          { at: wt('ходить'), Icon: IconWalk, bg: C.mint, label: 'Трудно ходить' },
          { at: wt('обслуживать'), Icon: IconShirt, bg: C.sky, label: 'Обслуживать себя' },
          { at: wt('говорить'), Icon: IconSpeech, bg: C.sun, label: 'Говорить, глотать' },
          { at: wt('нагрузка'), Icon: IconDumbbell, bg: C.coral, label: 'Привычная нагрузка тяжела' },
        ] as { at: number; Icon: IconT; bg: string; label: string }[]).map(({ at, Icon, bg, label }) => (
          <Pop key={label} at={at - 0.25} style={{ width: 370, height: 400, borderRadius: 36, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
            <div style={{ width: 170, height: 170, borderRadius: 100, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={104} color={C.navy} stroke={4.5} /></div>
            <span style={{ ...font, fontWeight: 800, fontSize: 40, textAlign: 'center', lineHeight: 1.15, padding: '0 22px' }}>{label}</span>
          </Pop>
        ))}
      </AbsoluteFill>
    </At>
    <At from={tTerm} to={B[2]}>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 210 }}>
        <Pop at={tTerm + 0.2}><span style={{ ...font, fontWeight: 700, fontSize: 44, color: C.mintSoft }}>Врачи называют это</span></Pop>
        <Pop at={wt('необходимостью') - 0.8} style={{ marginTop: 26 }}><span style={{ ...font, fontWeight: 800, fontSize: 96, textAlign: 'center', display: 'block', lineHeight: 1.05 }}>реабилитационная<br /><span style={{ color: C.mint }}>необходимость</span></span></Pop>
        <Pop at={wt('последствий') - 0.6} style={{ marginTop: 56 }}>
          <span style={{ ...font, fontWeight: 800, fontSize: 48, color: C.navy, background: C.sun, padding: '16px 36px', borderRadius: 50 }}>Нет последствий — реабилитация не нужна</span>
        </Pop>
      </AbsoluteFill>
    </At>
  </>
);

// ── Сцена 3: три направления ───────────────────────────────────────────────
const Column: React.FC<{ x: number; at: number; n: string; title: string; color: string; Icon: IconT; clip: string; from?: number; items: { at: number; text: string }[] }> = ({ x, at, n, title, color, Icon, clip, from = 0, items }) => {
  const a = useAppearAt(at);
  return (
    <div style={{ position: 'absolute', left: x, top: 155, width: 540, height: 655, borderRadius: 34, background: C.white, boxShadow: '0 24px 60px rgba(19,41,61,0.12)', overflow: 'hidden', opacity: a, transform: `translateY(${(1 - a) * 50}px)` }}>
      <div style={{ position: 'relative', height: 200 }}><Clip src={clip} from={from} /></div>
      <div style={{ padding: '24px 34px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={38} color={C.white} stroke={5} /></div>
          <span style={{ ...font, color, fontWeight: 800, fontSize: 24 }}>{n}</span>
        </div>
        <div style={{ ...font, color: C.textDark, fontWeight: 800, fontSize: 36, marginTop: 12, lineHeight: 1.12 }}>{title}</div>
        {items.map(it => (
          <Pop key={it.text} at={it.at - 0.3} dy={14} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginTop: 14 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: color, marginTop: 14, flexShrink: 0 }} />
            <span style={{ ...font, color: C.textDark, fontWeight: 600, fontSize: 30, lineHeight: 1.2 }}>{it.text}</span>
          </Pop>
        ))}
      </div>
    </div>
  );
};
const Scene3 = () => (
  <>
    <At from={B[2]} to={B[3]}><AbsoluteFill style={{ background: C.sand }} /></At>
    <At from={B[2]} to={B[3]}>
      <Pop at={B[2] + 0.1} style={{ position: 'absolute', left: 120, top: 34 }}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 46 }}>Три профиля отделений медицинской реабилитации</span><div style={{ ...font, color: C.textMuted, fontWeight: 600, fontSize: 26, marginTop: 4 }}>по нарушенным функциям — Порядок 788н</div></Pop>
      <Column x={120} at={wt('первый') - 0.3} n="Профиль 1 · нарушения функций" title="Центральная нервная система" color={C.skyDeep} Icon={IconBrain} clip={V.N4}
        items={[{ at: wt('инсульта', 2), text: 'инсульт' }, { at: wt('мозга'), text: 'травмы головного и спинного мозга' }]} />
      <Column x={690} at={wt('второй') - 0.3} n="Профиль 2 · нарушения функций" title="Периферическая нервная и костно-мышечная система" color={C.coral} Icon={IconBone} clip={V.N2} from={2}
        items={[{ at: wt('травм'), text: 'травмы' }, { at: wt('позвоночнике'), text: 'операции на позвоночнике и суставах' }, { at: wt('эндопротезирования'), text: 'эндопротезирование' }]} />
      <Column x={1260} at={wt('третий') - 0.3} n="Профиль 3" title="Соматические заболевания" color={C.teal} Icon={IconHeart} clip={V.N5}
        items={[{ at: wt('инфаркта', 2), text: 'инфаркт' }, { at: wt('сердце'), text: 'операции на сердце и сосудах' }, { at: wt('последствиях', 2), text: 'последствия тяжёлой пневмонии' }]} />
    </At>
  </>
);

// ── Сцена 4: кто решает и как ──────────────────────────────────────────────
const tScale = wt('шкале') - 0.5;
const Cell: React.FC<{ n: number; active: number }> = ({ n, active }) => (
  <div style={{ width: 150, height: 120, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active > 0.5 ? (n >= 4 ? C.coral : C.teal) : '#dfe8ec', transform: `scale(${1 + 0.06 * active})`, boxShadow: active > 0.5 ? '0 12px 30px rgba(19,41,61,0.2)' : 'none' }}>
    <span style={{ ...font, fontWeight: 800, fontSize: 64, color: active > 0.5 ? C.white : C.textMuted }}>{n}</span>
  </div>
);
const ScaleView = () => {
  const hi = useAppearAt(wt('четырёх') - 0.3), lo = useAppearAt(wt('два') - 0.3);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 20 }}>
      {[0, 1, 2, 3, 4, 5, 6].map(n => <Cell key={n} n={n} active={n >= 4 ? hi : n >= 2 ? lo : 0} />)}
    </div>
  );
};
const Result: React.FC<{ x: number; at: number; color: string; range: string; text: string; clip: string; Icon: IconT; extra?: React.ReactNode }> = ({ x, at, color, range, text, clip, Icon, extra }) => {
  const a = useAppearAt(at);
  return (
    <div style={{ position: 'absolute', left: x, top: 420, width: 780, height: 380, borderRadius: 30, background: C.white, boxShadow: '0 20px 50px rgba(19,41,61,0.12)', overflow: 'hidden', display: 'flex', opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>
      <div style={{ position: 'relative', width: 300, flexShrink: 0 }}><Clip src={clip} /></div>
      <div style={{ padding: '30px 34px' }}>
        <span style={{ ...font, fontWeight: 800, fontSize: 34, color: C.white, background: color, padding: '6px 18px', borderRadius: 30 }}>{range}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24 }}><Icon size={52} color={color} stroke={5} /><span style={{ ...font, color: C.textDark, fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>{text}</span></div>
        {extra}
      </div>
    </div>
  );
};
const Scene4 = () => (
  <>
    <At from={B[3]} to={tScale} fadeOut={0.3}>
      <Clip src={V.N9} from={2} />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(11,37,69,0.9) 0%, rgba(11,37,69,0.6) 45%, rgba(11,37,69,0) 75%)' }} />
      <div style={{ position: 'absolute', left: 120, top: 200, width: 900 }}>
        <Pop at={wt('решает') - 0.2}><span style={{ ...font, fontWeight: 800, fontSize: 110, color: C.sun }}>Решает врач</span></Pop>
        <Pop at={wt('потенциалом') - 1.2} style={{ marginTop: 50 }}>
          <div style={{ ...font, fontWeight: 700, fontSize: 36, color: C.mintSoft }}>Реабилитационный потенциал —</div>
          <div style={{ ...font, fontWeight: 800, fontSize: 54, marginTop: 8 }}>перспектива восстановления</div>
        </Pop>
      </div>
    </At>
    <At from={tScale} to={B[4]}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Pop at={tScale + 0.1} style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center' }}>
        <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 50 }}>Шкала реабилитационной маршрутизации</span>
        <div style={{ ...font, color: C.textMuted, fontWeight: 600, fontSize: 30, marginTop: 8 }}>от 0 до 6 баллов: чем больше, тем больше нужна помощь</div>
      </Pop>
      <ScaleView />
      <Result x={130} at={wt('четырёх') + 0.6} color={C.coral} range="4–6 баллов" text="Отделение реабилитации в больнице" clip={V.E} Icon={IconBuilding} />
      <Result x={1010} at={wt('два') + 0.4} color={C.teal} range="2–3 балла" text="Поликлиника или дневной стационар" clip={V.G} Icon={IconHome}
        extra={<Pop at={wt('дома') - 0.4} style={{ marginTop: 18 }}><span style={{ ...font, color: C.teal, fontWeight: 800, fontSize: 34 }}>…а если трудно добираться — дома</span></Pop>} />
    </At>
  </>
);

// ── Сцена 5: когда подождать ───────────────────────────────────────────────
const tBp = wt('давлении') - 0.4;
const Reason: React.FC<{ at: number; Icon: IconT; text: string }> = ({ at, Icon, text }) => (
  <Pop at={at - 0.3} dy={16} style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 26 }}>
    <div style={{ width: 72, height: 72, borderRadius: 36, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={46} color={C.sun} stroke={5} /></div>
    <span style={{ ...font, fontWeight: 700, fontSize: 44 }}>{text}</span>
  </Pop>
);
const Scene5 = () => {
  const ok = () => <IconCheck size={56} color={C.navy} stroke={7} />;
  return (
    <>
      <At from={B[4]} to={B[5]}><Gradient from={C.ink} to={C.navy} angle={160} /></At>
      <At from={B[4]} to={B[5]}>
        <Frame x={100} y={140} w={760} h={640}>
          <At from={B[4]} to={tBp} fadeIn={0}><Clip src={V.N8} from={4} /></At>
          <At from={tBp} to={B[5]}><Clip src={V.N7} from={6} /></At>
        </Frame>
        <div style={{ position: 'absolute', left: 940, top: 150, width: 900 }}>
          <Pop at={B[4] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 58, color: C.mint }}>Иногда реабилитацию откладывают</span></Pop>
          <Reason at={wt('остром')} Icon={IconThermometer} text="острое или инфекционное заболевание" />
          <Reason at={wt('температуре')} Icon={IconThermometer} text="высокая температура" />
          <Reason at={wt('давлении')} Icon={IconGauge} text="нестабильные давление и пульс" />
          <Pop at={wt('отказ') - 0.4} style={{ marginTop: 50, display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ width: 84, height: 84, borderRadius: 42, background: C.sun, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ok()}</div>
            <div><div style={{ ...font, fontWeight: 800, fontSize: 52 }}>Не отказ, а отсрочка</div><div style={{ ...font, fontWeight: 600, fontSize: 32, color: C.mintSoft }}>сначала стабилизируют состояние</div></div>
          </Pop>
        </div>
      </At>
    </>
  );
};

// ── Сцена 6: что сделать + анонс ───────────────────────────────────────────
const tNext = wt('следующем') - 0.5;
const Scene6 = () => (
  <>
    <At from={B[5]} to={tNext} fadeOut={0.3}>
      <Clip src={V.K} from={4} dim={0.2} />
      <AbsoluteFill style={{ background: 'linear-gradient(270deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.7) 50%, rgba(11,37,69,0) 85%)' }} />
      <div style={{ position: 'absolute', right: 120, top: 200, width: 820 }}>
        <Pop at={B[5] + 0.2}><span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mintSoft, lineHeight: 1.2 }}>Стало трудно делать<br />привычные вещи?</span></Pop>
        <Pop at={wt('спросите') - 0.3} style={{ marginTop: 40 }}><span style={{ ...font, fontWeight: 800, fontSize: 76, color: C.sun, lineHeight: 1.08 }}>Спросите лечащего врача о реабилитации</span></Pop>
      </div>
    </At>
    <At from={tNext} to={END} fadeOut={0.6}><NextCard at={tNext} title={<>Путь пациента: <span style={{ color: C.mint }}>три этапа</span></>} /></At>
  </>
);

const Music = () => {
  const f = useCurrentFrame();
  return <Audio src={staticFile('episodes/02/music.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />;
};

export const Ep02: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Scene1 />
    <Scene2 />
    <Scene3 />
    <Scene4 />
    <Scene5 />
    <Scene6 />
    <Captions pages={captions.pages} />
    <Audio src={staticFile('episodes/02/voice.wav')} />
    <Music />
  </AbsoluteFill>
);
