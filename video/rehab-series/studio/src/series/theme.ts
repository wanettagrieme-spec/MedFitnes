import { loadFont } from '@remotion/google-fonts/Manrope';

// Общий стиль серии. Палитра — разнообразная (по предпочтениям владелицы), без монохромной фиолетово-розовой гаммы.
export const { fontFamily } = loadFont('normal', { weights: ['500', '700', '800'], subsets: ['cyrillic', 'latin'] });

export const C = {
  navy: '#0b2545',
  ink: '#13293d',
  teal: '#0f766e',
  mint: '#5eead4',
  mintSoft: '#ccfbf1',
  coral: '#ff7b54',
  sun: '#ffd166',
  sky: '#8ecae6',
  skyDeep: '#219ebc',
  sand: '#fff4e6',
  paper: '#f4f8f7',
  white: '#ffffff',
  textDark: '#13293d',
  textMuted: '#4a6274',
};

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
