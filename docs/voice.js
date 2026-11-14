/* Подбор голосом: нажал, надиктовал всё про человека, получил каталог с подходящими подарками.
   Описание хранится только в этой вкладке (sessionStorage) и никуда не отправляется. */
const Voice = (() => {
  const KEY = 'darli_voice';
  const WHO = [[/(?<![а-яё])мам/, 'маме'], [/(?<![а-яё])пап/, 'папе'], [/(?<![а-яё])брат/, 'брату'], [/(?<![а-яё])сестр/, 'сестре'], [/(?<![а-яё])подруг/, 'подруге'], [/(?<![а-яё])друг(?:у|а|е|ом)?(?![а-яё])/, 'другу'],
    [/(?<![а-яё])девушк/, 'девушке'], [/(?<![а-яё])парн/, 'парню'], [/(?<![а-яё])жен[аеуы](?![а-яё])/, 'жене'], [/(?<![а-яё])муж(?:у|а|е|ем)?(?![а-яё])/, 'мужу'], [/(?<![а-яё])бабушк/, 'бабушке'], [/(?<![а-яё])дедушк/, 'дедушке'],
    [/(?<![а-яё])коллег/, 'коллеге'], [/(?<![а-яё])т[ёе]т[яеиу](?![а-яё])/, 'тёте'], [/(?<![а-яё])дяд/, 'дяде']];
  const OCC = [[/день рождени|днюх|именин/, 'день рождения'], [/новый год|новогод|нового года|новому году/, 'новый год'], [/14 феврал|валентин/, '14 февраля'],
    [/8 март|восьмо[ем] март/, '8 марта'], [/23 феврал/, '23 февраля'], [/годовщин/, 'годовщина'], [/выпускн/, 'выпускной']];
  const HOB = [[/кофе|латте/, 'кофейни'], [/готов|кулинар/, 'готовка'], [/выпечк|печ[её]т/, 'выпечка'], [/растен|цвет[ыао]/, 'растения и цветы'],
    [/рису|художе|скетч/, 'рисование'], [/вяж|вязан|шить|шь[её]т|рукодел/, 'вязание и шитьё'], [/фото|снима|камер|пл[её]нк/, 'фото и видео'],
    [/музык|гитар|по[её]т|плейлист/, 'музыка'], [/книг|чита/, 'книги'], [/кино|фильм|сериал/, 'кино и сериалы'], [/путешеств|поездк/, 'путешествия'],
    [/аниме|манг/, 'аниме и комиксы'], [/геймер|видеоигр|компьютерн\S* игр|приставк/, 'видеоигры'], [/гаджет|техник/, 'гаджеты'], [/настолк|настольн\S* игр/, 'настолки'],
    [/футбол/, 'футбол'], [/скейт|ролик/, 'скейт и ролики'], [/бега|марафон/, 'бег'], [/спортзал|качалк|тренаж|бокс/, 'зал'], [/йог|пилатес/, 'йога'],
    [/космет|уход за|макияж|маникюр|парфюм|дух[иа](?![а-яё])|аромат/, 'уход за собой'], [/мод[ау]|одежд|стил|шопинг/, 'мода и стиль'], [/украшени|браслет|кольц|сер[её]ж|подвеск|брош/, 'украшения'],
    [/психолог|медитац/, 'психология'], [/животн|кошк|кот(?:а|у|ы|ов|ик\S*)?(?![а-яё])|собак/, 'животные'], [/своими руками|хендмейд|мастерит/, 'своими руками'],
    [/интерьер|декор|уют|свеч/, 'интерьер и декор'], [/сладк|шоколад|варень|конфет/, 'готовка']];
  const CHR = [[/вес[её]л|юмор|шут|прикол/, 'с юмором'], [/домосед|дома сидит/, 'домосед'], [/романт/, 'романтик'], [/активн|энергичн|спорт/, 'активный'],
    [/спокойн|тих/, 'спокойный'], [/творч|креатив/, 'творческий'], [/практич/, 'практичный'], [/душа компании|общител|компанейск/, 'душа компании']];
  const STOP = new Set(['который', 'которая', 'которые', 'подарок', 'подарить', 'нужно', 'нужен', 'хочу', 'любит', 'очень', 'человек', 'рублей', 'тысяч', 'чтобы', 'может', 'будет', 'лет', 'года', 'годов', 'этот', 'этого', 'тоже', 'ещё', 'если', 'только', 'какой', 'какая', 'было', 'есть', 'нравится', 'нравятся', 'увлекается', 'бюджет']);

  function parse(text) {
    const t = ' ' + text.toLowerCase().replace(/ё/g, 'е').replace(/[.,!?;:«»"()]/g, ' ') + ' ';
    const raw = ' ' + text.toLowerCase() + ' ';
    const pick = (list) => [...new Set(list.filter(([re]) => re.test(raw) || re.test(t)).map((x) => x[1]))];
    let max = 0;
    const m = t.match(/(?:до|бюджет|не дороже|в пределах|максимум|около)\s+(\d[\d\s]*)\s*(тысяч|тыс|к(?![а-яё]))?/) || t.match(/(\d[\d\s]*)\s*(тысяч|тыс)\b/) || t.match(/(\d[\d\s]{2,})\s*(?:руб|₽)/);
    if (m) { max = +m[1].replace(/\s/g, ''); if (m[2] || max < 100) max *= 1000; }
    if (!max) { // числа словами: «три тысячи», «полторы тысячи»
      const NUM = { 'тысячу': 1, 'одну': 1, 'полторы': 1.5, 'две': 2, 'три': 3, 'четыре': 4, 'пять': 5, 'шесть': 6, 'семь': 7, 'восемь': 8, 'девять': 9, 'десять': 10, 'пятнадцать': 15, 'двадцать': 20 };
      const w = t.match(/(полторы|одну|две|три|четыре|пять|шесть|семь|восемь|девять|десять|пятнадцать|двадцать)\s+тысяч/) || t.match(/(?:до|бюджет|в пределах)\s+(тысячу)/);
      if (w) max = NUM[w[1]] * 1000;
    }
    const words = [...new Set(t.split(/\s+/).filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d+$/.test(w)).map((w) => w.slice(0, 5)))];
    return { who: pick(WHO), occ: pick(OCC), hob: pick(HOB), chr: pick(CHR), max, words };
  }
  // чем выше балл, тем лучше подарок подходит под описание
  function score(p, q) {
    if (q.max && p.p > q.max) return 0;
    let s = 0, interest = 0;
    q.who.forEach((x) => { if (p.tags.includes(x)) s += 3; });
    q.occ.forEach((x) => { if (p.tags.includes(x)) s += 2; });
    q.hob.forEach((x) => { if (p.tags.includes(x)) interest += 3; });
    q.chr.forEach((x) => { if (p.tags.includes(x)) s += 1; });
    const hay = (p.n + ' ' + p.d + ' ' + p.b).toLowerCase().replace(/ё/g, 'е');
    q.words.forEach((w) => { if (hay.includes(w)) interest += 2; });
    if (q.hob.length && !interest) return 0; // назвали увлечения: показываем только то, что к ним подходит
    return s + interest;
  }
  const get = () => { try { return sessionStorage.getItem(KEY) || ''; } catch (e) { return ''; } };
  const set = (v) => { try { v ? sessionStorage.setItem(KEY, v) : sessionStorage.removeItem(KEY); } catch (e) {} };

  /* ---------- окно записи ---------- */
  let dlg = null, rec = null, want = false, timer = null, onDone = null;
  function build() {
    dlg = document.createElement('dialog'); dlg.className = 'vx';
    dlg.innerHTML = `<form method="dialog" class="vx-in">
      <h3>Расскажите, кому нужен подарок</h3>
      <p class="vx-hint">Например: «Брату 19 лет, любит кофе, скейт и аниме, на день рождения, до 3 000 рублей»</p>
      <button type="button" class="vx-mic" id="vxMic" aria-label="Начать запись"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg></button>
      <div class="vx-state" id="vxState" role="status">Нажмите на микрофон и говорите</div>
      <textarea id="vxText" rows="4" placeholder="Здесь появится ваш рассказ. Его можно поправить или написать руками"></textarea>
      <div class="vx-btns"><button type="button" class="btn btn-coral" id="vxGo">Показать подарки</button><button type="button" class="btn btn-soft" id="vxX">Отмена</button></div>
      <p class="vx-note">Рассказ никуда не отправляется и не сохраняется.</p>
    </form>`;
    document.body.appendChild(dlg);
    dlg.querySelector('#vxMic').onclick = toggle;
    dlg.querySelector('#vxX').onclick = () => { stop(); dlg.close(); };
    dlg.querySelector('#vxGo').onclick = go;
    dlg.addEventListener('close', stop);
  }
  const ui = (on, msg) => {
    const mic = dlg.querySelector('#vxMic'), st = dlg.querySelector('#vxState');
    mic.classList.toggle('rec', on); mic.setAttribute('aria-label', on ? 'Остановить запись' : 'Начать запись');
    st.classList.toggle('on', on); if (msg) st.textContent = msg;
  };
  function stop() { want = false; clearInterval(timer); if (rec) { try { rec.stop(); } catch (e) {} } rec = null; }
  function toggle() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const ta = dlg.querySelector('#vxText');
    if (!SR) { ui(false, 'Голосовой ввод не работает в этом браузере. Напишите текстом или откройте сайт в Chrome, Edge или Safari'); ta.focus(); return; }
    if (want) { stop(); ui(false, 'Запись остановлена. Проверьте текст и нажмите «Показать подарки»'); return; }
    want = true;
    const base = ta.value ? ta.value.trim() + ' ' : ''; let fin = ''; const t0 = Date.now();
    const tick = () => { const s = Math.floor((Date.now() - t0) / 1000); ui(true, `Идёт запись ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}. Нажмите на микрофон, когда закончите`); };
    tick(); timer = setInterval(tick, 500);
    const run = () => {
      rec = new SR(); rec.lang = 'ru-RU'; rec.interimResults = true; rec.continuous = true;
      rec.onresult = (e) => { let it = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const x = e.results[i][0].transcript; if (e.results[i].isFinal) fin += x + ' '; else it += x; } ta.value = (base + fin + it).trim(); };
      rec.onerror = (e) => {
        const m = { 'not-allowed': 'Разрешите доступ к микрофону в браузере и нажмите ещё раз', 'service-not-allowed': 'Разрешите доступ к микрофону в браузере и нажмите ещё раз', 'audio-capture': 'Микрофон не найден', network: 'Нет связи для распознавания речи' }[e.error];
        if (m) { stop(); ui(false, m); }
      };
      // браузер сам обрывает запись на паузе: пока не нажали «стоп», запускаем заново
      rec.onend = () => { if (want) setTimeout(() => { if (want) { try { run(); } catch (x) { stop(); ui(false, 'Запись остановлена'); } } }, 150); };
      try { rec.start(); } catch (x) { stop(); ui(false, 'Не получилось включить микрофон'); }
    };
    run();
  }
  function go() {
    const v = dlg.querySelector('#vxText').value.trim();
    if (!v) { ui(false, 'Сначала расскажите о человеке или напишите текстом'); return; }
    stop(); set(v); dlg.close();
    if (onDone) onDone(v); else location.href = 'catalog.html#voice';
  }
  function open(cb) {
    onDone = cb || null;
    if (!dlg) build();
    dlg.querySelector('#vxText').value = '';
    ui(false, 'Нажмите на микрофон и говорите');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    toggle(); // запись стартует сразу по нажатию кнопки
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-voice]'); if (b) { e.preventDefault(); open(window.voiceApply || null); } });
  return { open, parse, score, get, set };
})();
