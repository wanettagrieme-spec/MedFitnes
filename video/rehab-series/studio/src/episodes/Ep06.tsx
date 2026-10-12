import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import timings from '../../episodes/06-tretij-etap/voice/timings.json';
import captionsJson from '../../episodes/06-tretij-etap/voice/captions.json';
import { makeWordTime, type CaptionsJson } from '../series/captions';
import { At, Captions, Photo, useAppearAt } from '../series/components';
import { C, sec } from '../series/theme';
import { Chip, font, Frame, Gradient, NextCard, Pop, TitleCard } from '../series/ui';
import {
  IconArrow, IconBrain, IconBuilding, IconCheck, IconClock, IconDoc, IconDoctor, IconHeart, IconHome, IconPin, IconShirt, IconThermometer, IconWalk,
} from '../series/icons';

// Выпуск 6. «Третий этап: поликлиника, дневной стационар, дом» — 16:9
// Правки специалиста: «кто направляет» и «куда» — раздельно; на III этапе занятия и индивидуальные, и групповые;
// психолог и логопед — «там, где это необходимо»; задача — вернуться к обычной повседневной жизни; дом — коротко.
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const S = timings.scenes;
const END = timings.duration + 1.5;
const B = [0, S[1].start, S[2].start, S[3].start, S[4].start, S[5].start, S[6].start, S[7].start, S[8].start, END];
export const EP06_DURATION = sec(END);

const P = {
  hall: 'stock/canva/C7-polyclinic-hall.png',
  referral: 'stock/canva/C8-referral.png',
  group: 'stock/canva/C9-group-session.png',
  bike: 'stock/canva/C10-individual-bike.png',
  dayHospital: 'stock/canva/C11-day-hospital.png',
  ergo: 'stock/canva/C12-ergo-kitchen.png',
  bus: 'stock/canva/C13-bus.png',
  homeVisit: 'stock/canva/C14-home-visit.png',
  homework: 'stock/canva/C15-homework.png',
  shop: 'stock/canva/C16-shop.png',
  work: 'stock/canva/C17-work.png',
  selfCare: 'stock/canva/C18-self-care.png',
};
type IconT = React.FC<{ size?: number; color?: string; stroke?: number }>;
const ST3 = C.teal;

const StageBar: React.FC<{ at: number }> = ({ at }) => (
  <Pop at={at} dy={-20} style={{ position: 'absolute', right: 80, top: 44, display: 'flex', gap: 12 }}>
    {[1, 2, 3].map(n => (
      <span key={n} style={{ ...font, fontWeight: 800, fontSize: 28, padding: '8px 22px', borderRadius: 30, background: n === 3 ? ST3 : 'rgba(19,41,61,0.45)', color: n === 3 ? C.white : 'rgba(255,255,255,0.7)', transform: n === 3 ? 'scale(1.1)' : 'none' }}>{n} этап</span>
    ))}
  </Pop>
);
const Circle: React.FC<{ Icon: IconT; color: string; size?: number; iconColor?: string }> = ({ Icon, color, size = 76, iconColor = C.navy }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={size * 0.6} color={iconColor} stroke={5} /></div>
);

// ── Сцена 1: крючок ────────────────────────────────────────────────────────
const tTitle = wt('разберём') - 0.4;
const Scene1 = () => (
  <>
    <At from={0} to={tTitle} fadeIn={0} fadeOut={0.4}>
      <Gradient from={C.navy} to={C.teal} angle={150} />
      <Frame x={860} y={110} w={980} h={640}><Photo src={P.hall} focus="center" /></Frame>
      <div style={{ position: 'absolute', left: 110, top: 220, width: 700 }}>
        <Pop at={0.3}><span style={{ ...font, fontWeight: 700, fontSize: 46, color: C.mintSoft, lineHeight: 1.15 }}>После больницы реабилитация не заканчивается</span></Pop>
        <Pop at={wt('третий') - 0.3} style={{ marginTop: 26 }}><span style={{ ...font, fontWeight: 800, fontSize: 84, lineHeight: 1.05 }}><span style={{ color: C.sun }}>Третий этап</span><br />ближе к дому</span></Pop>
      </div>
    </At>
    <At from={tTitle} to={B[1]} fadeIn={0.4}>
      <Photo src={P.hall} focus="center" zoom={0.04} />
      <TitleCard at={tTitle} episode={6} line1="Третий этап:" line2="поликлиника, дневной стационар, дом" size={72} sub="Кто направляет · как проходят занятия · чего добиваются" />
    </At>
  </>
);

