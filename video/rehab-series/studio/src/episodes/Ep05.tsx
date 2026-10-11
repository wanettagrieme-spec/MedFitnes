import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import timings from '../../episodes/05-vtoroj-etap/voice/timings.json';
import captionsJson from '../../episodes/05-vtoroj-etap/voice/captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo, useAppearAt } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Frame, Gradient, NextCard, Pop, TitleCard } from '../series/ui';
import {
  IconArrow, IconBone, IconBrain, IconCheck, IconClock, IconDoc, IconDoctor, IconGauge, IconHeart, IconNurse, IconShirt, IconSpeech, IconWalk,
} from '../series/icons';

// Выпуск 5. «Второй этап: отделение медицинской реабилитации» — 16:9
// Правки специалиста: на II этапе занятия только индивидуальные; МДРК — минимум 3 заседания (3 протокола); выписка = реабилитационный эпикриз = 3-е заседание.
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const S = timings.scenes;
const END = timings.duration + 1.5;
const B = [0, S[1].start, S[2].start, S[3].start, S[4].start, S[5].start, S[6].start, S[7].start, END];
export const EP05_DURATION = sec(END);

const P = {
  corridor: 'stock/gamma/G4-rehab-corridor.jpg',
  meeting: 'stock/gamma/G5-mdrk-meeting.jpg',
  goal: 'stock/gamma/G6-goal-setting.jpg',
  bars: 'stock/gamma/G7-parallel-bars.jpg',
  ergo: 'stock/gamma/G8-ergotherapy.jpg',
  speech: 'stock/gamma/G9-speech-session.jpg',
  homework: 'stock/gamma/G10-homework.jpg',
  family: 'stock/gamma/G11-family-transfer.jpg',
  discharge: 'stock/gamma/G12-discharge.jpg',
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const ST2 = C.coral;

const Shade: React.FC<{ side?: 'left' | 'right'; k?: number }> = ({ side = 'left', k = 0.92 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${side === 'left' ? 90 : 270}deg, rgba(11,37,69,${k}) 0%, rgba(11,37,69,${k * 0.75}) 42%, rgba(11,37,69,0) 78%)` }} />
);
const StageBar: React.FC<{ at: number }> = ({ at }) => (
  <Pop at={at} dy={-20} style={{ position: 'absolute', right: 80, top: 44, display: 'flex', gap: 12 }}>
    {[1, 2, 3].map(n => (
      <span key={n} style={{ ...font, fontWeight: 800, fontSize: 28, padding: '8px 22px', borderRadius: 30, background: n === 2 ? ST2 : 'rgba(19,41,61,0.45)', color: n === 2 ? C.white : 'rgba(255,255,255,0.7)', transform: n === 2 ? 'scale(1.1)' : 'none' }}>{n} этап</span>
    ))}
  </Pop>
);
const Circle: React.FC<{ Icon: IconT; color: string; size?: number; iconColor?: string }> = ({ Icon, color, size = 76, iconColor = C.navy }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={size * 0.6} color={iconColor} stroke={5} /></div>
);

// ── Сцена 1: крючок ────────────────────────────────────────────────────────
const tTitle = wt('куда') - 0.4;
const Scene1 = () => (
  <>
    <At from={0} to={tTitle} fadeIn={0} fadeOut={0.4}>
      <Photo src={P.corridor} focus="40% center" />
      <Shade side="right" />
      <div style={{ position: 'absolute', right: 110, top: 240, width: 860 }}>
        <Pop at={0.3}><span style={{ ...font, fontWeight: 700, fontSize: 48, color: C.mintSoft }}>После реанимации и профильного отделения</span></Pop>
        <Pop at={wt('следующий') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 76, lineHeight: 1.06 }}>следующий шаг — <span style={{ color: C.sun }}>второй этап</span></span></Pop>
      </div>
    </At>
    <At from={tTitle} to={B[1]} fadeIn={0.4}>
      <Photo src={P.corridor} focus="40% center" zoom={0.04} />
      <TitleCard at={tTitle} episode={5} line1="Второй этап:" line2="отделение медицинской реабилитации" size={72} sub="Куда направляют · как устроен день · что зависит от вас" />
    </At>
  </>
);

// ── Сцена 2: три профиля, кто направляет, норматив ────────────────────────
const tWho = wt('направляет') - 0.4, tNorm = wt('занятия') - 0.4;
const Profile: React.FC<{ x: number; at: number; n: number; title: string; color: string; Icon: IconT }> = ({ x, at, n, title, color, Icon }) => {
  const a = useAppearAt(at);
  return (
    <div style={{ position: 'absolute', left: x, top: 250, width: 540, height: 500, borderRadius: 34, background: C.white, boxShadow: '0 24px 60px rgba(19,41,61,0.12)', padding: '40px 40px', boxSizing: 'border-box', opacity: a, transform: `translateY(${(1 - a) * 50}px)` }}>
      <Circle Icon={Icon} color={color} size={100} iconColor={C.white} />
      <div style={{ ...font, color, fontWeight: 800, fontSize: 30, marginTop: 24 }}>Профиль {n} · для пациентов</div>
      <div style={{ ...font, color: C.textDark, fontWeight: 800, fontSize: 41, marginTop: 10, lineHeight: 1.15 }}>{title}</div>
    </div>
  );
};
const Scene2 = () => (
  <>
    <At from={B[1]} to={tWho} fadeOut={0.3}>
      <AbsoluteFill style={{ background: C.sand }} />
      <Pop at={B[1] + 0.1} style={{ position: 'absolute', left: 120, top: 60 }}>
        <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 44 }}>Стационарное отделение медицинской реабилитации</span>
        <div style={{ ...font, color: C.textMuted, fontWeight: 600, fontSize: 30, marginTop: 6 }}>одного из трёх профилей — по нарушенным функциям (Порядок 788н)</div>
      </Pop>
      <Profile x={120} at={wt('центральной') - 0.4} n={1} color={C.skyDeep} Icon={IconBrain} title="с нарушением функций центральной нервной системы" />
      <Profile x={690} at={wt('периферической') - 0.4} n={2} color={C.coral} Icon={IconBone} title="с нарушением функций периферической нервной системы и костно-мышечной системы" />
      <Profile x={1260} at={wt('соматическими') - 0.4} n={3} color={C.teal} Icon={IconHeart} title="с соматическими заболеваниями" />
      <StageBar at={B[1]} />
    </At>
    <At from={tWho} to={tNorm} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <StageBar at={tWho} />
      <div style={{ position: 'absolute', left: 160, top: 200, width: 1600 }}>
        <Pop at={tWho + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 70, color: C.sun }}>Кто направляет</span></Pop>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 40 }}>
          {([['лечащий', 'лечащий врач первого этапа'], ['терапевт', 'врач-терапевт'], ['общей', 'врач общей практики'], ['врач-специалист', 'врач-специалист']] as [string, string][]).map(([w, t]) => (
            <Pop key={w} at={wt(w) - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px', borderRadius: 50, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.18)' }}>
              <Circle Icon={IconDoctor} color={C.mint} size={60} />
              <span style={{ ...font, fontWeight: 800, fontSize: 42 }}>{t}</span>
            </Pop>
          ))}
        </div>
      </div>
    </At>
    <At from={tNorm} to={B[2]}>
      <Gradient from={C.ink} to={C.navy} angle={150} />
      <StageBar at={tNorm} />
      <div style={{ position: 'absolute', left: 170, top: 250, width: 380, height: 380, borderRadius: 190, background: ST2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 80px ${ST2}66` }}>
        <IconClock size={230} color={C.white} stroke={3.5} />
      </div>
      <div style={{ position: 'absolute', left: 660, top: 250, width: 1150 }}>
        <Pop at={tNorm + 0.15}><span style={{ ...font, fontWeight: 700, fontSize: 42, color: C.mintSoft }}>Занятия на 2 этапе</span></Pop>
        <Pop at={wt('ежедневно') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 72 }}>ежедневно</span></Pop>
        <Pop at={wt('менее') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 112, color: C.sun }}>не менее 3 часов</span></Pop>
        <Pop at={tNorm + 0.8} style={{ marginTop: 36 }}><span style={{ ...font, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,0.55)' }}>Порядок организации медицинской реабилитации взрослых (Приказ Минздрава № 788н)</span></Pop>
      </div>
    </At>
  </>
);

