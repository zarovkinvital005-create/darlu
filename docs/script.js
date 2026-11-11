/* ---------- Быстрый старт ---------- */
const S = (d) => `<svg viewBox="0 0 48 48">${d}</svg>`;
const occasions = [
  { t: 'День рождения', c: 't-blush', i: S('<rect class="f" x="9" y="25" width="30" height="15" rx="3"/><path d="M6 40h36M9 31c4 3 6-3 10 0s6-3 10 0 6-3 10 0M24 25v-6M24 9c-2 2-2 5 0 6 2-1 2-4 0-6z"/>') },
  { t: 'Новый год', c: 't-coral', i: S('<path d="M24 5l-9 12h5L12 29h8L10 41h28L28 29h8L28 17h5z"/><path d="M24 41v4"/>') },
  { t: 'Любимым', c: 't-navy', i: S('<path class="f" d="M18 38C8 31 5 24 5 19a8 8 0 0 1 13-6 8 8 0 0 1 13 6c0 5-3 12-13 19z" stroke="none" fill="#F4A8A0"/><path d="M30 41c-7-5-9-10-9-14a6 6 0 0 1 9-5 6 6 0 0 1 9 5c0 4-2 9-9 14z"/>') },
  { t: '14 февраля', c: 't-white', i: S('<path class="f" d="M24 38C12 30 8 23 8 18a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 5-4 12-16 20z"/><path d="M10 40L40 8M40 8h-9M40 8v9M10 40l-2-7M10 40l7 2"/>') },
  { t: '8 марта', c: 't-blush', i: S('<path d="M16 8l4 7 4-8 4 8 4-7v15a8 8 0 0 1-16 0z"/><path d="M24 31v13M24 38c-4-1-6-3-6-6M24 40c3-1 5-2 6-5"/>') },
  { t: 'Родным', c: 't-coral', i: S('<path d="M6 24L24 8l18 16"/><path d="M11 21v21h26V21"/><path class="f" d="M24 37c-6-4-8-7-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3-2 6-8 10z" stroke="none" fill="#F4A8A0"/><path d="M24 37c-6-4-8-7-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3-2 6-8 10z"/>') },
  { t: 'Друзьям', c: 't-navy', i: S('<circle cx="17" cy="15" r="6" fill="#F4A8A0" stroke="none"/><circle cx="17" cy="15" r="6"/><circle cx="32" cy="17" r="5"/><path d="M6 40c1-8 5-12 11-12s10 4 11 12M26 30c2-1 4-2 6-2 5 0 8 4 9 11"/>') },
  { t: 'До 2 000 ₽', c: 't-white', i: S('<ellipse cx="24" cy="36" rx="11" ry="5" fill="#F4A8A0"/><ellipse cx="24" cy="36" rx="11" ry="5"/><path d="M13 36v-5M35 36v-5M13 31c0 3 5 5 11 5s11-2 11-5-5-5-11-5-11 2-11 5z"/><path d="M20 22V8h6a4 4 0 0 1 0 8h-6M17 19h10"/>') },
  { t: 'С именем', c: 't-blush', i: S('<rect x="8" y="10" width="32" height="28" rx="5"/><path d="M16 31l5-14 5 14M18 27h6M30 31V17"/>') },
  { t: 'Коллеге', c: 't-coral', i: S('<rect x="8" y="16" width="32" height="22" rx="4"/><path d="M18 16v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3M8 26h32"/>') },
];
// круг -> каталог с нужным фильтром
const occLink = (t) => ({ 'Любимым': 'who=Любимым', 'Родным': 'who=Родным', 'Друзьям': 'who=Друзьям', 'Коллеге': 'who=Коллеге', 'До 2 000 ₽': 'max=2000' }[t] || 'occ=' + t);
document.getElementById('occ').innerHTML = occasions.map(o => `
  <a class="occ-item" href="catalog.html?${encodeURI(occLink(o.t))}">
    <span class="occ-circle ${o.c}">${o.i}</span>
    <span class="lbl">${o.t}</span>
  </a>`).join('');

/* ---------- Как это работает ---------- */
const how = document.querySelector('.how-card');
const nodes = [...document.querySelectorAll('#track .node')];
const lines = [...document.querySelectorAll('#track .line')];
const steps = [...document.querySelectorAll('#steps .step')];
const status = document.getElementById('howStatus');
const labels = ['Расскажите о человеке', 'Получите 5–7 идей', 'Купите у продавца', 'Готово! Подарок найден'];
let timers = [];

