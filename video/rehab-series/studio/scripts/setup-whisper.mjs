// Ставит whisper.cpp и модель распознавания речи в ./whisper.cpp
// Запуск: PATH="$PWD/tools/venv/bin:$PATH" node scripts/setup-whisper.mjs
import { downloadWhisperModel, installWhisperCpp } from '@remotion/install-whisper-cpp';
import path from 'node:path';

export const WHISPER_PATH = path.resolve('whisper.cpp');
export const WHISPER_VERSION = '1.9.5';
export const WHISPER_MODEL = 'large-v3-turbo';

await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });
console.log('Whisper готов:', WHISPER_PATH, WHISPER_VERSION, WHISPER_MODEL);
