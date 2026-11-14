const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rub = (v, from) => (from ? 'от ' : '') + v.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';

const GRPS = {
  'Родственникам': ['Маме', 'Папе', 'Сестре', 'Брату', 'Бабушке', 'Дедушке', 'Тёте', 'Дяде'],
  'Друзьям': ['Подруге', 'Другу'],
  'Любимым': ['Девушке', 'Парню', 'Жене', 'Мужу'],
  'Другим': ['Коллеге', 'Учителю', 'Знакомому'],
};
const GRPQ = { 'Родственникам': 'Кому из родных?', 'Друзьям': 'Подруге или другу?', 'Любимым': 'Кому именно?', 'Другим': 'Кому именно?' };
const SEX = { 'Маме': 'f', 'Папе': 'm', 'Сестре': 'f', 'Брату': 'm', 'Бабушке': 'f', 'Дедушке': 'm', 'Тёте': 'f', 'Дяде': 'm', 'Подруге': 'f', 'Другу': 'm', 'Девушке': 'f', 'Парню': 'm', 'Жене': 'f', 'Мужу': 'm' };
const AGES = ['до 16', '16–22', '23–35', '36–50', '51–65', 'старше 65'];
const HOB = [
  ['Дом и уют', ['Готовка', 'Выпечка', 'Растения и цветы', 'Интерьер и декор', 'Животные']],
  ['Творчество', ['Рисование', 'Вязание и шитьё', 'Фото и видео', 'Музыка', 'Своими руками']],
  ['Для души', ['Книги', 'Кино и сериалы', 'Путешествия', 'Психология', 'Кофейни']],
  ['Красота и стиль', ['Уход за собой', 'Мода и стиль', 'Украшения']],
  ['Спорт', ['Зал', 'Бег', 'Йога', 'Футбол', 'Скейт и ролики']],
  ['Техника и игры', ['Видеоигры', 'Аниме и комиксы', 'Гаджеты', 'Настолки']],
];
const WORK = [
  ['Учёба', ['Школьник', 'Студент']],
  ['Работа', ['IT и разработка', 'Дизайн и креатив', 'Медиа и SMM', 'Маркетинг и продажи', 'Свой бизнес', 'Медицина', 'Образование']],
  ['Другое', ['На пенсии', 'В декрете', 'Ищет себя']],
];
const CHARS = ['Душа компании', 'Домосед', 'Романтик', 'Практичный', 'С юмором', 'Творческий', 'Спокойный', 'Активный'];

// порядок шагов как в макете: 13 шагов; qs — пропускаются, если профиль уже понят (режим «сама пойму»)
const Q = [
  { k: 'grp', q: 'Кому выбираем подарок?', o: Object.keys(GRPS), own: 'Свой вариант' },
  { k: 'who', q: 'Кому именно?', when: () => GRPS[A.grp], dyn: () => ({ o: GRPS[A.grp], q: GRPQ[A.grp] }), own: 'Свой вариант' },
  { k: 'gender', qs: 1, q: 'Это он или она?', o: ['Он', 'Она'], when: () => !SEX[A.who] },
  { k: 'age', qs: 1, q: 'Сколько лет этому человеку?', o: AGES },
  { k: 'city', qs: 1, q: 'Где живёт человек? Так я покажу бренды с доставкой туда.', o: ['Москва', 'Санкт-Петербург', 'Другой город'], own: 'Напишите город' },
  { k: 'reason', q: 'Какой повод?', o: ['День рождения', 'Новый год', '14 февраля', '8 марта', '23 февраля', 'Годовщина', 'Выпускной', 'Новоселье', 'Без повода'], own: 'Свой повод' },
  { k: 'how', q: 'Хотите, я сама пойму, чем живёт человек? Надиктуйте пару фраз о нём, пришлите ссылку на его открытый Telegram-канал или ВК, или скриншоты профиля.' },
  { k: 'work', qs: 1, q: 'Чем человек занимается? Это часто подсказывает, что ему пригодится.', groups: WORK, own: 'Своя сфера', skip: 'Не знаю', when: () => A.age !== 'до 16' },
  { k: 'hobby', qs: 1, q: 'Чем увлекается? Выберите всё, что подходит.', hint: 'Если хобби нет, нажмите «Сложно сказать»', multi: 1, groups: HOB, own: 'Своё увлечение', skip: 'Сложно сказать' },
  { k: 'char', qs: 1, q: 'Какой это человек? Выберите 1–2 черты.', multi: 1, max: 2, o: CHARS },
  { k: 'budget', q: 'Какой бюджет?', o: ['до 1 500 ₽', '1 500–3 000 ₽', '3 000–5 000 ₽', '5 000–10 000 ₽', 'не важно'] },
  { k: 'no', qs: 1, q: 'Что человек точно не любит? Например, цветы, сладкое или вещи для дома.', o: ['Нет такого'], own: 'Напишите, что не любит' },
  { k: 'extra', qs: 1, q: 'Последнее, по желанию: назовите 2–3 слова-ассоциации с человеком или расскажите короткую историю.', o: ['Пропустить'], own: 'Например: «уютный, любит дождь»' },
];