// ── Сцена 2: кто направляет → куда ────────────────────────────────────────
const tWhere = wt('направляют', 2) - 0.4;
const Place: React.FC<{ at: number; Icon: IconT; color: string; text: string }> = ({ at, Icon, color, text }) => {
  const a = useAppearAt(at - 0.3);
  return (
    <div style={{ width: 500, height: 262, borderRadius: 28, background: C.white, boxShadow: '0 18px 44px rgba(19,41,61,0.12)', padding: '28px 30px', boxSizing: 'border-box', opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
      <Circle Icon={Icon} color={color} size={72} iconColor={C.white} />
      <div style={{ ...font, color: C.textDark, fontWeight: 800, fontSize: 32, marginTop: 14, lineHeight: 1.15 }}>{text}</div>
    </div>
  );
};
const Scene2 = () => (
  <>
    <At from={B[1]} to={tWhere} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <Frame x={80} y={170} w={800} h={560}><Photo src={P.referral} focus="40% center" /></Frame>
      <StageBar at={B[1]} />
      <div style={{ position: 'absolute', left: 950, top: 150, width: 900 }}>
        <Pop at={B[1] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 66, color: C.sun }}>Кто направляет</span></Pop>
        <div style={{ ...font, fontWeight: 700, fontSize: 32, color: C.mintSoft, marginTop: 6 }}>врачи поликлиники</div>
        {([['терапевт', 'врач-терапевт'], ['общей', 'врач общей практики'], ['врач-специалист', 'врач-специалист']] as [string, string][]).map(([w, t]) => (
          <Pop key={w} at={wt(w) - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
            <Circle Icon={IconDoctor} color={C.mint} size={62} />
            <span style={{ ...font, fontWeight: 800, fontSize: 42 }}>{t}</span>
          </Pop>
        ))}
        <Pop at={wt('лечащий') - 0.3} style={{ marginTop: 30 }}><Chip bg="rgba(255,255,255,0.14)" color={C.white} size={34}>а также лечащий врач 1 или 2 этапа</Chip></Pop>
      </div>
    </At>
    <At from={tWhere} to={B[2]}>
      <AbsoluteFill style={{ background: C.sand }} />
      <StageBar at={tWhere} />
      <Pop at={tWhere + 0.1} style={{ position: 'absolute', left: 110, top: 60 }}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 60 }}>Куда направляют</span></Pop>
      <div style={{ position: 'absolute', left: 110, top: 190, width: 1700, display: 'flex', flexWrap: 'wrap', gap: 26 }}>
        <Frame x={0} y={0} w={640} h={550} style={{ position: 'relative', left: 0, top: 0 }}><Photo src={P.dayHospital} focus="center" /></Frame>
        <div style={{ width: 1030, display: 'flex', flexWrap: 'wrap', gap: 26 }}>
          <Place at={wt('отделение')} Icon={IconBuilding} color={ST3} text="отделение медицинской реабилитации поликлиники" />
          <Place at={wt('дневной')} Icon={IconClock} color={C.skyDeep} text="дневной стационар поликлиники" />
          <Place at={wt('центр')} Icon={IconPin} color={C.coral} text="центр медицинской реабилитации" />
          <Place at={wt('санаторий')} Icon={IconHeart} color={C.sun} text="санаторий" />
        </div>
      </div>
    </At>
  </>
);

