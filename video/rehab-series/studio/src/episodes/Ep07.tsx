import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import timings from '../../episodes/07-komanda/voice/timings.json';
import captionsJson from '../../episodes/07-komanda/voice/captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo, useAppearAt } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Frame, Gradient, NextCard, Pop, TitleCard } from '../series/ui';
import {
  IconArrow, IconBrain, IconCheck, IconDoc, IconDoctor, IconFamily, IconGauge, IconHeart, IconNurse, IconPerson, IconShirt, IconSpeech, IconWalk,
} from '../series/icons';

// Выпуск 7. «Кто будет с вами работать: команда специалистов» — 16:9
// Замысел владелицы: состав МДРК (шесть основных + медсестра палатная в стационаре); каждый оценивает в своей области,
// вместе — реабилитационный диагноз в категориях МКФ (B · S · D = активность и участие · E + личностные) и реабилитационный потенциал.
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const S = timings.scenes;
const END = timings.duration + 1.5;
const B = [0, S[1].start, S[2].start, S[3].start, S[4].start, S[5].start, S[6].start, S[7].start, S[8].start, END];
export const EP07_DURATION = sec(END);

const P = {
  meeting: 'stock/canva/C19-team-meeting.png',
  doctor: 'stock/canva/C20-frm-doctor-leads.png',
  balance: 'stock/canva/C21-balance-test.png',
  ergo: 'stock/canva/C22-ergo-dressing.png',
  psych: 'stock/canva/C23-psychologist-memory.png',
  speech: 'stock/canva/C24-speech-swallow.png',
  nurse: 'stock/canva/C25-rehab-nurse.png',
  stairs: 'stock/canva/C26-stairs-family.png',
  bathroom: 'stock/canva/C27-adapted-bathroom.png',
  goal: 'stock/canva/C28-goal-together.png',
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const ACC = C.skyDeep;

const Circle: React.FC<{ Icon: IconT; color: string; size?: number; iconColor?: string }> = ({ Icon, color, size = 76, iconColor = C.navy }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={size * 0.6} color={iconColor} stroke={5} /></div>
);
const TeamTag: React.FC<{ at: number; dark?: boolean }> = ({ at, dark }) => (
  <Pop at={at} dy={-20} style={{ position: 'absolute', right: 80, top: 44 }}>
    <Chip bg={dark ? C.navy : 'rgba(255,255,255,0.14)'} color={C.white} size={28}>команда специалистов</Chip>
  </Pop>
);
const Shade: React.FC<{ side?: 'left' | 'right'; k?: number }> = ({ side = 'left', k = 0.92 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${side === 'left' ? 90 : 270}deg, rgba(11,37,69,${k}) 0%, rgba(11,37,69,${k * 0.75}) 42%, rgba(11,37,69,0) 78%)` }} />
);

// ── Сцена 1: крючок ────────────────────────────────────────────────────────
const tTitle = wt('кто') - 0.3;
const Scene1 = () => (
  <>
    <At from={0} to={tTitle} fadeIn={0} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.teal} angle={150} />
      <Frame x={860} y={110} w={980} h={640}><Photo src={P.meeting} focus="center" /></Frame>
      <div style={{ position: 'absolute', left: 110, top: 250, width: 700 }}>
        <Pop at={0.3}><span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mintSoft }}>На каждом этапе с вами работает</span></Pop>
        <Pop at={wt('целая') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: C.sun }}>целая команда</span></Pop>
      </div>
    </At>
    <At from={tTitle} to={B[1]} fadeIn={0.3}>
      <Photo src={P.meeting} focus="center" zoom={0.04} />
      <TitleCard at={tTitle} episode={7} line1="Кто будет с вами работать:" line2="команда специалистов" size={78} sub="Кто в неё входит · что оценивает каждый · реабилитационный потенциал" />
    </At>
  </>
);

// ── Сцена 2: что такое команда ────────────────────────────────────────────
const Scene2 = () => (
  <At from={B[1]} to={B[2]}>
    <Gradient from={C.navy} to={C.ink} angle={160} />
    <Frame x={1000} y={150} w={820} h={560}><Photo src={P.doctor} focus="60% center" /></Frame>
    <TeamTag at={B[1]} />
    <div style={{ position: 'absolute', left: 110, top: 150, width: 840 }}>
      <Pop at={wt('мультидисциплинарная') - 0.3}><span style={{ ...font, fontWeight: 800, fontSize: 58, lineHeight: 1.08 }}>Мультидисциплинарная <span style={{ color: C.mint }}>реабилитационная команда</span></span></Pop>
      <Pop at={wt('руководит') - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 36 }}>
        <Circle Icon={IconDoctor} color={C.sun} size={84} />
        <span style={{ ...font, fontWeight: 800, fontSize: 38, lineHeight: 1.15 }}>Руководит — врач физической и реабилитационной медицины</span>
      </Pop>
      <Pop at={wt('состав') - 0.3} style={{ marginTop: 36 }}><Chip size={40}>состав — под каждого пациента</Chip></Pop>
    </div>
  </At>
);

// ── Сцена 3: шесть специалистов ───────────────────────────────────────────
const Role: React.FC<{ at: number; Icon: IconT; color: string; title: string; note?: string; text: string }> = ({ at, Icon, color, title, note, text }) => {
  const a = useAppearAt(at - 0.3);
  return (
    <div style={{ width: 545, height: 250, borderRadius: 30, background: 'rgba(255,255,255,0.09)', border: '2px solid rgba(255,255,255,0.16)', padding: '26px 28px', boxSizing: 'border-box', display: 'flex', gap: 22, alignItems: 'flex-start', opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
      <Circle Icon={Icon} color={color} size={86} />
      <div>
        <div style={{ ...font, fontWeight: 800, fontSize: 34, lineHeight: 1.1 }}>{title}</div>
        {note && <div style={{ ...font, fontWeight: 600, fontSize: 22, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{note}</div>}
        <div style={{ ...font, fontWeight: 600, fontSize: 28, color: C.mintSoft, marginTop: 8, lineHeight: 1.2 }}>{text}</div>
      </div>
    </div>
  );
};
const Scene3 = () => (
  <At from={B[2]} to={B[3]}>
    <Gradient from={C.navy} to={C.teal} angle={160} />
    <TeamTag at={B[2]} />
    <Pop at={B[2] + 0.1} style={{ position: 'absolute', left: 110, top: 50, display: 'flex', alignItems: 'baseline', gap: 18 }}>
      <span style={{ ...font, fontWeight: 800, fontSize: 96, color: C.sun, lineHeight: 1 }}>6</span>
      <span style={{ ...font, fontWeight: 800, fontSize: 50 }}>специалистов — основа команды</span>
    </Pop>
    <div style={{ position: 'absolute', left: 110, top: 190, width: 1700, display: 'flex', flexWrap: 'wrap', gap: 22 }}>
      <Role at={wt('первый')} Icon={IconDoctor} color={C.sun} title="Врач ФРМ" note="физической и реабилитационной медицины" text="руководит командой" />
      <Role at={wt('инструктор')} Icon={IconWalk} color={C.mint} title="Инструктор ЛФК" note="кинезиоспециалист" text="восстанавливает движение" />
      <Role at={wt('эрготерапевт')} Icon={IconShirt} color={C.sky} title="Эрготерапевт" note="эргоспециалист" text="возвращает бытовые навыки" />
      <Role at={wt('клинический')} Icon={IconBrain} color={C.coral} title="Клинический психолог" text="настроение · память и внимание" />
      <Role at={wt('клинический', 2)} Icon={IconSpeech} color={C.mintSoft} title="Клинический логопед" text="речь и глотание" />
      <Role at={wt('медицинская')} Icon={IconNurse} color={C.white} title="Медсестра по медицинской реабилитации" text="закрепляет навыки каждый день" />
    </div>
    <Pop at={wt('палатная') - 0.4} style={{ position: 'absolute', left: 110, top: 760 }}>
      <Chip bg="rgba(11,37,69,0.75)" color={C.white} size={34}>+ в стационаре — медицинская сестра палатная</Chip>
    </Pop>
  </At>
);

// ── Сцена 4: каждый оценивает в своей области ─────────────────────────────
const Check: React.FC<{ at: number; who: string; what: string; color: string }> = ({ at, who, what, color }) => (
  <Pop at={at - 0.3} dy={12} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderTop: '2px solid rgba(255,255,255,0.12)' }}>
    <div style={{ width: 18, height: 18, borderRadius: 9, background: color, flexShrink: 0 }} />
    <span style={{ ...font, fontWeight: 800, fontSize: 34, width: 280, flexShrink: 0 }}>{who}</span>
    <span style={{ ...font, fontWeight: 600, fontSize: 30, color: C.mintSoft }}>{what}</span>
  </Pop>
);
const tErgo = wt('эрготерапевт', 2) - 0.3, tPsy = wt('психолог', 2) - 0.3, tLog = wt('логопед', 2) - 0.3, tWhole = wt('каждый', 3) - 0.3;
const Scene4 = () => (
  <At from={B[3]} to={B[4]}>
    <Gradient from={C.ink} to={C.navy} angle={150} />
    <TeamTag at={B[3]} />
    <div style={{ position: 'absolute', left: 100, top: 60, width: 900 }}>
      <Pop at={B[3] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 52, lineHeight: 1.1 }}>Каждый оценивает вас <span style={{ color: C.sun }}>в своей области</span></span></Pop>
      <div style={{ marginTop: 26 }}>
        <Check at={wt('врач', 3)} who="Врач" what="общее состояние · риски" color={C.sun} />
        <Check at={wt('инструктор', 2)} who="Инструктор ЛФК" what="сила · равновесие · ходьба" color={C.mint} />
        <Check at={wt('эрготерапевт', 2)} who="Эрготерапевт" what="одеться · умыться · приготовить" color={C.sky} />
        <Check at={wt('психолог', 2)} who="Психолог" what="память · внимание · настроение" color={C.coral} />
        <Check at={wt('логопед', 2)} who="Логопед" what="речь · глотание" color={C.mintSoft} />
      </div>
    </div>
    {([[B[3], tErgo, P.balance, '50% center'], [tErgo, tPsy, P.ergo, '45% center'], [tPsy, tLog, P.psych, 'center'], [tLog, B[4], P.speech, 'center']] as [number, number, string, string][]).map(([a, b, src, focus]) => (
      <At key={src} from={a} to={b} fadeIn={a === B[3] ? 0.4 : 0.3} fadeOut={0.3}>
        <Frame x={1060} y={150} w={780} h={540}><Photo src={src} focus={focus} /></Frame>
      </At>
    ))}
    <Pop at={tWhole} style={{ position: 'absolute', left: 100, top: 740, width: 1720 }}>
      <span style={{ ...font, fontWeight: 800, fontSize: 38, color: C.navy, background: C.sun, padding: '12px 26px', borderRadius: 24, display: 'inline-block' }}>каждый смотрит на свою часть — но видит человека целиком</span>
    </Pop>
  </At>
);

// ── Сцена 5: МКФ — пять категорий здоровья ────────────────────────────────
const tFive = wt('пять') - 0.4;
const Tile: React.FC<{ at: number; x: number; y: number; w: number; h: number; letter: string; title: string; ex: string; color: string }> = ({ at, x, y, w, h, letter, title, ex, color }) => {
  const a = useAppearAt(at - 0.3);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 28, background: C.white, boxShadow: '0 16px 40px rgba(19,41,61,0.12)', padding: '22px 26px', boxSizing: 'border-box', opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 66, height: 66, borderRadius: 18, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ ...font, fontWeight: 800, fontSize: 42, color: C.white }}>{letter}</span></div>
        <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 34, lineHeight: 1.1 }}>{title}</span>
      </div>
      <div style={{ ...font, color: C.textMuted, fontWeight: 700, fontSize: 26, marginTop: 14, lineHeight: 1.25 }}>{ex}</div>
    </div>
  );
};
const SCALE = ['нет проблем', 'лёгкие', 'умеренные', 'тяжёлые', 'абсолютные'];
const ScaleStrip: React.FC<{ at: number }> = ({ at }) => (
  <Pop at={at} dy={10} style={{ position: 'absolute', left: 110, top: 790, display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ ...font, color: C.textMuted, fontWeight: 800, fontSize: 24, marginRight: 6 }}>оценка МКФ:</span>
    {SCALE.map((t, i) => (
      <span key={t} style={{ ...font, fontWeight: 800, fontSize: 22, color: i < 2 ? C.navy : C.white, padding: '6px 14px', borderRadius: 16, background: ['#cfeee9', '#9be3d6', C.sun, C.coral, '#c0392b'][i] }}>{i} · {t}</span>
    ))}
  </Pop>
);
const Scene5 = () => (
  <>
    <At from={B[4]} to={tFive} fadeOut={0.3}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Pop at={B[4] + 0.1} style={{ position: 'absolute', left: 110, right: 110, top: 70, textAlign: 'center' }}>
        <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 50, lineHeight: 1.1 }}>Международная классификация функционирования</span>
        <div style={{ ...font, color: C.textMuted, fontWeight: 600, fontSize: 28, marginTop: 8 }}>ограничений жизнедеятельности и здоровья (ВОЗ) — МКФ</div>
      </Pop>
      <div style={{ position: 'absolute', left: 160, right: 160, top: 300, display: 'flex', gap: 40 }}>
        <Pop at={wt('обычный') - 0.3} dy={20} style={{ flex: 1, background: C.white, borderRadius: 30, padding: '36px 40px', boxShadow: '0 16px 40px rgba(19,41,61,0.1)' }}>
          <div style={{ ...font, color: C.textMuted, fontWeight: 800, fontSize: 32 }}>Обычный диагноз</div>
          <div style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 56, marginTop: 10 }}>чем человек болен</div>
        </Pop>
        <Pop at={wt('эта') - 0.3} dy={20} style={{ flex: 1, background: ACC, borderRadius: 30, padding: '36px 40px', boxShadow: '0 16px 40px rgba(19,41,61,0.18)' }}>
          <div style={{ ...font, color: C.mintSoft, fontWeight: 800, fontSize: 32 }}>МКФ</div>
          <div style={{ ...font, color: C.white, fontWeight: 800, fontSize: 56, marginTop: 10 }}>что ему из-за болезни трудно</div>
        </Pop>
      </div>
    </At>
    <At from={tFive} to={B[5]}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Pop at={tFive + 0.1} style={{ position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22 }}>
        <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 46 }}>5 категорий здоровья</span>
        <span style={{ ...font, fontWeight: 800, fontSize: 26, color: C.white, background: C.coral, padding: '8px 22px', borderRadius: 30 }}>состояние здоровья: травма / болезнь</span>
      </Pop>
      <Tile at={wt('функции')} x={110} y={150} w={470} h={250} letter="B" title="Функции организма" ex="сила мышц · память · речь" color={ACC} />
      <Tile at={wt('структуры')} x={600} y={150} w={470} h={250} letter="S" title="Структуры организма" ex="какие органы и ткани затронуты" color={C.teal} />
      <div style={{ position: 'absolute', left: 1090, top: 150, width: 720, height: 250 }}>
        <Tile at={wt('активность')} x={0} y={0} w={350} h={250} letter="D" title="Активность" ex="что человек делает сам" color={C.coral} />
        <Tile at={wt('участие')} x={370} y={0} w={350} h={250} letter="D" title="Участие" ex="работа · покупки · друзья" color={C.coral} />
      </div>
      <Pop at={wt('активность') + 0.2} dy={0} style={{ position: 'absolute', left: 1090, top: 410, width: 720, textAlign: 'center' }}>
        <span style={{ ...font, color: C.coral, fontWeight: 800, fontSize: 24 }}>D — деятельность: активность и участие</span>
      </Pop>
      <Tile at={wt('факторы')} x={110} y={460} w={1700} h={300} letter="E" title="Факторы окружающей среды" ex="дом · лестницы · помощь близких" color={C.skyDeep} />
      <At from={wt('факторы') - 0.1} to={B[5]} fadeIn={0.4}>
        <Frame x={1150} y={480} w={300} h={200} r={20}><Photo src={P.stairs} focus="center" /></Frame>
        <Frame x={1480} y={480} w={300} h={200} r={20}><Photo src={P.bathroom} focus="center" /></Frame>
      </At>
      <Pop at={wt('вместе') - 0.3} style={{ position: 'absolute', left: 140, top: 660, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Circle Icon={IconPerson} color={C.sun} size={64} />
        <span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 32 }}>+ личностные факторы: <span style={{ color: C.textMuted }}>возраст · характер · привычки</span></span>
      </Pop>
      <ScaleStrip at={wt('например') - 0.2} />
    </At>
  </>
);

// ── Сцена 6: реабилитационный диагноз ─────────────────────────────────────
const tLife = wt('поэтому') - 0.4;
const ROLE_ICONS: [IconT, string][] = [[IconDoctor, C.sun], [IconWalk, C.mint], [IconShirt, C.sky], [IconBrain, C.coral], [IconSpeech, C.mintSoft], [IconNurse, C.white]];
const Scene6 = () => (
  <>
    <At from={B[5]} to={tLife} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.teal} angle={160} />
      <TeamTag at={B[5]} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center', gap: 34 }}>
        {ROLE_ICONS.map(([Icon, color], i) => (
          <Pop key={i} at={B[5] + 0.1 + i * 0.15} dy={-20}><Circle Icon={Icon} color={color} size={96} /></Pop>
        ))}
      </div>
      <Pop at={wt('вносит') - 0.2} dy={0} style={{ position: 'absolute', left: 0, right: 0, top: 240, display: 'flex', justifyContent: 'center' }}>
        <IconArrow size={70} color={C.mintSoft} stroke={5} />
      </Pop>
      <Pop at={wt('реабилитационный') - 0.3} style={{ position: 'absolute', left: 360, right: 360, top: 330, background: C.white, borderRadius: 32, padding: '30px 44px', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 30 }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, background: ACC, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconDoc size={72} color={C.white} stroke={4} /></div>
        <div>
          <div style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 54, lineHeight: 1.05 }}>Реабилитационный диагноз</div>
          <div style={{ ...font, color: C.textMuted, fontWeight: 700, fontSize: 32, marginTop: 8 }}>список ваших главных проблем — в категориях МКФ</div>
        </div>
      </Pop>
      <Pop at={wt('болезнь') - 0.3} style={{ position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center' }}>
        <Chip size={40}>болезнь — не единственная причина трудностей</Chip>
      </Pop>
    </At>
    <At from={tLife} to={B[6]} fadeIn={0.3}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <Frame x={80} y={130} w={1000} h={600}><Photo src={P.nurse} focus="center" /></Frame>
      <div style={{ position: 'absolute', left: 1140, top: 200, width: 700 }}>
        <Pop at={tLife + 0.1}><span style={{ ...font, fontWeight: 700, fontSize: 44, color: C.mintSoft }}>Восстанавливают прежде всего</span></Pop>
        <Pop at={wt('нужно', 2) - 0.3} style={{ marginTop: 16 }}><span style={{ ...font, fontWeight: 800, fontSize: 64, lineHeight: 1.05 }}>то, что нужно вам <span style={{ color: C.sun }}>в обычной жизни</span></span></Pop>
      </div>
    </At>
  </>
);

// ── Сцена 7: реабилитационный потенциал ───────────────────────────────────
const Factor: React.FC<{ at: number; Icon: IconT; color: string; text: string }> = ({ at, Icon, color, text }) => (
  <Pop at={at - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', borderRadius: 24, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.16)', width: 520, boxSizing: 'border-box' }}>
    <Circle Icon={Icon} color={color} size={72} />
    <span style={{ ...font, fontWeight: 800, fontSize: 34, lineHeight: 1.1 }}>{text}</span>
  </Pop>
);
const Scene7 = () => (
  <At from={B[6]} to={B[7]}>
    <Gradient from={C.ink} to={C.navy} angle={150} />
    <TeamTag at={B[6]} />
    <div style={{ position: 'absolute', left: 120, top: 120, width: 520, height: 520, borderRadius: 260, background: ACC, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${ACC}88` }}>
      <IconGauge size={300} color={C.white} stroke={3.5} />
    </div>
    <div style={{ position: 'absolute', left: 720, top: 110, width: 1100 }}>
      <Pop at={wt('потенциал') - 0.6}><span style={{ ...font, fontWeight: 800, fontSize: 64, lineHeight: 1.05 }}>Реабилитационный <span style={{ color: C.sun }}>потенциал</span></span></Pop>
      <Pop at={wt('проще') - 0.3} style={{ marginTop: 16 }}><span style={{ ...font, fontWeight: 700, fontSize: 40, color: C.mintSoft, lineHeight: 1.2 }}>насколько вы можете восстановиться — и за какое время</span></Pop>
      <Pop at={wt('каждый', 5) - 0.3} style={{ marginTop: 22 }}><Chip bg="rgba(255,255,255,0.16)" color={C.white} size={30}>каждый специалист — в своей области</Chip></Pop>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 30 }}>
        <Factor at={wt('тяжести')} Icon={IconHeart} color={C.coral} text="тяжесть состояния" />
        <Factor at={wt('желания')} Icon={IconWalk} color={C.mint} text="ваше желание заниматься" />
        <Factor at={wt('поддержки')} Icon={IconFamily} color={C.sky} text="поддержка близких" />
        <Factor at={wt('возможностей')} Icon={IconDoctor} color={C.sun} text="возможности команды" />
      </div>
    </div>
    <Pop at={wt('определить') - 0.3} style={{ position: 'absolute', left: 120, top: 700, display: 'flex', alignItems: 'center', gap: 14 }}>
      <Circle Icon={IconCheck} color={C.sun} size={60} />
      <span style={{ ...font, fontWeight: 800, fontSize: 36 }}>определяют, когда состояние стабильно</span>
    </Pop>
  </At>
);