let A = {}, step = 0, sel = new Set(), run = 0;

function bot(html, ms = 550) {
  const id = run, chat = $('#chat');
  const t = document.createElement('div'); t.className = 'msg bot typing'; t.innerHTML = '<i></i><i></i><i></i>'; chat.appendChild(t);
  return sleep(ms).then(() => { if (id !== run) return; t.className = 'msg bot'; t.innerHTML = html; });
}
function me(t) { const m = document.createElement('div'); m.className = 'msg me'; m.textContent = t; $('#chat').appendChild(m); }
const optBtn = (o) => `<button type="button" class="opt" data-o="${esc(o)}">${esc(o)}</button>`;

function start() {
  run++; A = {}; step = 0; sel = new Set();
  $('#chat').innerHTML = ''; $('#answers').innerHTML = ''; $('#results').innerHTML = '';
  ask();
}

async function ask() {
  const id = run;
  while (step < Q.length) {
    const s = Q[step];
    if ((s.when && !s.when()) || (A.quick && s.qs)) step++; else break;
  }
  if (step >= Q.length) return finish();
  let s = Q[step];
  if (s.dyn) s = { ...s, ...s.dyn() };
  if (s.k === 'work' && A.age === 'до 16') { A.work = 'Школьник'; step++; return ask(); }
  $('#prog').style.width = (step / Q.length * 100) + '%';
  $('#stepLabel').textContent = `Шаг ${step + 1} из ${Q.length}`;
  $('#answers').innerHTML = ''; sel = new Set();
  await bot(esc(s.q) + (s.hint ? `<small>${esc(s.hint)}</small>` : ''), step === 0 ? 350 : 600);
  if (id !== run) return;
  if (s.k === 'how') return askHow();
  const body = s.groups
    ? s.groups.map(([g, os]) => `<div class="ogroup"><h4>${g}</h4><div class="opts">${os.map(optBtn).join('')}</div></div>`).join('')
    : `<div class="opts">${s.o.map(optBtn).join('')}</div>`;
  $('#answers').innerHTML = body
    + (s.own ? `<form class="own" id="ownF"><input id="ownI" placeholder="${esc(s.own)}" aria-label="${esc(s.own)}" autocomplete="off"><button type="button" class="mic" id="micB" aria-label="Голосом"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21"/></svg></button><button class="btn btn-navy" type="submit">${s.multi ? 'Добавить' : 'Отправить'}</button></form>` : '')
    + (s.multi ? `<div class="ans-actions"><button type="button" class="btn btn-coral" id="multiDone" disabled>Готово</button>${s.skip ? `<button type="button" class="opt soft" id="skipB">${s.skip}</button>` : ''}<small id="selN"></small></div>`
      : (s.skip ? `<div class="ans-actions"><button type="button" class="opt soft" id="skipB">${s.skip}</button></div>` : ''));
  const upd = () => { const md = $('#multiDone'); if (md) md.disabled = !sel.size; const n = $('#selN'); if (n) n.textContent = sel.size ? 'Выбрано: ' + sel.size : ''; };
  $('#answers').querySelectorAll('.opt[data-o]').forEach((b) => b.onclick = () => {
    if (!s.multi) return answer(b.dataset.o);
    const v = b.dataset.o;
    if (sel.has(v)) { sel.delete(v); b.classList.remove('on'); }
    else { if (s.max && sel.size >= s.max) return; sel.add(v); b.classList.add('on'); }
    upd();
  });
  const f = $('#ownF');
  if (f) {
    f.onsubmit = (e) => {
      e.preventDefault(); const v = $('#ownI').value.trim(); if (!v) return;
      if (s.multi) { sel.add(v); const b = document.createElement('button'); b.type = 'button'; b.className = 'opt on'; b.textContent = v; b.onclick = () => { sel.delete(v); b.remove(); upd(); }; [...$('#answers').querySelectorAll('.opts')].pop().appendChild(b); $('#ownI').value = ''; upd(); }
      else answer(v);
    };
    $('#micB').onclick = () => voice($('#ownI'));
  }
  const md = $('#multiDone'); if (md) md.onclick = () => answer([...sel].join(', '), [...sel]);
  const sk = $('#skipB'); if (sk) sk.onclick = () => answer(s.skip, []);
  $('#answers').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function answer(text, val) {
  const s = Q[step];
  me(text); A[s.k] = val !== undefined ? val : text;
  if (s.k === 'grp' && !GRPS[text]) A.who = text; // свой вариант — «кому» уже ясно
  step++; ask();
}

/* ---- голос (если браузер умеет) ---- */
let rec = null;
function voice(input) {
  const btn = $('#micB');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { input.placeholder = 'Голосовой ввод не работает в этом браузере. Откройте сайт в Chrome, Edge или Safari'; return; }
  if (rec) { rec.stop(); return; } // повторное нажатие останавливает запись
  const base = input.value ? input.value.trim() + ' ' : '';
  let finalText = '';
  rec = new SR(); rec.lang = 'ru-RU'; rec.interimResults = true; rec.continuous = true;
  const hint = input.placeholder;
  const done = () => { rec = null; if (btn) { btn.classList.remove('rec'); btn.setAttribute('aria-label', 'Голосом'); } input.placeholder = hint; input.focus(); };
  rec.onstart = () => { if (btn) { btn.classList.add('rec'); btn.setAttribute('aria-label', 'Остановить запись'); } input.placeholder = 'Слушаю… Говорите, нажмите на микрофон, когда закончите'; };
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) finalText += t + ' '; else interim += t; }
    input.value = (base + finalText + interim).trim();
  };
  rec.onerror = (e) => {
    const m = { 'not-allowed': 'Разрешите доступ к микрофону в браузере и нажмите ещё раз', 'service-not-allowed': 'Разрешите доступ к микрофону в браузере и нажмите ещё раз', 'no-speech': 'Ничего не слышно. Нажмите на микрофон и говорите', 'audio-capture': 'Микрофон не найден', 'network': 'Нет связи для распознавания речи' }[e.error];
    if (m) input.placeholder = m;
  };
  rec.onend = done;
  try { rec.start(); } catch (x) { done(); }
}

