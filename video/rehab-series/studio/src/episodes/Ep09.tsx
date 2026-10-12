import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import timings from '../../episodes/09-ot-vas/voice/timings.json';
import captionsJson from '../../episodes/09-ot-vas/voice/captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Frame, Gradient, NextCard, Pop, TitleCard } from '../series/ui';
import { IconArrow, IconBrain, IconCheck, IconFamily, IconHeart, IconHome, IconShirt, IconSpeech, IconWalk } from '../series/icons';

// Выпуск 9. «Что зависит от вас и ваших близких» — 16:9
// Мотивация → занятия и задания → разговор с командой → близкие помогают правильно (без гиперопеки) → обучение близких
// → безопасный дом → поддержка и забота о себе → общая работа. Все пункты одобрены специалистом 13.10.2026.
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const S = timings.scenes;
const END = timings.duration + 1.5;
const B = [0, S[1].start, S[2].start, S[3].start, S[4].start, S[5].start, S[6].start, S[7].start, S[8].start, END];
export const EP09_DURATION = sec(END);

const P = {
  homeEx: 'stock/canva/C37-home-exercise-daughter.png',
  grand: 'stock/canva/C38-grandchildren.png',
  garden: 'stock/canva/C39-garden.png',
  talk: 'stock/canva/C40-talk-doctor.png',
  jacket: 'stock/canva/C41-jacket-himself.png',
  training: 'stock/canva/C42-training-relatives.png',
  corridor: 'stock/canva/C43-safe-corridor.png',
  psych: 'stock/canva/C44-psychologist-relative.png',
  together: 'stock/canva/C45-team-family.png',
  band: 'stock/canva/C46-band-exercise.png',
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const ACC = C.mint;

const Circle: React.FC<{ Icon: IconT; color: string; size?: number; iconColor?: string }> = ({ Icon, color, size = 76, iconColor = C.navy }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={size * 0.6} color={iconColor} stroke={5} /></div>
);
const Row: React.FC<{ at: number; Icon: IconT; color: string; title: string; text?: string; dark?: boolean }> = ({ at, Icon, color, title, text, dark }) => (
  <Pop at={at - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 22 }}>
    <Circle Icon={Icon} color={color} size={80} />
    <div>
      <div style={{ ...font, fontWeight: 800, fontSize: 40, lineHeight: 1.1, color: dark ? C.navy : C.white }}>{title}</div>
      {text && <div style={{ ...font, fontWeight: 600, fontSize: 30, color: dark ? C.textMuted : C.mintSoft, marginTop: 4 }}>{text}</div>}
    </div>
  </Pop>
);

// ── Сцена 1: крючок ────────────────────────────────────────────────────────
const tTitle = wt('зависит') - 0.4;
const Scene1 = () => (
  <>
    <At from={0} to={tTitle} fadeIn={0} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.teal} angle={150} />
      <Frame x={860} y={110} w={980} h={640}><Photo src={P.homeEx} focus="center" /></Frame>
      <div style={{ position: 'absolute', left: 110, top: 260, width: 700 }}>
        <Pop at={0.3}><span style={{ ...font, fontWeight: 700, fontSize: 48, color: C.mintSoft, lineHeight: 1.15 }}>Команда специалистов делает очень многое</span></Pop>
        <Pop at={wt('успех') - 0.3} style={{ marginTop: 22 }}><span style={{ ...font, fontWeight: 800, fontSize: 80, color: C.sun }}>но…</span></Pop>
      </div>
    </At>
    <At from={tTitle} to={B[1]} fadeIn={0.3}>
      <Photo src={P.homeEx} focus="center" zoom={0.04} />
      <TitleCard at={tTitle} episode={9} line1="Что зависит" line2="от вас и ваших близких" size={88} sub="Ради чего · что делаете вы · как помогать правильно" />
    </At>
  </>
);