// ── Сцена 8: какой бывает потенциал ───────────────────────────────────────
const LEVELS: [string, string, string][] = [['полное', 'полное восстановление', C.mint], ['частичное', 'частичное восстановление', C.sky], ['учится', 'делать по-новому — с опорой и приспособлениями', C.sun], ['приспособить', 'приспособить дом и наладить уход', C.coral]];
const tHome = wt('приспособить') - 0.4, tAgain = wt('потенциал', 4) - 0.3;
const Scene8 = () => (
  <At from={B[7]} to={B[8]}>
    <Gradient from={C.navy} to={C.teal} angle={150} />
    <TeamTag at={B[7]} />
    <Pop at={B[7] + 0.1} style={{ position: 'absolute', left: 100, top: 60 }}><span style={{ ...font, fontWeight: 800, fontSize: 56 }}>Потенциал <span style={{ color: C.sun }}>бывает разным</span></span></Pop>
    <div style={{ position: 'absolute', left: 100, top: 180, width: 900 }}>
      {LEVELS.map(([w, t, color], i) => (
        <Pop key={w} at={wt(w) - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: i ? 30 : 0, marginLeft: i * 34 }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ ...font, fontWeight: 800, fontSize: 34, color: C.navy }}>{i + 1}</span></div>
          <span style={{ ...font, fontWeight: 800, fontSize: 44, lineHeight: 1.12, maxWidth: 820 }}>{t}</span>
        </Pop>
      ))}
    </div>
    <At from={wt('иногда', 3) - 0.4} to={tHome} fadeIn={0.4} fadeOut={0.3}>
      <Frame x={1060} y={160} w={780} h={520}><Photo src={P.stairs} focus="center" /></Frame>
    </At>
    <At from={tHome} to={B[8]} fadeIn={0.3}>
      <Frame x={1060} y={160} w={780} h={520}><Photo src={P.bathroom} focus="center" /></Frame>
    </At>
    <Pop at={tAgain} style={{ position: 'absolute', left: 100, top: 720, display: 'flex', alignItems: 'center', gap: 14 }}>
      <Circle Icon={IconArrow} color={C.sun} size={60} />
      <span style={{ ...font, fontWeight: 800, fontSize: 36 }}>потенциал может меняться — его оценивают снова</span>
    </Pop>
  </At>
);

