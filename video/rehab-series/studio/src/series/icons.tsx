import React from 'react';

// Простые линейные иконки серии (viewBox 64×64)
type P = { size?: number; color?: string; stroke?: number };
const Svg: React.FC<P & { children: React.ReactNode }> = ({ size = 64, color = '#fff', stroke = 4, children }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

export const IconWalk: React.FC<P> = p => <Svg {...p}><circle cx="34" cy="9" r="5" /><path d="M32 16 L28 34 L36 42 L38 58" /><path d="M28 34 L22 46 L16 58" /><path d="M30 20 L20 28 L18 36" /><path d="M31 21 L40 30 L48 30" /></Svg>;
export const IconShirt: React.FC<P> = p => <Svg {...p}><path d="M22 8 L32 14 L42 8 L56 18 L50 28 L44 25 L44 56 L20 56 L20 25 L14 28 L8 18 Z" /></Svg>;
export const IconBriefcase: React.FC<P> = p => <Svg {...p}><rect x="8" y="20" width="48" height="34" rx="5" /><path d="M24 20 V13 a3 3 0 0 1 3 -3 H37 a3 3 0 0 1 3 3 V20" /><path d="M8 34 H56" /></Svg>;
export const IconHeart: React.FC<P> = p => <Svg {...p}><path d="M32 54 C 12 40 6 30 8 20 C 10 11 22 8 32 18 C 42 8 54 11 56 20 C 58 30 52 40 32 54 Z" /></Svg>;
export const IconDoctor: React.FC<P> = p => <Svg {...p}><path d="M18 8 V24 a10 10 0 0 0 20 0 V8" /><path d="M28 34 V42 a10 10 0 0 0 20 0 V36" /><circle cx="48" cy="31" r="5" /></Svg>;
export const IconDumbbell: React.FC<P> = p => <Svg {...p}><path d="M20 32 H44" /><rect x="10" y="20" width="10" height="24" rx="3" /><rect x="44" y="20" width="10" height="24" rx="3" /><path d="M6 26 V38 M58 26 V38" /></Svg>;
export const IconHand: React.FC<P> = p => <Svg {...p}><path d="M20 34 V14 a4 4 0 0 1 8 0 V30 M28 12 a4 4 0 0 1 8 0 V30 M36 14 a4 4 0 0 1 8 0 V32 M44 22 a4 4 0 0 1 8 0 V38 C 52 50 44 58 34 58 C 26 58 20 54 16 46 L10 36 a4 4 0 0 1 7 -4 L20 36" /></Svg>;
export const IconBrain: React.FC<P> = p => <Svg {...p}><path d="M30 10 C 22 8 14 14 16 22 C 8 24 8 36 15 38 C 12 46 20 54 30 50 Z" /><path d="M34 10 C 42 8 50 14 48 22 C 56 24 56 36 49 38 C 52 46 44 54 34 50 Z" /><path d="M32 10 V52" /></Svg>;
export const IconSpeech: React.FC<P> = p => <Svg {...p}><path d="M10 14 H54 a4 4 0 0 1 4 4 V40 a4 4 0 0 1 -4 4 H28 L16 54 V44 H10 a4 4 0 0 1 -4 -4 V18 a4 4 0 0 1 4 -4 Z" /><path d="M18 26 H46 M18 33 H38" /></Svg>;
export const IconNurse: React.FC<P> = p => <Svg {...p}><rect x="10" y="10" width="44" height="44" rx="10" /><path d="M32 20 V44 M20 32 H44" /></Svg>;
export const IconPerson: React.FC<P> = p => <Svg {...p}><circle cx="32" cy="18" r="9" /><path d="M14 56 C 14 42 22 34 32 34 C 42 34 50 42 50 56" /></Svg>;
export const IconFamily: React.FC<P> = p => <Svg {...p}><circle cx="22" cy="18" r="7" /><circle cx="44" cy="20" r="6" /><path d="M8 54 C 8 40 14 32 22 32 C 30 32 36 40 36 54" /><path d="M34 40 C 36 34 40 31 44 31 C 52 31 57 38 57 50" /></Svg>;
export const IconCheck: React.FC<P> = p => <Svg {...p}><path d="M12 34 L26 48 L52 18" /></Svg>;
export const IconBed: React.FC<P> = p => <Svg {...p}><path d="M6 48 V16 M6 38 H58 V48" /><rect x="12" y="26" width="12" height="8" rx="3" /><path d="M28 34 V28 H52 a6 6 0 0 1 6 6" /></Svg>;
export const IconBuilding: React.FC<P> = p => <Svg {...p}><rect x="12" y="10" width="40" height="46" rx="3" /><path d="M32 18 V30 M26 24 H38" /><path d="M26 56 V44 H38 V56" /></Svg>;
export const IconHome: React.FC<P> = p => <Svg {...p}><path d="M8 30 L32 10 L56 30" /><path d="M14 26 V54 H50 V26" /><path d="M27 54 V40 H37 V54" /></Svg>;
export const IconThermometer: React.FC<P> = p => <Svg {...p}><path d="M26 38 V12 a6 6 0 0 1 12 0 V38 a11 11 0 1 1 -12 0 Z" /><path d="M32 22 V44" /><circle cx="32" cy="47" r="4" /></Svg>;
export const IconGauge: React.FC<P> = p => <Svg {...p}><path d="M10 44 a22 22 0 1 1 44 0" /><path d="M32 44 L44 26" /><circle cx="32" cy="44" r="3" /><path d="M16 44 H20 M44 44 H48 M32 20 V24" /></Svg>;
export const IconBone: React.FC<P> = p => <Svg {...p}><path d="M20 44 L44 20" /><circle cx="15" cy="44" r="6" /><circle cx="20" cy="50" r="6" /><circle cx="44" cy="14" r="6" /><circle cx="50" cy="20" r="6" /></Svg>;
export const IconLungs: React.FC<P> = p => <Svg {...p}><path d="M32 8 V30 M32 30 L24 36 M32 30 L40 36" /><path d="M26 20 C 16 18 8 30 8 44 C 8 52 14 54 20 52 C 26 50 26 44 26 36 Z" /><path d="M38 20 C 48 18 56 30 56 44 C 56 52 50 54 44 52 C 38 50 38 44 38 36 Z" /></Svg>;
