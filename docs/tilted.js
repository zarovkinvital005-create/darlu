/* Лента карточек на «цилиндре»: центр стоит ровно, края загибаются к зрителю и растворяются.
   Карточки плывут справа налево, кликабельны, фон прозрачный. Каждая карточка нарезана на вертикальные
   полоски, и каждая повёрнута на свой угол: так она изгибается по всей длине. Двигается только transform. */
(function () {
  const root = document.getElementById('tg');
  if (!root || typeof products === 'undefined') return;

  const IDS = ['pinterest', 'brooch-bear', 'mermaid', 'b012', 'birthday', 'bloom', 'brooch-heart', 'mama', 'star', 'black', 'couple', 'b011', 'brooch-doll', 'polka', 'spider', 'xmas'];
  const list = IDS.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  if (!list.length) return;

  const SLICES = 16, CAMERA = 1.6, MAX_WIDTH = 55;
  const small = innerWidth < 700; // на телефоне карточки меньше и загиб слабее, чтобы в кадр влезало несколько
  const O = small ? { speed: 3, tileHeight: 66, aspect: 3 / 4, gap: 14, axis: 52, curve: 52, fade: 14 } : { speed: 3.4, tileHeight: 76, aspect: 3 / 4, gap: 14, axis: 52, curve: 76, fade: 16 };
  const bend = (Math.min(85, Math.max(5, O.curve)) * Math.PI) / 180;
  const arc = (b) => (CAMERA - 1 + Math.cos(b)) / (2 * CAMERA * Math.sin(b));
  const deg = (r) => (r * 180) / Math.PI;
  const rnd = (n, d = 4) => +n.toFixed(d);

  function measure(width, height) {
    const h = Math.min((O.tileHeight / 100) * height, ((MAX_WIDTH / 100) * width) / O.aspect);
    const radius = width * arc(bend);
    if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 };
    const unit = deg(h / radius), pitch = (O.aspect + O.gap / 100) * unit, limit = deg(bend) + (O.aspect * unit) / 2;
    const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
    const sweep = rnd((columns * pitch) / 2);
    return { columns, sweep, unit: rnd(unit), limit: rnd(Math.min(sweep, limit)) };
  }

  const uid = 'tg' + Math.random().toString(36).slice(2, 7), orbit = uid + 'o';
  const u = (n) => `calc(${rnd(n)} * min(${O.tileHeight}cqh, ${rnd(MAX_WIDTH / O.aspect)}cqw))`;
  const r = 100 * arc(bend), radius = `${rnd(r, 3)}cqw`;
  const turn = (d) => `translateZ(${radius}) rotateY(${rnd(d)}deg) translateZ(-${radius})`;
  const share = O.aspect / SLICES;
  const mask = `linear-gradient(90deg,transparent,#000 ${O.fade}%,#000 ${100 - O.fade}%,transparent)`;

  const band = document.createElement('div');
  band.className = 'tg-band';
  band.style.cssText = `perspective:${rnd(r * CAMERA, 3)}cqw;perspective-origin:50% ${O.axis}%;-webkit-mask-image:${mask};mask-image:${mask}`;
  const style = document.createElement('style');
  root.append(style, band);
  root.style.containerType = 'size';

  let built = '', shown = {};
  function build(L) {
    const key = [L.columns, L.sweep, L.unit].join();
    if (key === built) return;
    built = key; shown = {}; band.innerHTML = '';
    const hide = rnd(((L.sweep - L.limit) / (2 * L.sweep || 1)) * 100);
    style.textContent =
      `@keyframes ${orbit}{from{transform:${turn(-L.sweep)}}to{transform:${turn(L.sweep)}}` +
      `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
      `@media(prefers-reduced-motion:reduce){.${uid}{animation-play-state:paused}}`;
    const duration = L.columns * O.speed;
    for (let t = 0; t < L.columns; t++) {
      const first = L.columns - 1 - t;
      const a = document.createElement('a');
      a.className = 'tg-tile ' + uid;
      a.draggable = false;
      a.style.cssText = `left:calc(50% - ${u(O.aspect / 2)});top:calc(${O.axis}% - ${u(0.5)});width:${u(O.aspect)};height:${u(1)};animation:${orbit} ${duration}s linear ${-t * O.speed}s infinite`;
      for (let k = 0; k < SLICES; k++) {
        const s = document.createElement('i');
        s.className = 'tg-s';
        s.style.cssText = `left:${u((O.aspect - share) / 2)};width:${k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`};height:${u(1)};transform:${turn((O.aspect / 2 - (k + 0.5) * share) * L.unit)};background-size:${u(O.aspect)} ${u(1)};background-position:${u(-k * share)} 0` +
          (k === 0 ? ';border-radius:14px 0 0 14px' : k === SLICES - 1 ? ';border-radius:0 14px 14px 0' : '');
        a.appendChild(s);
      }
      const set = (n) => {
        const p = list[n % list.length];
        a.href = 'catalog.html?p=' + encodeURIComponent(p.id);
        a.setAttribute('aria-label', p.n + ', ' + p.p.toLocaleString('ru-RU') + ' ₽');
        a.title = p.n;
        a.querySelectorAll('.tg-s').forEach((s) => { s.style.backgroundImage = `url(${p.img})`; });
      };
      set(first);
      // на каждом новом круге (за кадром) карточка берёт следующую картинку
      a.addEventListener('animationiteration', (e) => {
        const lap = Math.round(e.elapsedTime / duration), n = lap * L.columns + first;
        if (shown[t] !== n) { shown[t] = n; set(n); }
      });
      band.appendChild(a);
    }
  }

  list.forEach((p) => { new Image().src = p.img; });
  build(measure(1000, 520));
  new ResizeObserver(([e]) => {
    const { width, height } = e.contentRect;
    if (width && height) { build(measure(width, height)); root.classList.add('ready'); }
  }).observe(root);
})();