// ── Сцена 9: цель, главный участник, анонс ────────────────────────────────
const tYou = wt('главный') - 0.4, tNext = wt('следующем') - 0.5;
const Scene9 = () => (
  <>
    <At from={B[8]} to={tYou} fadeOut={0.3}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Frame x={80} y={130} w={1000} h={600}><Photo src={P.goal} focus="center" /></Frame>
      <div style={{ position: 'absolute', left: 1140, top: 170, width: 700 }}>
        <Pop at={wt('цель') - 0.3}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 58, lineHeight: 1.08 }}>Цель и план — <span style={{ color: ACC }}>исходя из потенциала</span></span></Pop>
        <Pop at={wt('ставят') - 0.3} style={{ marginTop: 34 }}><span style={{ ...font, fontWeight: 800, fontSize: 38, color: C.navy, background: C.sun, padding: '14px 26px', borderRadius: 24, display: 'inline-block', lineHeight: 1.25 }}>Цель ставят вместе с вами</span></Pop>
        <Pop at={wt('без') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, color: C.textDark, fontWeight: 700, fontSize: 34, lineHeight: 1.25 }}>без вашего мнения картина будет неполной</span></Pop>
      </div>
    </At>
    <At from={tYou} to={tNext} fadeIn={0.3} fadeOut={0.3}>
      <Photo src={P.meeting} focus="center" zoom={0.05} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.88) 0%, rgba(11,37,69,0.4) 32%, rgba(11,37,69,0) 55%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center' }}>
        <Pop at={tYou + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 72 }}>Главный участник команды — <span style={{ color: C.sun }}>вы</span></span></Pop>
        <Pop at={wt('рядом') - 0.3} style={{ marginTop: 14 }}><span style={{ ...font, fontWeight: 700, fontSize: 44, color: C.mintSoft }}>а рядом — ваши близкие</span></Pop>
      </div>
    </At>
    <At from={tNext} to={END} fadeOut={0.6}><NextCard at={tNext} title={<>Как понять,<br /><span style={{ color: C.mint }}>что становится лучше</span></>} /></At>
  </>
);

const Music = () => {
  const f = useCurrentFrame();
  return <Audio src={staticFile('episodes/07/music.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />;
};

export const Ep07: React.FC = () => (
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
    <Audio src={staticFile('episodes/07/voice.wav')} />
    <Music />
  </AbsoluteFill>
);
