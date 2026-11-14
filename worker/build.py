"""Собирает worker/worker.js: вшивает актуальный каталог из docs/products.js в шаблон."""
import json, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'docs' / 'products.js').read_text(encoding='utf8')
items = []
for blk in re.split(r'\n  \{ n: ', src)[1:]:
    blk = '{ n: ' + blk
    g = lambda pat: (re.search(pat, blk) or [None, ''])[1]
    n, b, p, i = g(r"n: '((?:[^'\\]|\\.)*)'"), g(r"b: '((?:[^'\\]|\\.)*)'"), g(r"p: (\d+)"), g(r"id: '([^']+)'")
    tags = g(r"tags: \[(.*?)\]")
    if not i or not p: continue
    tags = ', '.join(re.findall(r"'((?:[^'\\]|\\.)*)'", tags))
    d = g(r"d: '((?:[^'\\]|\\.)*)'")
    items.append(dict(id=i, n=n.replace("\\'", "'"), b=b.replace("\\'", "'"), p=int(p), tags=tags.replace("\\'", "'")))
tpl = (root / 'worker' / 'template.js').read_text(encoding='utf8')
(root / 'worker' / 'worker.js').write_text(tpl.replace('__CATALOG__', json.dumps(items, ensure_ascii=False)), encoding='utf8')
print(len(items), 'товаров, размер', (root / 'worker' / 'worker.js').stat().st_size // 1024, 'КБ')
