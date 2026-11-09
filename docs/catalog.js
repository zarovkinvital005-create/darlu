const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rub = (v, from) => (from ? 'от ' : '') + v.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';

/* ---------- фильтры ---------- */
const WHO = {
  'Любимым': ['девушке', 'парню', 'жене', 'мужу'],
  'Родным': ['маме', 'папе', 'сестре', 'брату', 'бабушке', 'дедушке', 'тёте', 'дяде'],
  'Друзьям': ['подруге', 'другу'],
  'Коллеге': ['коллеге'],
};
const PRICE = { 'до 1 000 ₽': [0, 1000], '1 000–3 000 ₽': [1000, 3000], '3 000–5 000 ₽': [3000, 5000], 'от 5 000 ₽': [5000, 1e9] };
const OPTS = {
  cat: Object.values(CATS),
  occ: ['День рождения', 'Новый год', '14 февраля', '8 марта', '23 февраля', 'Годовщина', 'Выпускной', 'С именем'],
  who: Object.keys(WHO),
  price: Object.keys(PRICE),
};
const F = { cat: '', occ: '', who: '', price: '', q: '', sort: 'pop' };

// фильтры из адреса: catalog.html?occ=8 марта, ?who=Друзьям, ?max=2000, ?cat=Журналы, ?p=id (открыть товар)
const U = new URLSearchParams(location.search);
['cat', 'occ', 'who'].forEach((k) => { if (OPTS[k].includes(U.get(k))) F[k] = U.get(k); });
if (U.get('max') === '2000') F.price = 'max2000'; // круг «До 2 000 ₽» на главной

document.querySelectorAll('.chips2').forEach((box) => {
  const k = box.dataset.f;
  box.innerHTML = ['Все', ...OPTS[k]].map((o) => `<button type="button" data-v="${o === 'Все' ? '' : esc(o)}">${esc(o)}</button>`).join('');
  box.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; F[k] = F[k] === b.dataset.v ? '' : b.dataset.v; render(); };
});
$('#q').oninput = (e) => { F.q = e.target.value.trim().toLowerCase(); render(); };
$('#sort').onchange = (e) => { F.sort = e.target.value; render(); };
$('#reset').onclick = () => { Object.assign(F, { cat: '', occ: '', who: '', price: '', q: '' }); $('#q').value = ''; render(); };

function match(p) {
  if (F.cat && CATS[p.cat] !== F.cat) return false;
  if (F.occ && !p.tags.includes(F.occ.toLowerCase())) return false;
  if (F.who && !p.tags.some((t) => WHO[F.who].includes(t))) return false;
  if (F.price === 'max2000') { if (p.p > 2000) return false; }
  else if (F.price) { const [a, b] = PRICE[F.price]; if (p.p < a || p.p >= b) return false; }
  if (F.q && !(p.n + ' ' + p.b + ' ' + CATS[p.cat] + ' ' + p.d).toLowerCase().includes(F.q)) return false;
  return true;
}
function render() {
  document.querySelectorAll('.chips2').forEach((box) => {
    const v = F[box.dataset.f];
    box.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === v || (v === 'max2000' && b.dataset.v === '')));
  });
  let list = products.filter(match);
  if (F.sort === 'asc') list = [...list].sort((a, b) => a.p - b.p);
  if (F.sort === 'desc') list = [...list].sort((a, b) => b.p - a.p);
  if (F.sort === 'pop') list = [...list].sort((a, b) => (b.hit ? 1 : 0) - (a.hit ? 1 : 0));
  const n = list.length;
  $('#count').textContent = F.price === 'max2000' ? `До 2 000 ₽ · ${n} ${word(n)}` : `${n} ${word(n)}`;
  $('#reset').hidden = !(F.cat || F.occ || F.who || F.price || F.q);
  $('#empty').hidden = n > 0;
  $('#grid').innerHTML = list.map((p) => `
    <div class="cardw">
      <button type="button" class="res prod2" data-id="${p.id}" aria-label="${esc(p.n)}, ${rub(p.p, p.from)}">
        ${p.hit ? '<span class="hit-tag">Хит</span>' : ''}
        <img src="${p.img}" alt="${esc(p.n)}" loading="lazy">
        <div class="res-b"><small>${esc(p.b)}</small><b>${esc(p.n)}</b><span class="res-p">${rub(p.p, p.from)}</span></div>
      </button>
      <button type="button" class="heart" data-fav-id="${p.id}" aria-label="В избранное"><svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg></button>
    </div>`).join('');
  if (typeof Auth !== 'undefined') Auth.paint();
}
const word = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'товар' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'товара' : 'товаров');

/* ---------- карточка товара (как на полке «Хиты недели») ---------- */
const pdp = $('#pdp'), spin = pdp.querySelector('.spin');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.2,.8,.2,1)';
let openBtn = null;
function flip(el, from, dur, rev) {
  const to = el.getBoundingClientRect();
  const t = `translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width})`;
  return el.animate(rev ? [{ transform: 'none' }, { transform: t }] : [{ transform: t }, { transform: 'none' }], { duration: dur, easing: EASE, fill: 'both' });
}
function openProduct(id, btn) {
  const p = products.find((x) => x.id === id); if (!p) return;
  openBtn = btn || null;
  $('#pdpBrand').textContent = p.b; $('#pdpName').textContent = p.n; $('#pdpPrice').textContent = rub(p.p, p.from);
  $('#pdpDesc').textContent = p.d; $('#pdpList').innerHTML = p.l.map((x) => `<li>${esc(x)}</li>`).join('');
  $('#pdpCat').textContent = CATS[p.cat] + (p.hit ? ' · хит недели' : '');
  spin.innerHTML = `<img src="${p.img}" alt="${esc(p.n)}">`;
  const from = btn && btn.querySelector('img').getBoundingClientRect();
  pdp.hidden = false; document.body.classList.add('lock');
  if (btn) btn.classList.add('gone');
  if (!still && from) {
    flip(spin.firstChild, from, 600);
    spin.animate([{ transform: 'rotateY(0)' }, { transform: 'rotateY(360deg)' }], { duration: 1000, easing: 'ease-in-out' });
  }
  history.replaceState(null, '', '?p=' + id);
  if (typeof Auth !== 'undefined') Auth.bind($('#pdpFav'), p.id);
  $('#pdpBack').focus({ preventScroll: true });
}
function closeProduct() {
  if (pdp.hidden) return;
  const btn = openBtn; openBtn = null;
  const done = () => { pdp.hidden = true; document.body.classList.remove('lock'); if (btn) { btn.classList.remove('gone'); btn.focus({ preventScroll: true }); } history.replaceState(null, '', location.pathname); };
  const target = btn && document.body.contains(btn) ? btn.querySelector('img').getBoundingClientRect() : null;
  if (still || !target) return done();
  const a = flip(spin.firstChild, target, 450, true);
  pdp.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-in' });
  a.onfinish = done;
}
$('#grid').onclick = (e) => { const b = e.target.closest('.prod2'); if (b) openProduct(b.dataset.id, b); };
$('#pdpBack').onclick = closeProduct;
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProduct(); });

render();
if (U.get('p')) { const b = document.querySelector(`.prod2[data-id="${CSS.escape(U.get('p'))}"]`); openProduct(U.get('p'), b); }
