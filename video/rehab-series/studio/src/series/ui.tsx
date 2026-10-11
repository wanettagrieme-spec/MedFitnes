import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EcgLine, useAppearAt } from './components';
import { C, fontFamily } from './theme';

// Общие элементы оформления серии (с выпуска 2; выпуск 1 пока содержит свои копии)
export const font: React.CSSProperties = { fontFamily, color: C.white, margin: 0 };

export const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number }> = ({ at, children, style, dy = 30 }) => {
  const a = useAppearAt(at);
  return <div style={{ opacity: a, transform: `translateY(${(1 - a) * dy}px)`, ...style }}>{children}</div>;
};

export const Strike: React.FC<{ at: number; color?: string }> = ({ at, color = C.coral }) => {
  const a = useAppearAt(at, 0.4);
  return <div style={{ position: 'absolute', left: -12, top: '52%', height: 8, width: `calc(${a * 100}% + 24px)`, background: color, borderRadius: 4, transform: 'rotate(-4deg)' }} />;
};

export const Gradient: React.FC<{ from: string; to: string; angle?: number }> = ({ from, to, angle = 135 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})` }}>
    <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)', backgroundSize: '42px 42px' }} />
  </AbsoluteFill>
);

export const Frame: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode; r?: number; style?: React.CSSProperties }> = ({ x, y, w, h, children, r = 28, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', ...style }}>{children}</div>
);

export const Chip: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({ children, bg = C.sun, color = C.navy, size = 34 }) => (
  <span style={{ ...font, fontWeight: 800, fontSize: size, color, background: bg, padding: '8px 22px', borderRadius: 40, display: 'inline-block' }}>{children}</span>
);

// Титульная карточка выпуска поверх видео (16:9)
export const TitleCard: React.FC<{ at: number; episode: number; line1: string; line2: string; sub: string; size?: number }> = ({ at, episode, line1, line2, sub, size = 118 }) => (
  <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.75) 55%, rgba(11,37,69,0.2) 100%)' }}>
    <div style={{ position: 'absolute', left: 130, top: 210 }}>
      <Pop at={at + 0.1}><Chip>Выпуск {episode}</Chip></Pop>
      <Pop at={at + 0.25} style={{ marginTop: 34 }}><h1 style={{ ...font, fontWeight: 800, fontSize: size, lineHeight: 1.02 }}>{line1}<br /><span style={{ color: C.mint }}>{line2}</span></h1></Pop>
      <Pop at={at + 0.6} style={{ marginTop: 30 }}><p style={{ ...font, fontWeight: 600, fontSize: 52, color: C.mintSoft }}>{sub}</p></Pop>
    </div>
  </AbsoluteFill>
);

// Финальная карточка — анонс следующего выпуска
export const NextCard: React.FC<{ at: number; title: React.ReactNode; vertical?: boolean }> = ({ at, title, vertical }) => (
  <AbsoluteFill>
    <Gradient from={C.navy} to={C.ink} angle={160} />
    <EcgLine y={vertical ? 1250 : 790} duration={3.5} opacity={0.6} />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: vertical ? 420 : 180, padding: vertical ? '0 70px 420px' : undefined }}>
      <Pop at={at + 0.2}><Chip size={38}>Следующий выпуск</Chip></Pop>
      <Pop at={at + 0.5} style={{ marginTop: 40, textAlign: 'center' }}><span style={{ ...font, fontWeight: 800, fontSize: vertical ? 84 : 100, lineHeight: 1.1 }}>{title}</span></Pop>
    </AbsoluteFill>
  </AbsoluteFill>
);