// ── Сцена 2: ради чего ────────────────────────────────────────────────────
const tGrand = wt('например') - 0.3, tGarden = wt('или') - 0.3, tGoal = wt('расскажите') - 0.3;
const Scene2 = () => (
  <At from={B[1]} to={B[2]}>
    <Gradient from={C.navy} to={C.ink} angle={160} />
    <div style={{ position: 'absolute', left: 110, top: 150, width: 820 }}>
      <Pop at={B[1] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 60, lineHeight: 1.08 }}>Важнее всего — <span style={{ color: C.sun }}>ваше желание</span> восстановиться</span></Pop>
      <Pop at={wt('подумайте') - 0.3} style={{ marginTop: 34 }}><span style={{ ...font, fontWeight: 800, fontSize: 72, color: ACC }}>Ради чего?</span></Pop>
      <Pop at={tGrand + 0.2} style={{ marginTop: 20 }}><Chip bg="rgba(255,255,255,0.14)" color={C.white} size={38}>гулять с внуками</Chip></Pop>
      <Pop at={tGarden + 0.2} style={{ marginTop: 14 }}><Chip bg="rgba(255,255,255,0.14)" color={C.white} size={38}>вернуться к любимому делу</Chip></Pop>
      <Pop at={tGoal} style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 16 }}>
        <IconArrow size={56} color={C.sun} stroke={5} />
        <span style={{ ...font, fontWeight: 800, fontSize: 40, color: C.navy, background: C.sun, padding: '10px 24px', borderRadius: 24 }}>расскажите команде — это ваша цель</span>
      </Pop>
    </div>
    <At from={B[1]} to={tGarden} fadeIn={0.4} fadeOut={0.3}>
      <Frame x={1000} y={150} w={820} h={560}><Photo src={P.grand} focus="center" /></Frame>
    </At>
    <At from={tGarden} to={B[2]} fadeIn={0.3}>
      <Frame x={1000} y={150} w={820} h={560}><Photo src={P.garden} focus="center" /></Frame>
    </At>
  </At>
);

// ── Сцена 3: что делаете вы ───────────────────────────────────────────────
const Scene3 = () => (
  <At from={B[2]} to={B[3]}>
    <AbsoluteFill style={{ background: C.paper }} />
    <Frame x={80} y={130} w={1000} h={600}><Photo src={P.band} focus="center" /></Frame>
    <div style={{ position: 'absolute', left: 1130, top: 120, width: 720 }}>
      <Pop at={B[2] + 0.1}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 52 }}>Что делаете <span style={{ color: C.teal }}>вы</span></span></Pop>
      <Row at={wt('приходите')} Icon={IconCheck} color={C.sky} title="все занятия" dark />
      <Row at={wt('выполняйте')} Icon={IconCheck} color={C.sun} title="задания между занятиями" dark />
      <Row at={wt('делайте')} Icon={IconCheck} color={ACC} title="как можно больше — сами" text="даже если пока медленно" dark />
    </div>
    <Pop at={wt('каждый') - 0.3} style={{ position: 'absolute', left: 1130, top: 640 }}>
      <span style={{ ...font, fontWeight: 800, fontSize: 36, color: C.white, background: C.teal, padding: '12px 24px', borderRadius: 22, display: 'inline-block' }}>сам — значит, навык закрепляется</span>
    </Pop>
  </At>
);