// ── Сцена 3: оценка, диагноз, цель ────────────────────────────────────────
const tGoal = wt('затем') - 0.4;
const Step: React.FC<{ at: number; n: number; text: string; color: string }> = ({ at, n, text, color }) => (
  <Pop at={at - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22 }}>
    <div style={{ width: 66, height: 66, borderRadius: 33, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ ...font, fontWeight: 800, fontSize: 38, color: C.navy }}>{n}</span></div>
    <span style={{ ...font, fontWeight: 800, fontSize: 42, lineHeight: 1.12 }}>{text}</span>
  </Pop>
);
const Scene3 = () => (
  <>
    <At from={B[2]} to={B[3]}>
      <Gradient from={C.navy} to={C.teal} />
      <Frame x={1000} y={130} w={820} h={600}><Photo src={P.goal} focus="60% center" /></Frame>
      <StageBar at={B[2]} />
      <div style={{ position: 'absolute', left: 110, top: 130, width: 850 }}>
        <Pop at={B[2] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 56, color: C.mint }}>В первые дни</span></Pop>
        <Step at={wt('оценивает')} n={1} color={C.sky} text="оценивают, что вам трудно делать" />
        <Step at={wt('реабилитационный')} n={2} color={C.sky} text="реабилитационный диагноз — по МКФ" />
        <Step at={wt('формулирует')} n={3} color={C.sun} text="цель — вместе с вами" />
        <At from={tGoal} to={B[3]} fadeIn={0.3}>
          <div style={{ position: 'absolute', left: 0, top: 430, display: 'flex', flexWrap: 'wrap', gap: 10, width: 860 }}>
            {([['конкретную', 'конкретная'], ['измеримую', 'измеримая'], ['достижимую', 'достижимая к выписке']] as [string, string][]).map(([w, t]) => (
              <Pop key={w} at={wt(w) - 0.3} dy={10}><Chip bg="rgba(255,255,255,0.16)" color={C.white} size={30}>{t}</Chip></Pop>
            ))}
          </div>
          <Pop at={wt('например') - 0.3} style={{ position: 'absolute', left: 0, top: 575, width: 860 }}>
            <span style={{ ...font, fontWeight: 800, fontSize: 40, color: C.navy, background: C.sun, padding: '14px 26px', borderRadius: 24, display: 'inline-block', lineHeight: 1.2 }}>Например: самостоятельно дойти до туалета с тростью</span>
          </Pop>
        </At>
      </div>
    </At>
  </>
);

