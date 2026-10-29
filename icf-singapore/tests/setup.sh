#!/bin/bash
# Один раз на компьютере: зависимости самотеста ICF SINGAPORE.
# Нужны Node.js 18+ и Python 3 (Python уже стоит на Mac, если работает база medfit-vault).
set -e
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Нет Node.js. На Mac: установить с nodejs.org (кнопка LTS) и запустить снова."; exit 1; }
npm install --no-fund --no-audit
npx playwright install chromium
python3 -m pip install --quiet --user pypdf pypdfium2 2>/dev/null || echo "(pypdf/pypdfium2 не установились — нужны только для /sverka и просмотра PDF)"
echo "Готово: node tests/selftest.mjs"
