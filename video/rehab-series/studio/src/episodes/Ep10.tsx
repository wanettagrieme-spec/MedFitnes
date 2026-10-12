import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import timings from '../../episodes/10-kak-popast/voice/timings.json';
import captionsJson from '../../episodes/10-kak-popast/voice/captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo, useAppearAt } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Frame, Gradient, Pop, TitleCard } from '../series/ui';
import { IconArrow, IconBuilding, IconDoc, IconDoctor, IconHeart, IconScreen } from '../series/icons';

// Выпуск 10. «Как попасть на реабилитацию и сколько это стоит» — 16:9, финал серии
// Бесплатно по ОМС при медицинских показаниях; из больницы — по направлению лечащего врача после оценки по ШРМ; из дома — через врача
// поликлиники; паспорт, полис, выписка; страховая медицинская организация; четыре мифа; «самое главное — мотивация» (владелица).
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const S = timings.scenes;
const END = timings.duration + 2;
const B = [0, ...S.slice(1).map(s => s.start), END];
export const EP10_DURATION = sec(END);

const P = {
  reception: 'stock/canva/C47-reception.png',
  docs: 'stock/canva/C48-documents.png',
  ward: 'stock/canva/C49-ward-referral.png',
  gp: 'stock/canva/C50-gp-office.png',
  call: 'stock/canva/C51-insurance-call.png',
  team: 'stock/canva/C52-team-goal.png',
  icu: 'stock/canva/C53-icu-early.png',
  dayHosp: 'stock/canva/C54-day-hospital-bikes.png',
  motivation: 'stock/canva/C55-motivation.png',
};
const MOSAIC = ['stock/canva/C1-tilt-table.png', 'stock/gamma/G7-parallel-bars.jpg', 'stock/canva/C9-group-session.png', 'stock/canva/C19-team-meeting.png',
  'stock/canva/C30-goal-target.png', 'stock/canva/C38-grandchildren.png', 'stock/canva/C45-team-family.png', 'stock/canva/C34-park-walk.png'];
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const ACC = C.sun;

const Circle: React.FC<{ Icon: IconT; color: string; size?: number; iconColor?: string }> = ({ Icon, color, size = 76, iconColor = C.navy }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={size * 0.6} color={iconColor} stroke={5} /></div>
);
const Step: React.FC<{ at: number; n: string; text: string; color: string; dark?: boolean }> = ({ at, n, text, color, dark }) => (
  <Pop at={at - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22 }}>
    <div style={{ width: 66, height: 66, borderRadius: 33, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ ...font, fontWeight: 800, fontSize: 32, color: C.navy }}>{n}</span></div>
    <span style={{ ...font, fontWeight: 800, fontSize: 40, lineHeight: 1.15, color: dark ? C.navy : C.white }}>{text}</span>
  </Pop>
);

// ── Сцена 1: крючок ────────────────────────────────────────────────────────
const tTitle = wt('разберем') - 0.3;
const Scene1 = () => (
  <>
    <At from={0} to={tTitle} fadeIn={0} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.teal} angle={150} />
      <Pop at={0.2} style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center' }}><span style={{ ...font, fontWeight: 800, fontSize: 80 }}>Последний выпуск <span style={{ color: C.sun }}>серии</span></span></Pop>
    </At>
    <At from={tTitle} to={B[1]} fadeIn={0.3}>
      <Photo src={P.reception} focus="center" zoom={0.04} />
      <TitleCard at={tTitle} episode={10} line1="Как попасть на реабилитацию" line2="и сколько это стоит" size={76} sub="Куда обратиться · что взять с собой · 4 мифа" />
    </At>
  </>
);

// ── Сцена 2: сколько стоит ────────────────────────────────────────────────
const Scene2 = () => (
  <At from={B[1]} to={B[2]}>
    <Gradient from={C.ink} to={C.navy} angle={150} />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 140 }}>
      <Pop at={wt('медицинских') - 0.3}><span style={{ ...font, fontWeight: 700, fontSize: 44, color: C.mintSoft }}>при медицинских показаниях</span></Pop>
      <Pop at={wt('бесплатно') - 0.3} style={{ marginTop: 20 }}><span style={{ ...font, fontWeight: 800, fontSize: 150, color: C.sun, lineHeight: 1 }}>бесплатно</span></Pop>
      <Pop at={wt('полису') - 0.3} style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 190, height: 116, borderRadius: 16, background: 'linear-gradient(135deg, #8ecae6, #219ebc)', boxShadow: '0 12px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ ...font, fontWeight: 800, fontSize: 44, color: C.white }}>ОМС</span></div>
        <span style={{ ...font, fontWeight: 800, fontSize: 60 }}>по полису ОМС</span>
      </Pop>
    </AbsoluteFill>
  </At>
);

