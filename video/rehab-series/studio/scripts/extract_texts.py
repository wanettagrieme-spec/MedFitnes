# Текст из PDF (pypdf, постранично) и PPTX (XML слайдов) в папку .txt с маркерами страниц/слайдов.
# usage: python -I scripts/extract_texts.py <папка_источников> <папка_вывода>
import os, re, sys, zipfile, html
from pypdf import PdfReader

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for root, _, files in os.walk(src):
    for fn in sorted(files):
        p = os.path.join(root, fn)
        rel = os.path.relpath(p, src)
        name = re.sub(r'[/\\]', '__', rel)
        try:
            parts = []
            if fn.lower().endswith('.pdf'):
                r = PdfReader(p)
                for i, pg in enumerate(r.pages, 1):
                    try: t = pg.extract_text() or ''
                    except Exception as e: t = f'[ошибка страницы: {e}]'
                    parts.append(f'=== стр. {i}\n{t}')
                n = len(r.pages)
            elif fn.lower().endswith('.pptx'):
                z = zipfile.ZipFile(p)
                slides = sorted([s for s in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', s)], key=lambda s: int(re.findall(r'\d+', s)[-1]))
                for i, s in enumerate(slides, 1):
                    xml = z.read(s).decode('utf-8', 'ignore')
                    paras = [html.unescape(''.join(re.findall(r'<a:t>([^<]*)</a:t>', para))) for para in re.findall(r'<a:p>.*?</a:p>', xml, flags=re.S)]
                    parts.append(f'=== слайд {i}\n' + '\n'.join(x for x in paras if x.strip()))
                n = len(slides)
            else:
                continue
            text = '\n'.join(parts)
            open(os.path.join(out, name + '.txt'), 'w', encoding='utf-8').write(text)
            chars = len(re.sub(r'=== (стр|слайд)[^\n]*\n|\s', '', text))
            print(f'{n:4d} стр.  {chars:8d} симв.  {chars // max(n, 1):5d}/стр.  {rel}')
        except Exception as e:
            print(f'ОШИБКА {rel}: {e}')