/* ---- режим «сама пойму» ---- */
const STEMS = [
  [/кофе|кофейн|латте/, 'Кофейни'], [/готов|кулинар/, 'Готовка'], [/выпечк|печёт|печет/, 'Выпечка'], [/растен|цветы/, 'Растения и цветы'],
  [/рису|художе|скетч/, 'Рисование'], [/вяж|шить|шьёт|рукодел/, 'Вязание и шитьё'], [/фото|снима|камер|плёнк|пленк/, 'Фото и видео'],
  [/музык|гитар|пою|поёт|плейлист/, 'Музыка'], [/книг|чита/, 'Книги'], [/кино|фильм|сериал/, 'Кино и сериалы'], [/путешеств|поездк|travel/, 'Путешествия'],
  [/аниме|манг/, 'Аниме и комиксы'], [/игр[аыу]|геймер|видеоигр/, 'Видеоигры'], [/гаджет|техник/, 'Гаджеты'], [/настолк/, 'Настолки'],
  [/футбол/, 'Футбол'], [/скейт|ролики/, 'Скейт и ролики'], [/бег|марафон/, 'Бег'], [/зал|качалк|тренаж/, 'Зал'], [/йог|пилатес/, 'Йога'],
  [/космет|уход за|макияж|маникюр/, 'Уход за собой'], [/мода|одежд|стиль|шопинг/, 'Мода и стиль'], [/украшени|браслет|кольц|сереж/, 'Украшения'],
  [/психолог|медитац/, 'Психология'], [/животн|кошк|кот[ао]|собак/, 'Животные'], [/своими руками|handmade|хендмейд/, 'Своими руками'],
];
const CH = [[/весел|юмор|шут|прикол/, 'С юмором'], [/домосед|дома сидит/, 'Домосед'], [/романт/, 'Романтик'], [/активн|энергичн/, 'Активный'], [/спокойн|тих/, 'Спокойный'], [/творч/, 'Творческий'], [/компани/, 'Душа компании']];
function extract(text) {
  const t = ' ' + text.toLowerCase() + ' ';
  const hob = STEMS.filter(([re]) => re.test(t)).map((x) => x[1]);
  const ch = CH.filter(([re]) => re.test(t)).map((x) => x[1]).slice(0, 2);
  const m = t.match(/(\d{1,2})\s*(лет|год)/); let age;
  if (m) { const n = +m[1]; age = n < 16 ? 'до 16' : n <= 22 ? '16–22' : n <= 35 ? '23–35' : n <= 50 ? '36–50' : n <= 65 ? '51–65' : 'старше 65'; }
  return { hob, ch, age };
}
const MODES = [
  ['dict', 'Надиктовать', 'Расскажите голосом, какой он человек', '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21"/>'],
  ['link', 'Ссылка на профиль', 'Открытый Telegram-канал или ВК', '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>'],
  ['shot', 'Скриншоты', 'Instagram, TikTok или любая соцсеть', '<rect x="6" y="2.500" width="12" height="19" rx="2.500"/><path d="M9 15l2-2 2 2 2-3"/><circle cx="10" cy="8.500" r="1.300"/>'],
  ['q', 'Отвечу на вопросы', 'Выберу увлечения сама', '<path d="M8 7h12M8 12h12M8 17h8"/><path d="M4 7h.01M4 12h.01M4 17h.01" stroke-width="3"/>'],
];
function askHow() {
  $('#answers').innerHTML = `<div class="modes">${MODES.map(([k, t, d, ic]) => `<button type="button" class="mode ${k === 'q' ? 'alt' : ''}" data-m="${k}"><span class="mi"><svg viewBox="0 0 24 24">${ic}</svg></span><b>${t}</b><small>${d}</small></button>`).join('')}</div>`;
  $('#answers').querySelectorAll('.mode').forEach((b) => b.onclick = () => mode(b.dataset.m));
  $('#answers').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function mode(m) {
  if (m === 'q') { me('Отвечу на вопросы'); step++; return ask(); }
  const ph = { dict: 'Например: «Брату 19, любит кофе, скейт и аниме»', link: 'https://t.me/…', shot: '' }[m];
  const note = '<p class="privacy">🔒 Мы ничего не храним: текст, ссылка и скриншоты нужны только для этого подбора.</p>';
  $('#answers').innerHTML = `<form class="own big" id="modeF">${m === 'shot' ? '<input type="file" id="modeI" accept="image/*" multiple>' : m === 'dict' ? `<textarea id="modeI" rows="3" placeholder="${esc(ph)}"></textarea><button type="button" class="mic" id="micB" aria-label="Голосом"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21"/></svg></button>` : `<input id="modeI" placeholder="${esc(ph)}">`}<button class="btn btn-navy" type="submit">Разобрать</button></form>${note}<div class="ans-actions"><button type="button" class="opt soft" id="backB">← Назад к вариантам</button></div>`;
  if ($('#micB')) $('#micB').onclick = () => voice($('#modeI'));
  $('#backB').onclick = askHow;
  $('#modeF').onsubmit = async (e) => {
    e.preventDefault();
    const inp = $('#modeI');
    const val = m === 'shot' ? (inp.files.length ? `Скриншоты (${Math.min(inp.files.length, 4)})` : '') : inp.value.trim();
    if (!val) return;
    me(val);
    $('#answers').innerHTML = '';
    const typing = bot('Читаю…', 60); // индикатор, пока идёт запрос
    let res = null, err = '';
    try {
      const body = { mode: m === 'shot' ? 'shots' : m === 'link' ? 'link' : 'text', allowed: { hobbies: HOB.flatMap((g) => g[1]), chars: CHARS, ages: AGES } };
      if (m === 'dict') body.text = val; else if (m === 'link') body.url = val; else body.images = await Promise.all([...inp.files].slice(0, 4).map(shrink));
      const r = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) res = d; else err = d.error === 'unreadable' ? d.message : d.error === 'rate' ? 'Слишком много запросов, попробуйте позже.' : d.error === 'no_key' ? 'ИИ пока не подключён.' : 'Не получилось связаться с ИИ.';
    } catch (x) { err = 'ИИ сейчас недоступен.'; }
    await typing;
    // запасной вариант для текста: простой поиск слов, если ИИ недоступен
    if (!res && m === 'dict') { const x = extract(val); if (x.hob.length) res = { hobbies: x.hob, chars: x.ch, age: x.age, summary: '' }; }
    if (res && res.hobbies.length) {
      if (res.age && !A.age) A.age = res.age;
      A.hobby = res.hobbies; A.char = res.chars; A.quick = true;
      await bot(`${res.summary ? esc(res.summary) + '<br>' : ''}Увлечения: <b>${esc(res.hobbies.join(', '))}</b>${res.chars.length ? '. Характер: <b>' + esc(res.chars.join(', ')) + '</b>' : ''}. Осталось пара вопросов.`, 300);
    } else {
      await bot(`${esc(err || 'Мало зацепок.')} Давайте лучше я задам вопросы.`, 300);
    }
    step++; ask();
  };
}
// уменьшаем скриншот до 1024px: меньше трафик и дешевле запрос
function shrink(file) {
  return new Promise((ok, no) => {
    const img = new Image(), u = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 1024 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = no; img.src = u;
  });
}

