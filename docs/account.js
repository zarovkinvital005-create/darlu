const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rub = (v, from) => (from ? 'от ' : '') + v.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';
const root = $('#acc');
const plural = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'товар' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'товара' : 'товаров');
let mode = 'login';

function guest() {
  const reg = mode === 'register';
  root.innerHTML = `
    <div class="acc-card">
      <h1>${reg ? 'Создать аккаунт' : 'Войти в кабинет'}</h1>
      <p class="acc-sub">Аккаунт нужен, чтобы хранить избранное на любом устройстве. Подбирать подарки можно и без него.</p>
      <div class="acc-tabs"><button type="button" data-m="login" class="${reg ? '' : 'on'}">Вход</button><button type="button" data-m="register" class="${reg ? 'on' : ''}">Регистрация</button></div>
      <form id="af" novalidate>
        ${reg ? '<label>Как вас зовут<input name="name" maxlength="60" autocomplete="name" placeholder="Например, Соня"></label>' : ''}
        <label>Почта<input name="email" type="email" maxlength="254" autocomplete="email" placeholder="you@mail.ru" required></label>
        <label>Пароль<input name="password" type="password" maxlength="200" autocomplete="${reg ? 'new-password' : 'current-password'}" placeholder="${reg ? 'Не короче 8 символов' : 'Ваш пароль'}" required></label>
        <button class="btn btn-navy btn-block" type="submit" id="asend">${reg ? 'Создать аккаунт' : 'Войти'}</button>
        <p class="acc-msg" id="amsg" role="alert"></p>
      </form>
      ${Auth.favs.size ? `<p class="acc-hint">♥ В избранном у вас ${Auth.favs.size} ${plural(Auth.favs.size)}. После входа они сохранятся в аккаунте.</p>` : ''}
    </div>`;
  root.querySelectorAll('.acc-tabs button').forEach((b) => b.onclick = () => { mode = b.dataset.m; guest(); });
  $('#af').onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target, msg = $('#amsg'), btn = $('#asend');
    const email = f.email.value.trim(), pw = f.password.value;
    if (!email || !pw) { msg.textContent = 'Введите почту и пароль.'; return; }
    btn.disabled = true; msg.textContent = '';
    const r = reg ? await Auth.register(f.name.value.trim(), email, pw) : await Auth.login(email, pw);
    btn.disabled = false;
    if (r.ok) { location.hash = ''; render(); } else msg.textContent = r.message || 'Не получилось. Попробуйте ещё раз.';
  };
}

function cabinet() {
  const u = Auth.user;
  const list = products.filter((p) => Auth.favs.has(p.id));
  root.innerHTML = `
    <div class="acc-top">
      <div><div class="eyebrow">Личный кабинет</div><h1>Привет, ${esc(u.name)}!</h1><p class="acc-sub">${esc(u.email)}</p></div>
      <div class="acc-acts"><a class="btn btn-soft" href="ai.html">Подобрать подарок</a><button class="btn btn-navy" id="out" type="button">Выйти</button></div>
    </div>
    <h2 id="fav">Избранное <span class="acc-n">${list.length}</span></h2>
    ${list.length ? `<div class="res-grid acc-grid">${list.map((p) => `
      <div class="cardw">
        <a class="res" href="catalog.html?p=${p.id}"><img src="${p.img}" alt="${esc(p.n)}" loading="lazy">
          <div class="res-b"><small>${esc(p.b)}</small><b>${esc(p.n)}</b><span class="res-p">${rub(p.p, p.from)}</span></div></a>
        <button type="button" class="heart on" data-fav-id="${p.id}" aria-label="Убрать из избранного"><svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg></button>
      </div>`).join('')}</div>`
      : `<div class="acc-empty"><b>Пока пусто</b><p>Нажимайте на сердечко у товара, и он появится здесь.</p><a class="btn btn-coral" href="catalog.html">Открыть каталог</a></div>`}
    <details class="acc-danger"><summary>Удалить аккаунт</summary>
      <p>Мы удалим почту, имя и избранное без возможности восстановления.</p>
      <button type="button" class="btn btn-soft" id="del">Удалить аккаунт навсегда</button></details>`;
  $('#out').onclick = async () => { await Auth.logout(); mode = 'login'; render(); };
  $('#del').onclick = async () => { if (confirm('Удалить аккаунт и всё избранное? Это нельзя отменить.')) { await Auth.remove(); mode = 'register'; render(); } };
}

function render() {
  if (!Auth.serverUp) {
    const dev = ['localhost', '127.0.0.1', ''].includes(location.hostname);
    root.innerHTML = `<div class="acc-card"><h1>Личный кабинет</h1>
      <p class="acc-sub">${dev ? 'Кабинет работает только при запущенном сервере. Запустите <code>python3 server/app.py</code> и откройте <code>http://localhost:8000</code>.' : 'Личный кабинет скоро появится. Пока избранное сохраняется в этом браузере.'}</p>
      ${Auth.favs.size ? `<p class="acc-hint">♥ Избранное в этом браузере: ${Auth.favs.size}</p>` : ''}</div>`;
    return;
  }
  Auth.user ? cabinet() : guest();
}
Auth.on(() => { if (Auth.user && document.querySelector('.acc-grid, .acc-empty')) cabinet(); });
document.addEventListener('DOMContentLoaded', () => Auth.init().then(render));