// ── Сцена 4: ИПМР и команда ───────────────────────────────────────────────
const tTeam = wt('руководит') - 0.4;
const Role: React.FC<{ at: number; Icon: IconT; color: string; title: string; text: string }> = ({ at, Icon, color, title, text }) => {
  const a = useAppearAt(at - 0.3);
  return (
    <div style={{ width: 540, height: 230, borderRadius: 30, background: 'rgba(255,255,255,0.09)', border: '2px solid rgba(255,255,255,0.16)', padding: '26px 28px', boxSizing: 'border-box', display: 'flex', gap: 22, alignItems: 'flex-start', opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
      <Circle Icon={Icon} color={color} size={86} />
      <div>
        <div style={{ ...font, fontWeight: 800, fontSize: 34, lineHeight: 1.12 }}>{title}</div>
        <div style={{ ...font, fontWeight: 600, fontSize: 28, color: C.mintSoft, marginTop: 8, lineHeight: 1.2 }}>{text}</div>
      </div>
    </div>
  );
};
const Scene4 = () => (
  <>
    <At from={B[3]} to={tTeam} fadeOut={0.3}>
      <Gradient from={C.ink} to={C.navy} angle={150} />
      <StageBar at={B[3]} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 140 }}>
        <Pop at={B[3] + 0.2} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div style={{ width: 220, height: 220, borderRadius: 110, background: C.sun, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconDoc size={130} color={C.navy} stroke={4} /></div>
          <div>
            <div style={{ ...font, fontWeight: 800, fontSize: 120, color: C.sun, lineHeight: 1 }}>ИПМР</div>
            <div style={{ ...font, fontWeight: 800, fontSize: 52, marginTop: 10 }}>индивидуальный план<br />медицинской реабилитации</div>
          </div>
        </Pop>
      </AbsoluteFill>
    </At>
    <At from={tTeam} to={B[4]}>
      <Gradient from={C.navy} to={C.teal} angle={160} />
      <StageBar at={tTeam} />
      <Pop at={tTeam + 0.1} style={{ position: 'absolute', left: 120, top: 60 }}><span style={{ ...font, fontWeight: 800, fontSize: 54, color: C.mint }}>Команда отделения</span></Pop>
      <div style={{ position: 'absolute', left: 120, top: 160, width: 1680, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <Role at={wt('руководит')} Icon={IconDoctor} color={C.sun} title="Врач ФРМ" text="руководит командой и планом" />
        <Role at={wt('инструктор')} Icon={IconWalk} color={C.mint} title="Инструктор ЛФК" text="восстанавливает движение" />
        <Role at={wt('эрготерапевт')} Icon={IconShirt} color={C.sky} title="Эрготерапевт" text="бытовые навыки" />
        <Role at={wt('клинический')} Icon={IconBrain} color={C.coral} title="Клинический психолог" text="настроение, память, внимание" />
        <Role at={wt('клинический', 2)} Icon={IconSpeech} color={C.mintSoft} title="Клинический логопед" text="речь и глотание" />
        <Role at={wt('медицинская')} Icon={IconNurse} color={C.white} title="Медсестра по медреабилитации" text="закрепляет навыки каждый день" />
      </div>
    </At>
  </>
);

// ── Сцена 5: как проходит день ────────────────────────────────────────────
const tPair = wt('эрготерапевтом') - 0.4, tLoad = wt('нагрузку') - 0.4;
const Scene5 = () => (
  <>
    <At from={B[4]} to={tPair} fadeIn={0.3}>
      <Photo src={P.bars} focus="45% center" />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.8) 0%, rgba(11,37,69,0) 34%, rgba(11,37,69,0) 70%, rgba(11,37,69,0.5) 100%)' }} />
      <div style={{ position: 'absolute', left: 90, top: 60 }}>
        <Pop at={B[4] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 60 }}>Как проходит день?</span></Pop>
        <Pop at={wt('только') - 0.3} style={{ marginTop: 18 }}><Chip size={52}>Только индивидуально</Chip></Pop>
        <Pop at={wt('зале') - 0.3} style={{ marginTop: 18 }}><Chip bg="rgba(11,37,69,0.75)" color={C.white} size={36}>зал лечебной физкультуры · тренажёры</Chip></Pop>
      </div>
    </At>
    <At from={tPair} to={tLoad} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <Frame x={100} y={120} w={840} h={500}><Photo src={P.ergo} focus="50% 70%" /></Frame>
      <Frame x={980} y={120} w={840} h={500}><Photo src={P.speech} focus="55% center" /></Frame>
      <Pop at={wt('эрготерапевтом') - 0.2} style={{ position: 'absolute', left: 100, top: 640 }}><Chip bg={C.sky} color={C.navy} size={40}>эрготерапевт</Chip></Pop>
      <Pop at={wt('логопедом') - 0.2} style={{ position: 'absolute', left: 980, top: 640 }}><Chip bg={C.mintSoft} color={C.navy} size={40}>логопед</Chip></Pop>
      <Pop at={wt('физиотерапию') - 0.3} style={{ position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center' }}><Chip size={42}>физиотерапия — по показаниям</Chip></Pop>
    </At>
    <At from={tLoad} to={B[5]}>
      <Gradient from={C.ink} to={C.teal} angle={150} />
      <div style={{ position: 'absolute', left: 160, top: 200 }}>
        <Pop at={tLoad + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 84 }}>Нагрузка — <span style={{ color: C.sun }}>постепенно</span></span></Pop>
        <div style={{ display: 'flex', gap: 30, marginTop: 50 }}>
          <Pop at={wt('давлением') - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Circle Icon={IconGauge} color={C.sky} size={90} /><span style={{ ...font, fontWeight: 800, fontSize: 48 }}>давление</span></Pop>
          <Pop at={wt('пульсом') - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Circle Icon={IconHeart} color={C.coral} size={90} /><span style={{ ...font, fontWeight: 800, fontSize: 48 }}>пульс</span></Pop>
        </div>
      </div>
      <svg width={600} height={420} style={{ position: 'absolute', right: 140, top: 240 }}>
        {[0, 1, 2, 3].map(i => <rect key={i} x={i * 140} y={300 - i * 80} width={120} height={60 + i * 80} rx={14} fill={i === 3 ? C.sun : 'rgba(255,255,255,0.25)'} />)}
      </svg>
    </At>
  </>
);

// ── Сцена 6: три заседания МДРК ───────────────────────────────────────────
const Scene6 = () => (
  <>
    <At from={B[5]} to={B[6]}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Frame x={90} y={110} w={820} h={500}><Photo src={P.meeting} focus="25% center" /></Frame>
      <div style={{ position: 'absolute', left: 980, top: 110, width: 860 }}>
        <Pop at={B[5] + 0.1}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 54, lineHeight: 1.08 }}>Команда обсуждает вас вместе — <span style={{ color: ST2 }}>минимум 3 раза</span></span></Pop>
        <Pop at={wt('оценивают') - 0.3} style={{ marginTop: 26 }}><span style={{ ...font, color: C.textDark, fontWeight: 700, fontSize: 36, lineHeight: 1.25 }}>оценка по шкалам → как вы продвигаетесь к цели</span></Pop>
        <Pop at={wt('меняют') - 0.3} style={{ marginTop: 14 }}><span style={{ ...font, color: C.textDark, fontWeight: 700, fontSize: 36 }}>при необходимости план меняют</span></Pop>
      </div>
      <div style={{ position: 'absolute', left: 90, right: 90, top: 660, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {([['начале', 'начало курса', '1'], ['середине', 'середина', '2'], ['конце', 'конец курса', '3']] as [string, string, string][]).map(([w, t, n], i) => (
          <React.Fragment key={w}>
            <Pop at={wt(w) - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px', borderRadius: 24, background: C.white, boxShadow: '0 12px 30px rgba(19,41,61,0.12)' }}>
              <div style={{ position: 'relative' }}><IconDoc size={70} color={C.teal} stroke={4.5} /><span style={{ ...font, position: 'absolute', right: -6, bottom: -6, width: 34, height: 34, borderRadius: 17, background: ST2, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span></div>
              <div>
                <div style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 36 }}>{t}</div>
                <div style={{ ...font, color: C.textMuted, fontWeight: 600, fontSize: 26 }}>протокол МДРК</div>
              </div>
            </Pop>
            {i < 2 && <Pop at={wt(w) + 0.1} dy={0}><IconArrow size={60} color={C.textMuted} stroke={5} /></Pop>}
          </React.Fragment>
        ))}
      </div>
    </At>
  </>
);

// ── Сцена 7: что зависит от вас и близких ─────────────────────────────────
const tFam = wt('близкие') - 0.4;
const Scene7 = () => (
  <>
    <At from={B[6]} to={tFam} fadeOut={0.3}>
      <Photo src={P.homework} focus="60% center" />
      <Shade side="left" />
      <div style={{ position: 'absolute', left: 110, top: 220, width: 760 }}>
        <Pop at={B[6] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 80, lineHeight: 1.05 }}>Многое зависит <span style={{ color: C.sun }}>от вас</span></span></Pop>
        <Pop at={wt('задания') - 0.3} style={{ marginTop: 30 }}><Chip bg="rgba(255,255,255,0.16)" color={C.white} size={40}>задания — и в палате</Chip></Pop>
        <Pop at={wt('самостоятельно', 2) - 0.6} style={{ marginTop: 16 }}><Chip bg="rgba(255,255,255,0.16)" color={C.white} size={40}>как можно больше самостоятельно</Chip></Pop>
      </div>
    </At>
    <At from={tFam} to={B[7]}>
      <Gradient from={C.navy} to={C.teal} angle={150} />
      <Frame x={880} y={130} w={940} h={600}><Photo src={P.family} focus="50% center" /></Frame>
      <div style={{ position: 'absolute', left: 110, top: 200, width: 730 }}>
        <Pop at={tFam + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 70, lineHeight: 1.05 }}>Близкие <span style={{ color: C.sun }}>тоже участвуют</span></span></Pop>
        <Pop at={wt('спросите') - 0.3} style={{ marginTop: 40 }}>
          <span style={{ ...font, fontWeight: 800, fontSize: 40, color: C.navy, background: C.sun, padding: '14px 28px', borderRadius: 26, display: 'inline-block', lineHeight: 1.25 }}>Спросите команду, чему научиться,<br />чтобы помогать дома</span>
        </Pop>
      </div>
    </At>
  </>
);

// ── Сцена 8: выписка = реабилитационный эпикриз = 3-е заседание ───────────
const tNext = wt('следующем') - 0.5;
const Line: React.FC<{ at: number; text: string; color: string; extra?: React.ReactNode }> = ({ at, text, color, extra }) => (
  <Pop at={at - 0.3} dy={12} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '13px 0', borderTop: '2px solid #e6eef0' }}>
    <div style={{ width: 46, height: 46, borderRadius: 23, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconCheck size={28} color={C.white} stroke={7} /></div>
    <span style={{ ...font, color: C.textDark, fontWeight: 700, fontSize: 34 }}>{text}</span>{extra}
  </Pop>
);
const Scene8 = () => (
  <>
    <At from={B[7]} to={tNext} fadeOut={0.3}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Frame x={80} y={130} w={760} h={600}><Photo src={P.discharge} focus="50% center" /></Frame>
      <Pop at={B[7] + 0.1} style={{ position: 'absolute', left: 900, top: 90, width: 940, background: C.white, borderRadius: 26, boxShadow: '0 24px 60px rgba(19,41,61,0.14)', padding: '28px 40px 12px', boxSizing: 'border-box' }}>
        <div style={{ ...font, color: ST2, fontWeight: 800, fontSize: 30 }}>3-е заседание МДРК</div>
        <div style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 46, lineHeight: 1.1, marginTop: 4 }}>Выписка = реабилитационный эпикриз</div>
        <div style={{ height: 14 }} />
        <Line at={wt('реабилитационный', 3)} text="реабилитационный диагноз" color={C.skyDeep} />
        <Line at={wt('индивидуальный', 2)} text="индивидуальный план (ИПМР)" color={C.teal} />
        <Line at={wt('достигнута')} text="цель:" color={C.sun} extra={<span style={{ ...font, color: C.textMuted, fontWeight: 700, fontSize: 28, marginLeft: 6 }}>достигнута · частично · не достигнута</span>} />
        <Line at={wt('оценка')} text="оценка по шкале маршрутизации" color={C.coral} />
        <Line at={wt('следующий', 2)} text="следующий этап" color={C.coral} />
      </Pop>
    </At>
    <At from={tNext} to={END} fadeOut={0.6}><NextCard at={tNext} title={<>Третий этап:<br /><span style={{ color: C.mint }}>поликлиника, дневной стационар, дом</span></>} /></At>
  </>
);

const Music = () => {
  const f = useCurrentFrame();
  return <Audio src={staticFile('episodes/05/music.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />;
};

export const Ep05: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.navy }}>
    <Scene1 />
    <Scene2 />
    <Scene3 />
    <Scene4 />
    <Scene5 />
    <Scene6 />
    <Scene7 />
    <Scene8 />
    <Captions pages={captions.pages} />
    <Audio src={staticFile('episodes/05/voice.wav')} />
    <Music />
  </AbsoluteFill>
);
