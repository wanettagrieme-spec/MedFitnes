import {bundle} from '@remotion/bundler';
import {renderStill,selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts')});
const browserExecutable=path.resolve('../video-studio/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const options={serveUrl,browserExecutable,chromiumOptions:{gl:'angle'}};
const composition=await selectComposition({...options,id:'Codex01'});
for(const t of [3,18,33,48,66,83]){
 await renderStill({...options,composition,frame:Math.min(composition.durationInFrames-1,Math.round(t*30)),output:`out/preview-${t}.png`,scale:.5});
 console.log(`Новая сцена проверена: ${t} с`);
}
