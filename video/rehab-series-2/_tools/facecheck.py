"""Проверка кадров детектором YuNet: сколько лиц, запас над верхом головы (% высоты). Запуск: python3 facecheck.py img1.png ..."""
import sys, os, cv2
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yunet.onnx')
for p in sys.argv[1:]:
    im = cv2.imread(p); h, w = im.shape[:2]
    d = cv2.FaceDetectorYN.create(M, '', (w, h), 0.6, 0.3, 5000); _, f = d.detect(im)
    if f is None: print(os.path.basename(p), 'лиц нет'); continue
    out = []
    for r in f:
        x, y, fw, fh = r[:4]; top = (y - 0.6 * fh) / h * 100
        out.append(f'лицо {int(fw)}x{int(fh)} запас {top:.1f}%' + (' ОШИБКА' if top < 4 else ''))
    print(os.path.basename(p), len(f), '; '.join(out))
