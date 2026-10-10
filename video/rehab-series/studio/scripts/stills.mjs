// Кадры-превью композиции в заданные секунды (один бандл на все кадры) + сводная картинка.
//   node scripts/stills.mjs Ep01 2 14 20 30 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const [id, ...times] = process.argv.slice(2);
const outDir = path.resolve('out/stills', id);
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id });
for (const t of times.map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = path.join(outDir, `${String(t).padStart(6, '0')}.jpeg`);
  await renderStill({ composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 85, scale: 0.5 });
  console.log(`${t} с → ${output}`);
}