// ── Сцена 3: если вы в больнице ───────────────────────────────────────────
const Scene3 = () => (
  <At from={B[2]} to={B[3]}>
    <Gradient from={C.navy} to={C.teal} angle={160} />
    <Frame x={80} y={130} w={920} h={600}><Photo src={P.ward} focus="center" /></Frame>
    <div style={{ position: 'absolute', left: 1060, top: 130, width: 790 }}>
      <Pop at={B[2] + 0.1} style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Circle Icon={IconBuilding} color={C.sky} size={80} /><span style={{ ...font, fontWeight: 800, fontSize: 52 }}>Если вы в больнице</span></Pop>
      <Step at={wt('первый')} n="1" text="реабилитация начинается там же — 1 этап" color={C.sky} />
      <Step at={wt('шкале')} n="2" text="перед выпиской — оценка по шкале маршрутизации" color={C.mint} />
      <Step at={wt('лечащий')} n="3" text="лечащий врач направляет на следующий этап" color={ACC} />
    </div>
  </At>
);

// ── Сцена 4: если вы уже дома ─────────────────────────────────────────────
const Scene4 = () => (
  <At from={B[3]} to={B[4]}>
    <AbsoluteFill style={{ background: C.paper }} />
    <Frame x={80} y={130} w={920} h={600}><Photo src={P.gp} focus="center" /></Frame>
    <div style={{ position: 'absolute', left: 1060, top: 130, width: 790 }}>
      <Pop at={B[3] + 0.1}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 52 }}>Если вы уже дома — <span style={{ color: C.teal }}>в поликлинику</span></span></Pop>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28, alignItems: 'flex-start' }}>
        {([['терапевту', 'терапевт'], ['общей', 'врач общей практики'], ['врачу-специалисту', 'врач-специалист']] as [string, string][]).map(([w, t]) => (
          <Pop key={w} at={wt(w) - 0.3} dy={12} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Circle Icon={IconDoctor} color={C.mint} size={62} />
            <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 40 }}>{t}</span>
          </Pop>
        ))}
      </div>
      <Pop at={wt('оценит') - 0.3} style={{ marginTop: 30 }}>
        <span style={{ ...font, fontWeight: 800, fontSize: 34, color: C.navy, background: C.sun, padding: '12px 24px', borderRadius: 22, display: 'inline-block', lineHeight: 1.25 }}>врач оценит, нужна ли реабилитация и где её пройти</span>
      </Pop>
    </div>
  </At>
);

// ── Сцена 5: что взять с собой ────────────────────────────────────────────
const DocCard: React.FC<{ at: number; title: string; color: string }> = ({ at, title, color }) => {
  const a = useAppearAt(at - 0.3);
  return (
    <div style={{ width: 250, height: 300, borderRadius: 24, background: C.white, boxShadow: '0 18px 44px rgba(19,41,61,0.16)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: a, transform: `translateY(${(1 - a) * 40}px) rotate(${(1 - a) * -6}deg)` }}>
      <Circle Icon={IconDoc} color={color} size={110} iconColor={C.white} />
      <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 34, textAlign: 'center', lineHeight: 1.1 }}>{title}</span>
    </div>
  );
};
const Scene5 = () => (
  <At from={B[4]} to={B[5]}>
    <AbsoluteFill style={{ background: C.sand }} />
    <Frame x={80} y={130} w={880} h={580}><Photo src={P.docs} focus="center" /></Frame>
    <div style={{ position: 'absolute', left: 1020, top: 110, width: 830 }}>
      <Pop at={B[4] + 0.1}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 52 }}>Что взять с собой</span></Pop>
      <div style={{ display: 'flex', gap: 22, marginTop: 30 }}>
        <DocCard at={wt('паспорт')} title="паспорт" color={C.coral} />
        <DocCard at={wt('полис')} title="полис ОМС" color={C.skyDeep} />
        <DocCard at={wt('выписку')} title="выписка из больницы" color={C.teal} />
      </div>
      <Pop at={wt('рекомендации') - 0.3} style={{ marginTop: 26 }}><span style={{ ...font, color: C.textDark, fontWeight: 700, fontSize: 32 }}>в выписке — рекомендации по реабилитации</span></Pop>
    </div>
  </At>
);