// ── Сцена 4: говорите с командой ──────────────────────────────────────────
const Bubble: React.FC<{ at: number; text: string; color: string }> = ({ at, text, color }) => (
  <Pop at={at - 0.25} dy={16} style={{ position: 'relative', display: 'inline-block', marginTop: 16, marginRight: 14 }}>
    <span style={{ ...font, fontWeight: 800, fontSize: 40, color: C.navy, background: color, padding: '14px 30px', borderRadius: 34, display: 'inline-block' }}>{text}</span>
  </Pop>
);
const Scene4 = () => (
  <At from={B[3]} to={B[4]}>
    <Gradient from={C.ink} to={C.navy} angle={150} />
    <Frame x={80} y={130} w={1000} h={600}><Photo src={P.talk} focus="center" /></Frame>
    <div style={{ position: 'absolute', left: 1140, top: 130, width: 700 }}>
      <Pop at={B[3] + 0.1} style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Circle Icon={IconSpeech} color={C.sun} size={80} /><span style={{ ...font, fontWeight: 800, fontSize: 50, lineHeight: 1.08 }}>Рассказывайте о самочувствии</span></Pop>
      <div style={{ marginTop: 20 }}>
        <Bubble at={wt('боли')} text="боль" color={C.coral} />
        <Bubble at={wt('усталости')} text="усталость" color={C.sky} />
        <Bubble at={wt('головокружении')} text="головокружение" color={C.sun} />
      </div>
      <Pop at={wt('непонятно') - 0.3} style={{ marginTop: 34 }}><span style={{ ...font, fontWeight: 800, fontSize: 38, color: ACC }}>непонятно или тревожит? — спрашивайте</span></Pop>
    </div>
  </At>
);

// ── Сцена 5: близкие — помогать правильно ─────────────────────────────────
const Scene5 = () => (
  <At from={B[4]} to={B[5]}>
    <AbsoluteFill style={{ background: C.paper }} />
    <Frame x={80} y={130} w={1000} h={600}><Photo src={P.jacket} focus="center" /></Frame>
    <div style={{ position: 'absolute', left: 1130, top: 120, width: 720 }}>
      <Pop at={B[4] + 0.1} style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Circle Icon={IconFamily} color={C.sky} size={80} /><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>Близкие — тоже часть команды</span></Pop>
      <Pop at={wt('правильно') - 0.3} style={{ marginTop: 26 }}><span style={{ ...font, color: C.teal, fontWeight: 800, fontSize: 52 }}>помогать — правильно</span></Pop>
      <Pop at={wt('делайте', 2) - 0.3} style={{ marginTop: 26 }}>
        <span style={{ ...font, fontWeight: 800, fontSize: 38, color: C.navy, background: C.sun, padding: '14px 26px', borderRadius: 24, display: 'inline-block', lineHeight: 1.25 }}>не делайте за человека то, что он может сам</span>
      </Pop>
      <Pop at={wt('слишком') - 0.3} style={{ marginTop: 20 }}><Chip bg={C.coral} color={C.white} size={34}>слишком сильная опека мешает восстановлению</Chip></Pop>
    </div>
  </At>
);

// ── Сцена 6: научитесь у команды ──────────────────────────────────────────
const Scene6 = () => (
  <At from={B[5]} to={B[6]}>
    <Gradient from={C.navy} to={C.teal} angle={160} />
    <Frame x={80} y={130} w={900} h={600}><Photo src={P.training} focus="center" /></Frame>
    <div style={{ position: 'absolute', left: 1030, top: 110, width: 820 }}>
      <Pop at={B[5] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 50, lineHeight: 1.1 }}>Попросите команду <span style={{ color: C.sun }}>научить вас</span></span></Pop>
      <Row at={wt('инструктор')} Icon={IconWalk} color={C.mint} title="Инструктор ЛФК" text="как безопасно помочь встать и пройти" />
      <Row at={wt('эрготерапевт')} Icon={IconShirt} color={C.sky} title="Эрготерапевт" text="как приспособить дом" />
      <Row at={wt('логопед')} Icon={IconSpeech} color={C.mintSoft} title="Логопед" text="как помогать с едой и как общаться" />
    </div>
  </At>
);