/* ---- подбор ---- */
function budgetOk(p, b) {
  const r = { 'до 1 500 ₽': [0, 1500], '1 500–3 000 ₽': [1500, 3000], '3 000–5 000 ₽': [3000, 5000], '5 000–10 000 ₽': [5000, 10000] }[b];
  return !r || (p >= r[0] && p <= r[1]);
}
function pick() {
  const who = (A.who || '').toLowerCase();
  const want = new Set([...(A.hobby || []), ...(A.char || [])].map((x) => x.toLowerCase()));
  const reason = (A.reason || '').toLowerCase();
  const no = (A.no && A.no !== 'Нет такого' ? A.no : '').toLowerCase();
  const sex = SEX[A.who] || (A.gender === 'Она' ? 'f' : A.gender === 'Он' ? 'm' : '');
  return products.map((h) => {
    const t = h.tags; let sc = 0; const why = [];
    t.forEach((x) => {
      if (want.has(x)) { sc += 2; why.push(x); }
      if (x === who) { sc += 3; why.push('подходит ' + who); }
      if (x === reason) { sc += 1.5; why.push(x); }
    });
    if (sex === 'm' && /мама|для мамы|сердечк|русалоч/i.test(h.n) && who !== 'папе') sc -= 1;
    if (!budgetOk(h.p, A.budget)) sc -= 6;
    if (no && (h.n.toLowerCase().includes(no) || t.some((x) => no.includes(x)))) sc -= 8;
    return { h, sc, why: [...new Set(why)].slice(0, 3) };
  }).sort((a, b) => b.sc - a.sc);
}
async function finish() {
  $('#prog').style.width = '100%'; $('#stepLabel').textContent = 'Готово!'; $('#answers').innerHTML = '';
  await bot('Подбираю подарки по вашим ответам…', 500);
  const r = pick(); const good = r.filter((x) => x.sc > 0);
  const list = (good.length >= 3 ? good : r.slice(0, 3)).slice(0, 5);
  await bot(good.length ? `Готово! Вот ${list.length} идей, которые подойдут${A.who ? ' (' + esc(A.who.toLowerCase()) + ')' : ''}.` : 'Точных совпадений мало, поэтому показываю самое близкое. Можно изменить ответы и подобрать ещё раз.', 500);
  $('#results').innerHTML = `<div class="res-grid">${list.map(({ h, why }) => `
    <a class="res" href="catalog.html?p=${h.id}">
      <img src="${h.img}" alt="${esc(h.n)}">
      <div class="res-b"><small>${esc(h.b)}</small><b>${esc(h.n)}</b><span class="res-p">${rub(h.p, h.from)}</span>
      ${why.length ? `<em>Почему подходит: ${esc(why.join(', '))}</em>` : ''}</div>
    </a>`).join('')}</div>
    <div class="res-cta"><button type="button" class="btn btn-soft btn-lg" id="again2">Подобрать заново</button><a class="btn btn-navy btn-lg" href="catalog.html">Смотреть весь каталог</a></div>`;
  $('#again2').onclick = start;
  $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

$('#restart').onclick = start;
start();
