// usage: node render.mjs <page.html> <out.mp4> [--stills t1,t2,... <outDir>]
import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const [, , htmlPath, outPath, flag, stillTimes, stillDir] = process.argv;
const FPS = 30, DUR = 10;

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--force-device-scale-factor=1', '--hide-scrollbars'],
});
const page = await browser.newPage();
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.setViewport({ width: 1920, height: 1080 });
await page.goto(pathToFileURL(htmlPath).href + '?capture=1', { waitUntil: 'networkidle0', timeout: 30000 });
await page.evaluate(() => window.ready);
console.log('Manrope loaded:', await page.evaluate(() => document.fonts.check('800 100px Manrope')));

const grab = t => page.evaluate(t => {
  window.renderFrame(t);
  return document.getElementById('c').toDataURL('image/png').slice('data:image/png;base64,'.length);
}, t).then(b => Buffer.from(b, 'base64'));

if (flag === '--stills') {
  for (const t of stillTimes.split(',').map(Number)) {
    writeFileSync(`${stillDir}/frame_${t.toFixed(2)}.png`, await grab(t));
  }
} else {
  const ff = spawn(ffmpegPath, [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outPath,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise(r => ff.on('close', r));
  for (let i = 0; i < FPS * DUR; i++) {
    const buf = await grab(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`frame ${i}/${FPS * DUR}`);
  }
  ff.stdin.end();
  console.log('ffmpeg exit', await done);
}
await browser.close();