// ── Сцена 7: безопасный дом ───────────────────────────────────────────────
const HomeItem: React.FC<{ at: number; text: string }> = ({ at, text }) => (
  <Pop at={at - 0.3} dy={12} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
    <div style={{ width: 54, height: 54, borderRadius: 27, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconCheck size={32} color={C.white} stroke={7} /></div>
    <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 40 }}>{text}</span>
  </Pop>
);
const Scene7 = () => (
  <At from={B[6]} to={B[7]}>
    <AbsoluteFill style={{ background: C.sand }} />
    <div style={{ position: 'absolute', left: 110, top: 140, width: 760 }}>
      <Pop at={B[6] + 0.1} style={{ display: 'flex', alignItems: 'center', gap: 18 }}><Circle Icon={IconHome} color={C.sun} size={86} /><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 56 }}>Безопасный дом</span></Pop>
      <div style={{ marginTop: 20 }}>
        <HomeItem at={wt('уберите')} text="свободный путь" />
        <HomeItem at={wt('скользкие')} text="без скользких ковриков" />
        <HomeItem at={wt('поручни')} text="поручни" />
        <HomeItem at={wt('освещение')} text="хорошее освещение" />
      </div>
    </div>
    <Frame x={940} y={130} w={900} h={600}><Photo src={P.corridor} focus="center" /></Frame>
  </At>
);

// ── Сцена 8: поддержка и забота о себе ────────────────────────────────────
const tSelf = wt('берегите') - 0.3;
const Scene8 = () => (
  <>
    <At from={B[7]} to={tSelf} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.teal} angle={150} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 160 }}>
        <Pop at={B[7] + 0.1}><Circle Icon={IconHeart} color={C.coral} size={200} iconColor={C.white} /></Pop>
        <Pop at={wt('радуйтесь') - 0.3} style={{ marginTop: 30, textAlign: 'center' }}><span style={{ ...font, fontWeight: 800, fontSize: 64 }}>Радуйтесь вместе <span style={{ color: C.sun }}>каждой маленькой победе</span></span></Pop>
      </AbsoluteFill>
    </At>
    <At from={tSelf} to={B[8]} fadeIn={0.3}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Frame x={80} y={130} w={1000} h={600}><Photo src={P.psych} focus="center" /></Frame>
      <div style={{ position: 'absolute', left: 1130, top: 150, width: 720 }}>
        <Pop at={tSelf + 0.1}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 60 }}>Берегите <span style={{ color: C.coral }}>и себя</span></span></Pop>
        <Pop at={wt('уход') - 0.3} style={{ marginTop: 22 }}><span style={{ ...font, color: C.textDark, fontWeight: 700, fontSize: 38, lineHeight: 1.2 }}>уход за близким — это тоже нагрузка</span></Pop>
        <Pop at={wt('клинический') - 0.3} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 30 }}>
          <Circle Icon={IconBrain} color={C.coral} size={76} iconColor={C.white} />
          <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 36, lineHeight: 1.2 }}>клинический психолог поддержит и родственников</span>
        </Pop>
      </div>
    </At>
  </>
);

// ── Сцена 9: общая работа и анонс ─────────────────────────────────────────
const tNext = wt('последнем') - 0.5;
const Scene9 = () => (
  <>
    <At from={B[8]} to={tNext} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <Frame x={80} y={130} w={1000} h={600}><Photo src={P.together} focus="center" /></Frame>
      <div style={{ position: 'absolute', left: 1140, top: 170, width: 700 }}>
        <Pop at={B[8] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 64, lineHeight: 1.05 }}>Реабилитация — <span style={{ color: C.sun }}>общая работа</span></span></Pop>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 34 }}>
          <Pop at={wt('ваша', 2) - 0.3}><Chip size={38}>ваша</Chip></Pop>
          <Pop at={wt('близких', 2) - 0.3}><Chip bg={C.sky} color={C.navy} size={38}>ваших близких</Chip></Pop>
          <Pop at={wt('команды', 2) - 0.3}><Chip bg={ACC} color={C.navy} size={38}>команды специалистов</Chip></Pop>
        </div>
      </div>
    </At>
    <At from={tNext} to={END} fadeOut={0.6}><NextCard at={tNext} title={<>Как попасть на реабилитацию<br /><span style={{ color: C.mint }}>и сколько это стоит</span></>} /></At>
  </>
);

const Music = () => {
  const f = useCurrentFrame();
  return <Audio src={staticFile('episodes/09/music.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />;
};

export const Ep09: React.FC = () => (
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
    <Captions pages={captions.pages} />
    <Audio src={staticFile('episodes/09/voice.wav')} />
    <Music />
  </AbsoluteFill>
);