// ── Сцена 6: если что-то непонятно ────────────────────────────────────────
const Scene6 = () => (
  <At from={B[5]} to={B[6]}>
    <Gradient from={C.navy} to={C.ink} angle={160} />
    <Frame x={80} y={130} w={920} h={600}><Photo src={P.call} focus="center" /></Frame>
    <div style={{ position: 'absolute', left: 1060, top: 140, width: 790 }}>
      <Pop at={B[5] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 52 }}>Если что-то <span style={{ color: C.sun }}>непонятно</span></span></Pop>
      <Pop at={wt('спросите') - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 30 }}><Circle Icon={IconDoctor} color={C.mint} size={80} /><span style={{ ...font, fontWeight: 800, fontSize: 40 }}>спросите лечащего врача</span></Pop>
      <Pop at={wt('страховая') - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 24 }}><Circle Icon={IconScreen} color={C.sky} size={80} /><span style={{ ...font, fontWeight: 800, fontSize: 40, lineHeight: 1.15 }}>страховая медицинская организация</span></Pop>
      <Pop at={wt('телефон') - 0.3} style={{ marginTop: 26, marginLeft: 98 }}><Chip size={34}>телефон — на полисе</Chip></Pop>
    </div>
  </At>
);

// ── Сцены 7–10: мифы ──────────────────────────────────────────────────────
const Myth: React.FC<{ from: number; to: number; n: number; myth: string; tTruth: number; truth: React.ReactNode; extra?: React.ReactNode; src?: string }> = ({ from, to, n, myth, tTruth, truth, extra, src }) => {
  const s = useAppearAt(tTruth);
  return (
    <At from={from} to={to}>
      <AbsoluteFill style={{ background: C.paper }} />
      <div style={{ position: 'absolute', left: 90, top: 80, width: src ? 860 : 1740 }}>
        <Pop at={from + 0.1}><Chip bg={C.coral} color={C.white} size={34}>Миф {n}</Chip></Pop>
        <Pop at={from + 0.3} style={{ marginTop: 18, position: 'relative', display: 'inline-block' }}>
          <span style={{ ...font, color: C.textMuted, fontWeight: 800, fontSize: 50, lineHeight: 1.12, textDecoration: s > 0.5 ? 'line-through' : 'none', textDecorationColor: C.coral, textDecorationThickness: 6 }}>«{myth}»</span>
        </Pop>
        <Pop at={tTruth + 0.2} style={{ marginTop: 34 }}><Chip bg={C.teal} color={C.white} size={34}>На самом деле</Chip></Pop>
        <Pop at={tTruth + 0.4} style={{ marginTop: 16 }}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 52, lineHeight: 1.12 }}>{truth}</span></Pop>
        {extra}
      </div>
      {src && <At from={tTruth} to={to} fadeIn={0.4}><Frame x={1010} y={150} w={820} h={560}><Photo src={src} focus="center" /></Frame></At>}
    </At>
  );
};
const Scene7 = () => (
  <Myth from={B[6]} to={B[7]} n={1} myth="реабилитация — это массаж и физиотерапия" tTruth={wt('самом') - 0.3} src={P.team}
    truth={<>работа <span style={{ color: C.teal }}>целой команды</span> ради вашей цели</>}
    extra={<Pop at={wt('физиотерапия', 2) - 0.3} style={{ marginTop: 22 }}><Chip size={32}>физиотерапия — один из методов, по показаниям</Chip></Pop>} />
);
const Scene8 = () => (
  <Myth from={B[7]} to={B[8]} n={2} myth="подождём, пока станет лучше, и тогда начнём" tTruth={wt('самом', 2) - 0.3} src={P.icu}
    truth={<>начинают <span style={{ color: C.teal }}>как можно раньше</span></>}
    extra={<Pop at={wt('реанимации') - 0.3} style={{ marginTop: 22 }}><Chip size={32}>иногда — ещё в реанимации</Chip></Pop>} />
);
const CHAIN: [string, string, string][] = [['поставленной', 'курс — до цели', C.sky], ['следующий', 'следующий этап', C.mint], ['дома', 'самостоятельно дома', C.sun]];
const Scene9 = () => (
  <Myth from={B[8]} to={B[9]} n={3} myth="чем больше курсов подряд, тем лучше" tTruth={wt('самом', 3) - 0.3}
    truth={<>курс идёт <span style={{ color: C.teal }}>до поставленной цели</span></>}
    extra={
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 40 }}>
        {CHAIN.map(([w, t, color], i) => (
          <React.Fragment key={w}>
            <Pop at={wt(w, w === 'следующий' ? 2 : w === 'дома' ? 2 : 1) - 0.3} dy={12}><span style={{ ...font, fontWeight: 800, fontSize: 40, color: C.navy, background: color, padding: '18px 32px', borderRadius: 40, display: 'inline-block' }}>{t}</span></Pop>
            {i < 2 && <Pop at={wt(CHAIN[i + 1][0], CHAIN[i + 1][0] === 'поставленной' ? 1 : 2) - 0.5} dy={0}><IconArrow size={56} color={C.textMuted} stroke={5} /></Pop>}
          </React.Fragment>
        ))}
      </div>
    } />
);
const Scene10 = () => (
  <Myth from={B[9]} to={B[10]} n={4} myth="третий этап — это уже не настоящая реабилитация" tTruth={wt('самом', 4) - 0.3} src={P.dayHosp}
    truth={<>это шаг <span style={{ color: C.teal }}>ближе к обычной жизни</span></>}
    extra={<Pop at={wt('менее') - 0.3} style={{ marginTop: 22 }}><Chip size={32}>и он не менее важен, чем стационар</Chip></Pop>} />
);

