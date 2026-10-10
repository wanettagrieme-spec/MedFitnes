import React from 'react';
import { AbsoluteFill, Easing, interpolate, Loop, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, fontFamily, sec } from './theme';
import type { Page } from './captions';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Начало текущего отрезка (секунды от начала ролика) — чтобы внутри задавать моменты в абсолютном времени
const StartCtx = React.createContext(0);

// Отрезок абсолютного времени ролика (в секундах); fadeIn — плавное появление поверх предыдущего
export const At: React.FC<{ from: number; to: number; fadeIn?: number; fadeOut?: number; children: React.ReactNode }> = ({ from, to, fadeIn = 0.3, fadeOut = 0, children }) => {
  const parent = React.useContext(StartCtx);              // вложенный отрезок: Sequence считает от начала родителя
  const absStartF = Math.max(sec(parent), sec(from - fadeIn));
  const durF = Math.max(1, sec(to) - absStartF);
  return (
    <Sequence from={absStartF - sec(parent)} durationInFrames={durF} layout="none">
      <StartCtx.Provider value={absStartF / 30}>
        <Fade inFrames={sec(fadeIn)} outFrames={sec(fadeOut)} total={durF}>{children}</Fade>
      </StartCtx.Provider>
    </Sequence>
  );
};

const Fade: React.FC<{ inFrames: number; outFrames: number; total: number; children: React.ReactNode }> = ({ inFrames, outFrames, total, children }) => {
  const f = useCurrentFrame();
  const a = inFrames > 0 ? interpolate(f, [0, inFrames], [0, 1], clamp) : 1;
  const b = outFrames > 0 ? interpolate(f, [total - outFrames, total], [1, 0], clamp) : 1;
  return <AbsoluteFill style={{ opacity: a * b }}>{children}</AbsoluteFill>;
};

// Появление в абсолютный момент ролика absT (секунды) — 0…1 пружиной
export const useAppearAt = (absT: number, dur = 0.55) => {
  const start = React.useContext(StartCtx);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - sec(absT - start), fps, config: { damping: 200 }, durationInFrames: Math.max(1, sec(dur)) });
};

// Появление элемента в момент t (секунды от начала текущего отрезка)
export const useAppear = (t: number, dur = 0.5) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - sec(t), fps, config: { damping: 200 }, durationInFrames: Math.max(1, sec(dur)) });
};

// Стоковый кадр: заполняет блок, медленный наезд камеры; если кадр короче отрезка — повторяется
export const Clip: React.FC<{ src: string; from?: number; clipLen?: number; focus?: string; zoom?: number; style?: React.CSSProperties; dim?: number; rate?: number }> = ({ src, from = 0, clipLen, focus = 'center', zoom = 0.06, style, dim = 0, rate = 1 }) => {
  const f = useCurrentFrame();
  const scale = 1.03 + Math.min(zoom, (f / sec(10)) * zoom);
  const video = (
    <OffthreadVideo
      src={staticFile(src)}
      muted
      trimBefore={sec(from)}
      playbackRate={rate}
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${scale})` }}
    />
  );
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#000', ...style }}>
      {clipLen ? <Loop durationInFrames={sec((clipLen - from) / rate)}>{video}</Loop> : video}
      {dim > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(5,15,25,${dim})` }} />}
    </AbsoluteFill>
  );
};

// Субтитры: сказанные слова — белые, текущее — жёлтое, следующие — приглушённые
export const Captions: React.FC<{ pages: Page[]; bottom?: number; fontSize?: number; maxWidth?: number }> = ({ pages, bottom = 64, fontSize = 50, maxWidth = 1500 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const page = pages.find(p => ms >= p.startMs && ms < p.endMs);
  if (!page) return null;
  const a = interpolate(ms - page.startMs, [0, 140], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: bottom, pointerEvents: 'none' }}>
      <div style={{
        maxWidth, padding: '14px 30px', borderRadius: 20, background: 'rgba(8,20,32,0.74)',
        fontFamily, fontWeight: 700, fontSize, lineHeight: 1.28, color: C.white, textAlign: 'center',
        opacity: a, transform: `translateY(${(1 - a) * 12}px)`, boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
      }}>
        {page.words.map((w, i) => {
          const spoken = ms >= w.endMs, now = ms >= w.startMs && ms < w.endMs;
          return <span key={i} style={{ color: now ? C.sun : spoken ? C.white : 'rgba(255,255,255,0.55)' }}>{w.text}{i < page.words.length - 1 ? ' ' : ''}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// Линия кардиограммы, которая «пишется» слева направо
export const EcgLine: React.FC<{ y?: number; color?: string; duration?: number; opacity?: number; width?: number }> = ({ y = 760, color = C.mint, duration = 4, opacity = 0.9, width = 5 }) => {
  const f = useCurrentFrame();
  const W = 1920, P = 420;
  const shape = (x: number) => {
    const u = ((x + 60) % P) / P;
    const bump = (c: number, w: number, h: number) => h * Math.exp(-(((u - c) / w) ** 2));
    let v = bump(0.2, 0.03, 0.12) + bump(0.68, 0.05, 0.22);
    if (u > 0.4 && u < 0.52) v += u < 0.425 ? -0.12 * (u - 0.4) / 0.025 : u < 0.455 ? -0.12 + 1.12 * (u - 0.425) / 0.03 : u < 0.485 ? 1 - 1.35 * (u - 0.455) / 0.03 : -0.35 + 0.35 * (u - 0.485) / 0.035;
    return y - v * 110;
  };
  const head = interpolate(f, [0, sec(duration)], [0, W], clamp);
  let d = '';
  for (let x = 0; x <= head; x += 4) d += `${x === 0 ? 'M' : 'L'}${x},${shape(x).toFixed(1)} `;
  return (
    <svg width={W} height={1080} style={{ position: 'absolute', inset: 0, opacity }}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      {head > 0 && head < W && <circle cx={head} cy={shape(head)} r={9} fill="#fff" style={{ filter: `drop-shadow(0 0 14px ${color})` }} />}
    </svg>
  );
};

export const fadeOutAt = (f: number, endFrame: number, frames = 15) => interpolate(f, [endFrame - frames, endFrame], [1, 0], clamp);
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