// ── Сцена 3: кому — ШРМ 2–3 ───────────────────────────────────────────────
const Cell: React.FC<{ n: number; active: number }> = ({ n, active }) => (
  <div style={{ width: 150, height: 120, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active > 0.5 ? ST3 : '#dfe8ec', transform: `scale(${1 + 0.08 * active})`, boxShadow: active > 0.5 ? '0 12px 30px rgba(19,41,61,0.2)' : 'none' }}>
    <span style={{ ...font, fontWeight: 800, fontSize: 64, color: active > 0.5 ? C.white : C.textMuted }}>{n}</span>
  </div>
);
const ScaleRow = () => {
  const lo = useAppearAt(wt('два') - 0.3);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', justifyContent: 'center', gap: 20 }}>
      {[0, 1, 2, 3, 4, 5, 6].map(n => <Cell key={n} n={n} active={n === 2 || n === 3 ? lo : 0} />)}
    </div>
  );
};
const Scene3 = () => (
  <>
    <At from={B[2]} to={B[3]}>
      <AbsoluteFill style={{ background: C.paper }} />
      <Pop at={B[2] + 0.1} style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center' }}><span style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 52 }}>Шкала реабилитационной маршрутизации</span></Pop>
      <ScaleRow />
      <Pop at={wt('три') - 0.2} style={{ position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22 }}>
        <span style={{ ...font, fontWeight: 800, fontSize: 40, color: C.white, background: ST3, padding: '8px 24px', borderRadius: 30 }}>2–3 балла</span>
        <IconArrow size={60} color={ST3} stroke={5} />
        <span style={{ ...font, fontWeight: 800, fontSize: 68, color: ST3 }}>3 этап</span>
      </Pop>
      <div style={{ position: 'absolute', left: 260, right: 260, top: 540, display: 'flex', gap: 30 }}>
        <Pop at={wt('передвигается') - 0.3} dy={14} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18, padding: '22px 28px', borderRadius: 26, background: C.white, boxShadow: '0 14px 34px rgba(19,41,61,0.1)' }}>
          <Circle Icon={IconWalk} color={C.mint} size={80} />
          <span style={{ ...font, color: C.textDark, fontWeight: 800, fontSize: 34, lineHeight: 1.15 }}>передвигается и обслуживает себя сам</span>
        </Pop>
        <Pop at={wt('привычная') - 0.3} dy={14} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18, padding: '22px 28px', borderRadius: 26, background: C.white, boxShadow: '0 14px 34px rgba(19,41,61,0.1)' }}>
          <Circle Icon={IconHeart} color={C.coral} size={80} iconColor={C.white} />
          <span style={{ ...font, color: C.textDark, fontWeight: 800, fontSize: 34, lineHeight: 1.15 }}>привычная нагрузка — пока с трудом</span>
        </Pop>
      </div>
    </At>
  </>
);