// ── Сцена 11: мотивация и финал серии ─────────────────────────────────────
const tMosaic = wt('пересматривайте') - 0.4;
const Scene11 = () => {
  const f = useCurrentFrame();
  return (
    <>
      <At from={B[10]} to={tMosaic} fadeOut={0.4}>
        <Photo src={P.motivation} focus="center" zoom={0.06} />
        <AbsoluteFill style={{ background: 'linear-gradient(270deg, rgba(11,37,69,0.9) 0%, rgba(11,37,69,0.7) 40%, rgba(11,37,69,0) 70%)' }} />
        <div style={{ position: 'absolute', right: 110, top: 230, width: 780 }}>
          <Pop at={wt('самое') - 0.3}><span style={{ ...font, fontWeight: 700, fontSize: 48, color: C.mintSoft }}>И самое главное —</span></Pop>
          <Pop at={wt('мотивация') - 0.3} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 96, color: C.sun, lineHeight: 1 }}>ваша мотивация</span></Pop>
          <Pop at={wt('без') - 0.3} style={{ marginTop: 30 }}><span style={{ ...font, fontWeight: 800, fontSize: 40, lineHeight: 1.2 }}>без вашего желания восстановиться всё остальное теряет смысл</span></Pop>
        </div>
      </At>
      <At from={tMosaic} to={END} fadeIn={0.4} fadeOut={1}>
        <AbsoluteFill style={{ background: C.navy }} />
        <div style={{ position: 'absolute', left: 52, top: 52, width: 1816, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {MOSAIC.map((src, i) => {
            const a = interpolate(f, [sec(tMosaic + i * 0.15), sec(tMosaic + i * 0.15 + 0.5)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return <div key={src} style={{ width: 442, height: 480, borderRadius: 20, overflow: 'hidden', position: 'relative', opacity: 0.55 * a }}><Photo src={src} focus="center" zoom={0.06} /></div>;
          })}
        </div>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(11,37,69,0.85) 0%, rgba(11,37,69,0.55) 60%, rgba(11,37,69,0.2) 100%)' }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 120, textAlign: 'center' }}>
          <Pop at={tMosaic + 0.4}><Chip size={34}>Серия о медицинской реабилитации · 10 выпусков</Chip></Pop>
          <Pop at={wt('реабилитация', 6) - 0.3} style={{ marginTop: 26 }}><span style={{ ...font, fontWeight: 800, fontSize: 76, lineHeight: 1.1 }}>Реабилитация — <span style={{ color: C.mint }}>путь к обычной жизни</span></span></Pop>
          <Pop at={wt('вместе') - 0.3} style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
            <Circle Icon={IconHeart} color={C.coral} size={70} iconColor={C.white} />
            <span style={{ ...font, fontWeight: 800, fontSize: 52, color: C.sun }}>и пройти его можно вместе</span>
          </Pop>
        </AbsoluteFill>
      </At>
    </>
  );
};

const Music = () => {
  const f = useCurrentFrame();
  return <Audio src={staticFile('episodes/10/music.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' }) * interpolate(f, [sec(END - 2), sec(END)], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />;
};

export const Ep10: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Scene1 />
    <Scene2 />
    <Scene3 />
    <Scene4 />
    <Scene5 />
    <Scene6 />
    <Scene7 />
    <Scene8 />
    <Scene9 />
    <Scene10 />
    <Scene11 />
    <Captions pages={captions.pages} />
    <Audio src={staticFile('episodes/10/voice.wav')} />
    <Music />
  </AbsoluteFill>
);

