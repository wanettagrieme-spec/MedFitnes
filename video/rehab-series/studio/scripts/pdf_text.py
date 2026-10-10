# Постраничный текст из PDF (проверенный приём из вики: pypdf.extract_text).
# usage: python -I scripts/pdf_text.py <file.pdf> [первая] [последняя]
import sys
from pypdf import PdfReader

r = PdfReader(sys.argv[1])
a = int(sys.argv[2]) if len(sys.argv) > 2 else 1
b = int(sys.argv[3]) if len(sys.argv) > 3 else len(r.pages)
print(f"страниц: {len(r.pages)}")
for i in range(a - 1, min(b, len(r.pages))):
    print(f"=== стр. {i + 1}")
    print(r.pages[i].extract_text() or "")