function setStep(n) { // n = сколько узлов заполнено (0..4)
  nodes.forEach((el, i) => el.classList.toggle('on', i < n));
  lines.forEach((el, i) => el.classList.toggle('on', i < n - 1));
  steps.forEach((el, i) => el.classList.toggle('lit', i === n - 1));
  how.classList.toggle('done', n === 4);
  status.textContent = labels[Math.max(0, Math.min(n, 4) - (n === 0 ? 0 : 1))] || labels[0];
}
function playHow() {
  timers.forEach(clearTimeout); timers = [];
  setStep(0);
  [1, 2, 3, 4].forEach((n, i) => timers.push(setTimeout(() => setStep(n), 900 * (i + 1))));
}
document.getElementById('again').addEventListener('click', playHow);
steps.forEach((el, i) => el.addEventListener('click', () => { timers.forEach(clearTimeout); setStep(i + 1); }));
new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { playHow(); o.disconnect(); } }, { threshold: .35 })
  .observe(how);

/* ---------- Хиты недели ---------- */
const rub = (v, from) => (from ? 'от ' : '') + v.toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' ₽';
const shelf = document.getElementById('shelf');
const rows = [hits.slice(0, 4), hits.slice(4)];
shelf.innerHTML = rows.map((r, ri) => `
  <div class="row">
    <div class="items">${r.map((h, k) => `<button class="prod" type="button" data-i="${ri * 4 + k}" aria-label="${h.n}, ${rub(h.p, h.from)}"><img src="${h.img}" alt="${h.n}"></button>`).join('')}</div>
    <div class="board"></div>
    <div class="caps">${r.map((h) => `<div><i>${h.b}</i><b>${h.n}</b><span>${rub(h.p, h.from)}</span></div>`).join('')}</div>
  </div>`).join('');

const pdp = document.getElementById('pdp');
const spin = pdp.querySelector('.spin');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.2,.8,.2,1)';
let openBtn = null;

function flip(svg, from, dur, rev) {
  const to = svg.getBoundingClientRect();
  const t = `translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width})`;
  return svg.animate(rev ? [{ transform: 'none' }, { transform: t }] : [{ transform: t }, { transform: 'none' }], { duration: dur, easing: EASE, fill: 'both' });
}
function openProduct(btn) {
  const h = hits[+btn.dataset.i];
  openBtn = btn;
  document.getElementById('pdpBrand').textContent = h.b;
  document.getElementById('pdpName').textContent = h.n;
  document.getElementById('pdpPrice').textContent = rub(h.p, h.from);
  document.getElementById('pdpDesc').textContent = h.d;
  document.getElementById('pdpList').innerHTML = h.l.map((x) => `<li>${x}</li>`).join('');
  spin.innerHTML = `<img src="${h.img}" alt="${h.n}">`;
  const from = btn.querySelector('img').getBoundingClientRect();
  pdp.hidden = false;
  document.body.classList.add('lock');
  btn.classList.add('gone');
  if (!still) {
    flip(spin.firstChild, from, 600);
    spin.animate([{ transform: 'rotateY(0)' }, { transform: 'rotateY(360deg)' }], { duration: 1000, easing: 'ease-in-out' });
  }
  if (typeof Auth !== 'undefined') Auth.bind(document.getElementById('pdpFav'), h.id);
  document.getElementById('pdpBack').focus({ preventScroll: true });
}
function closeProduct() {
  if (!openBtn || pdp.hidden) return;
  const btn = openBtn; openBtn = null;
  const done = () => { pdp.hidden = true; document.body.classList.remove('lock'); btn.classList.remove('gone'); btn.focus({ preventScroll: true }); };
  if (still) return done();
  const a = flip(spin.firstChild, btn.querySelector('img').getBoundingClientRect(), 450, true);
  pdp.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-in' });
  a.onfinish = done;
}
shelf.addEventListener('click', (e) => { const b = e.target.closest('.prod'); if (b) openProduct(b); });
document.getElementById('pdpBack').addEventListener('click', closeProduct);
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProduct(); });

/* фон первого экрана: гарантируем запуск (автоплей иногда блокируется, тогда стартуем по первому касанию) */
const hv = document.getElementById('heroBg');
if (hv) {
  hv.muted = true;
  const go = () => hv.play().catch(() => {});
  go();
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((e) => addEventListener(e, () => { if (hv.paused) go(); }, { once: true, passive: true }));
}

/* открывающийся подарок: видео один раз, потом вылетают карточки */
(function(){
  const box=document.getElementById('heroR'),v=document.getElementById('giftV');
  if(!box||!v)return;
  const show=()=>box.classList.add('cards-in');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    v.addEventListener('loadedmetadata',()=>{v.currentTime=v.duration;show()});
    setTimeout(show,1500);return;
  }
  v.addEventListener('ended',show);
  v.addEventListener('error',show);
  let tries=0;
  (function go(){
    if(document.getElementById('splash')&&tries++<30)return setTimeout(go,100);
    const p=v.play();
    if(p&&p.catch)p.catch(show);
    setTimeout(show,6000); // страховка
  })();
})();
