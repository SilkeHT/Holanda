"""Build assets/search-index.json from the site's pages.

Run after changing any page's text:  python3 tools/build_search_index.py
Each entry is one block of a page (a heading with the text under it, a
glossary term, an FAQ question...) so search results can point to the right spot.
"""
import json, os, re, glob
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = {'index.html', 'todo-lo-que-necesitas.html'}
HEADINGS = ['h1', 'h2', 'h3', 'h4']

def clean(t):
    return re.sub(r'\s+', ' ', t).strip()

def nearest_id(el):
    for parent in [el] + list(el.parents):
        if getattr(parent, 'get', None) and parent.get('id') and parent.name not in ('main', 'body', 'html'):
            return parent['id']
    return ''

import unicodedata

def slug(text):
    t = unicodedata.normalize('NFD', text.lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')[:60] or 'seccion'

def add_heading_ids(path):
    """Give every heading inside <main> its own id (kept stable once added)."""
    html = open(path, encoding='utf-8').read()
    soup = BeautifulSoup(html, 'html.parser')
    main = soup.find('main')
    if not main:
        return
    used = {el['id'] for el in soup.find_all(id=True)}
    changed = False
    for h in main.find_all(HEADINGS):
        if h.get('id'):
            continue
        base = slug(h.get_text()); new = base; i = 2
        while new in used:
            new = f'{base}-{i}'; i += 1
        used.add(new)
        # insert the id into the original markup, without re-serialising the page
        tag = re.escape(str(h).split('>', 1)[0] + '>')
        html, n = re.subn(tag, str(h).split('>', 1)[0] + f' id="{new}">', html, count=1)
        changed = changed or n == 1
    if changed:
        open(path, 'w', encoding='utf-8').write(html)

entries = []
for path in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
    if os.path.basename(path) not in SKIP and not os.path.basename(path).startswith('google'):
        add_heading_ids(path)
    name = os.path.basename(path)
    if name in SKIP or name.startswith('google'):
        continue
    soup = BeautifulSoup(open(path, encoding='utf-8').read(), 'html.parser')
    main = soup.find('main')
    if not main:
        continue
    for n in main.select('nav.pager, script, style, svg, .progress, .step-done'):
        n.decompose()
    page_title = clean((main.find('h1') or soup.title).get_text())

    # glossary terms and FAQ questions: one entry each
    for term in main.select('.term'):
        dt, dd = term.find('dt'), term.find('dd')
        entries.append({'p': name, 'pt': page_title, 'h': clean(dt.get_text()), 'a': nearest_id(term), 't': clean(dd.get_text())})
        term.decompose()
    for d in main.select('.faq details'):
        q = d.find('summary')
        entries.append({'p': name, 'pt': page_title, 'h': clean(q.get_text()), 'a': nearest_id(d), 't': clean(d.get_text().replace(q.get_text(), '', 1))})
        d.decompose()
    for s in main.select('details.more > summary'):
        t = clean(s.get_text()).replace('Leer más: ', '')
        s.string = t[:1].upper() + t[1:]
        s.name = 'h3'

    # everything else: split the text at headings
    current = {'h': page_title, 'a': nearest_id(main.find('h1') or main), 'parts': []}
    blocks = []
    for el in main.find_all(HEADINGS + ['p', 'li', 'dd', 'dt', 'td', 'th', 'caption', 'label']):
        if el.name in HEADINGS:
            blocks.append(current)
            current = {'h': clean(el.get_text()), 'a': nearest_id(el), 'parts': []}
        elif not el.find(['p', 'li']):
            current['parts'].append(clean(el.get_text()))
    blocks.append(current)
    for b in blocks:
        text = clean(' '.join(b['parts']))
        if text or b['h'] != page_title:
            entries.append({'p': name, 'pt': page_title, 'h': b['h'], 'a': b['a'], 't': text})

out = os.path.join(ROOT, 'assets', 'search-index.json')
json.dump(entries, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f'{len(entries)} entries, {os.path.getsize(out) // 1024} KB -> {out}')
