# Серия роликов о медицинской реабилитации — рабочий проект

Ролики собираются кодом: [Remotion](https://www.remotion.dev) (React → MP4), субтитры — Whisper (whisper.cpp).

## Установка
```bash
npm install
python3 -m venv tools/venv && tools/venv/bin/pip install cmake
PATH="$PWD/tools/venv/bin:$PATH" node scripts/setup-whisper.mjs   # whisper.cpp 1.9.5 + модель large-v3-turbo (~1,6 ГБ)
```

## Работа
```bash
npm run studio                                   # Remotion Studio: превью с таймлайном в браузере
npx remotion render src/index.ts <Композиция> out/<файл>.mp4
./whisper.cpp/build/bin/whisper-cli -m whisper.cpp/ggml-large-v3-turbo.bin -l ru -f <аудио 16 кГц>.wav
```

База знаний и решения по серии — Obsidian-вики `medfit-vault`, страница «Серия роликов о медицинской реабилитации».