// ── Сцена 4: норматив ─────────────────────────────────────────────────────
const Scene4 = () => (
  <>
    <At from={B[3]} to={B[4]}>
      <Gradient from={C.ink} to={C.navy} angle={150} />
      <StageBar at={B[3]} />
      <div style={{ position: 'absolute', left: 170, top: 250, width: 380, height: 380, borderRadius: 190, background: ST3, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 80px ${ST3}88` }}>
        <IconClock size={230} color={C.white} stroke={3.5} />
      </div>
      <div style={{ position: 'absolute', left: 660, top: 230, width: 1150 }}>
        <Pop at={B[3] + 0.15}><span style={{ ...font, fontWeight: 700, fontSize: 42, color: C.mintSoft }}>Занятия на 3 этапе</span></Pop>
        <Pop at={wt('реже') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 72 }}>не реже 1 раза в 2 суток</span></Pop>
        <Pop at={wt('менее') - 0.3} style={{ marginTop: 18 }}><span style={{ ...font, fontWeight: 800, fontSize: 112, color: C.sun }}>не менее 3 часов</span></Pop>
        <Pop at={B[3] + 0.8} style={{ marginTop: 36 }}><span style={{ ...font, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,0.55)' }}>Порядок организации медицинской реабилитации взрослых (Приказ Минздрава № 788н)</span></Pop>
      </div>
    </At>
  </>
);

// ── Сцена 5: как проходит курс ────────────────────────────────────────────
const tKind = wt('занятия', 3) - 0.4, tRoles = wt('инструктор') - 0.4;
const Step: React.FC<{ at: number; n: number; text: string; color: string }> = ({ at, n, text, color }) => (
  <Pop at={at - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 26 }}>
    <div style={{ width: 66, height: 66, borderRadius: 33, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ ...font, fontWeight: 800, fontSize: 38, color: C.navy }}>{n}</span></div>
    <span style={{ ...font, fontWeight: 800, fontSize: 44, lineHeight: 1.12 }}>{text}</span>
  </Pop>
);
const RoleRow: React.FC<{ at: number; Icon: IconT; color: string; title: string; text: string }> = ({ at, Icon, color, title, text }) => (
  <Pop at={at - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 26px', borderRadius: 26, background: 'rgba(255,255,255,0.09)', border: '2px solid rgba(255,255,255,0.15)', marginBottom: 20 }}>
    <Circle Icon={Icon} color={color} size={86} />
    <div>
      <div style={{ ...font, fontWeight: 800, fontSize: 40, lineHeight: 1.1 }}>{title}</div>
      <div style={{ ...font, fontWeight: 600, fontSize: 31, color: C.mintSoft, marginTop: 6 }}>{text}</div>
    </div>
  </Pop>
);
const Scene5 = () => (
  <>
    <At from={B[4]} to={tKind} fadeOut={0.3}>
      <Gradient from={C.navy} to={C.teal} />
      <Frame x={1000} y={150} w={820} h={560}><Photo src={P.bike} focus="center" /></Frame>
      <StageBar at={B[4]} />
      <div style={{ position: 'absolute', left: 110, top: 150, width: 860 }}>
        <Pop at={B[4] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 54, color: C.mint }}>Как и на втором этапе</span></Pop>
        <Step at={wt('оценивает')} n={1} color={C.sky} text="оценка вашего состояния" />
        <Step at={wt('цель')} n={2} color={C.sun} text="цель — вместе с вами" />
        <Step at={wt('индивидуальный')} n={3} color={C.mint} text="индивидуальный план медицинской реабилитации (ИПМР)" />
      </div>
    </At>
    <At from={tKind} to={tRoles} fadeOut={0.3}>
      <Photo src={P.group} focus="center" />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.85) 0%, rgba(11,37,69,0.3) 30%, rgba(11,37,69,0) 50%)' }} />
      <div style={{ position: 'absolute', left: 110, top: 60, display: 'flex', alignItems: 'center', gap: 20 }}>
        <Pop at={tKind + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 56 }}>Занятия:</span></Pop>
        <Pop at={wt('индивидуальные') - 0.3}><Chip bg={C.sky} color={C.navy} size={50}>индивидуальные</Chip></Pop>
        <Pop at={wt('групповые') - 0.3}><Chip size={50}>групповые</Chip></Pop>
      </div>
    </At>
    <At from={tRoles} to={B[5]}>
      <Gradient from={C.ink} to={C.navy} angle={160} />
      <Frame x={90} y={150} w={780} h={560}><Photo src={P.ergo} focus="center" /></Frame>
      <StageBar at={tRoles} />
      <div style={{ position: 'absolute', left: 930, top: 140, width: 900 }}>
        <RoleRow at={wt('инструктор')} Icon={IconWalk} color={C.mint} title="Инструктор ЛФК" text="восстанавливает движение" />
        <RoleRow at={wt('эрготерапевт')} Icon={IconShirt} color={C.sky} title="Эрготерапевт" text="помогает с бытовыми навыками" />
        <RoleRow at={wt('психолог')} Icon={IconBrain} color={C.coral} title="Клинический психолог и логопед" text="там, где это необходимо" />
        <RoleRow at={wt('физиотерапию')} Icon={IconThermometer} color={C.sun} title="Физиотерапия" text="по показаниям" />
      </div>
    </At>
  </>
);

// ── Сцена 6: задача третьего этапа ────────────────────────────────────────
const Goal: React.FC<{ at: number; src: string; text: string; focus?: string }> = ({ at, src, text, focus = 'center' }) => {
  const a = useAppearAt(at - 0.3);
  return (
    <div style={{ width: 405, opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>
      <div style={{ width: 405, height: 400, borderRadius: 26, overflow: 'hidden', boxShadow: '0 18px 44px rgba(0,0,0,0.3)', position: 'relative' }}><Photo src={src} focus={focus} zoom={0.05} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: C.sun, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconCheck size={28} color={C.navy} stroke={7} /></div>
        <span style={{ ...font, fontWeight: 800, fontSize: 32, lineHeight: 1.1 }}>{text}</span>
      </div>
    </div>
  );
};
const Scene6 = () => (
  <>
    <At from={B[5]} to={B[6]}>
      <Gradient from={C.navy} to={C.teal} angle={150} />
      <Pop at={B[5] + 0.1} style={{ position: 'absolute', left: 110, top: 70, width: 1500 }}>
        <span style={{ ...font, fontWeight: 700, fontSize: 40, color: C.mintSoft }}>Задача третьего этапа</span>
        <div style={{ ...font, fontWeight: 800, fontSize: 64, marginTop: 6 }}>вернуться к <span style={{ color: C.sun }}>обычной повседневной жизни</span></div>
      </Pop>
      <div style={{ position: 'absolute', left: 112, top: 280, display: 'flex', gap: 25 }}>
        <Goal at={wt('полностью')} src={P.selfCare} focus="62% center" text="полностью обслуживать себя" />
        <Goal at={wt('общественным')} src={P.bus} focus="50% center" text="общественный транспорт" />
        <Goal at={wt('покупки')} src={P.shop} focus="42% center" text="покупки в магазине" />
        <Goal at={wt('работе')} src={P.work} focus="70% center" text="по возможности — работа" />
      </div>
    </At>
  </>
);

// ── Сцена 7: если добираться трудно ───────────────────────────────────────
const Scene7 = () => (
  <>
    <At from={B[6]} to={B[7]}>
      <Photo src={P.homeVisit} focus="center" />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,37,69,0.88) 0%, rgba(11,37,69,0.45) 30%, rgba(11,37,69,0) 52%)' }} />
      <div style={{ position: 'absolute', left: 110, top: 60, display: 'flex', gap: 24, flexWrap: 'wrap', width: 1700 }}>
        <Pop at={wt('дому') - 0.4} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px', borderRadius: 26, background: 'rgba(11,37,69,0.85)', border: '2px solid rgba(255,255,255,0.18)' }}>
          <Circle Icon={IconHome} color={C.mint} size={70} />
          <div>
            <div style={{ ...font, fontWeight: 800, fontSize: 38 }}>на дому — по решению врачебной комиссии</div>
            <div style={{ ...font, fontWeight: 600, fontSize: 24, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Приказ Минздрава № 81н</div>
          </div>
        </Pop>
        <Pop at={wt('жителям') - 0.3} dy={14} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px', borderRadius: 26, background: 'rgba(11,37,69,0.85)', border: '2px solid rgba(255,255,255,0.18)' }}>
          <Circle Icon={IconBuilding} color={C.sky} size={70} />
          <span style={{ ...font, fontWeight: 800, fontSize: 38 }}>отдалённым районам — в стационаре</span>
        </Pop>
      </div>
    </At>
  </>
);

// ── Сцена 8: что зависит от вас ───────────────────────────────────────────
const Scene8 = () => (
  <>
    <At from={B[7]} to={B[8]}>
      <Gradient from={C.navy} to={C.ink} angle={160} />
      <Frame x={80} y={130} w={1000} h={600}><Photo src={P.homework} focus="center" /></Frame>
      <div style={{ position: 'absolute', left: 1140, top: 170, width: 700 }}>
        <Pop at={B[7] + 0.1}><span style={{ ...font, fontWeight: 800, fontSize: 72, lineHeight: 1.05 }}>Многое зависит<br /><span style={{ color: C.sun }}>от вас</span></span></Pop>
        <Pop at={wt('задания') - 0.3} style={{ marginTop: 40 }}><Chip bg="rgba(255,255,255,0.14)" color={C.white} size={38}>задания команды</Chip></Pop>
        <Pop at={wt('старайтесь') - 0.3} style={{ marginTop: 18 }}><Chip bg="rgba(255,255,255,0.14)" color={C.white} size={38}>каждый день — сами</Chip></Pop>
      </div>
    </At>
  </>
);

// ── Сцена 9: эпикриз и анонс ──────────────────────────────────────────────
const tNext = wt('следующем') - 0.5;
const Scene9 = () => (
  <>
    <At from={B[8]} to={tNext} fadeOut={0.3}>
      <AbsoluteFill style={{ background: C.paper }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 160 }}>
        <Pop at={B[8] + 0.1} style={{ display: 'flex', alignItems: 'center', gap: 44, background: C.white, borderRadius: 34, boxShadow: '0 24px 60px rgba(19,41,61,0.14)', padding: '44px 60px' }}>
          <div style={{ width: 200, height: 200, borderRadius: 100, background: ST3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconDoc size={120} color={C.white} stroke={4} /></div>
          <div>
            <div style={{ ...font, color: ST3, fontWeight: 800, fontSize: 32 }}>в конце курса</div>
            <div style={{ ...font, color: C.navy, fontWeight: 800, fontSize: 62, lineHeight: 1.08, marginTop: 4 }}>Реабилитационный эпикриз</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 22 }}>
              <Pop at={wt('оценивает', 2) - 0.2} dy={10}><Chip bg={C.sky} color={C.navy} size={36}>оценка результата</Chip></Pop>
              <Pop at={wt('эпикриз') - 0.2} dy={10}><Chip size={36}>рекомендации</Chip></Pop>
            </div>
          </div>
        </Pop>
      </AbsoluteFill>
    </At>
    <At from={tNext} to={END} fadeOut={0.6}><NextCard at={tNext} title={<>Кто будет с вами работать:<br /><span style={{ color: C.mint }}>команда специалистов</span></>} /></At>
  </>
);

const Music = () => {
  const f = useCurrentFrame();
  return <Audio src={staticFile('episodes/06/music.wav')} volume={() => 0.12 * interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })} />;
};

export const Ep06: React.FC = () => (
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
    <Audio src={staticFile('episodes/06/voice.wav')} />
    <Music />
  </AbsoluteFill>
);
