/* Общая логика входа и избранного. Гости хранят избранное в браузере, после входа оно переносится в аккаунт. */
const Auth = (() => {
  const LS = 'darli_favs';
  let user = null, favs = new Set(), subs = [], serverUp = true;
  try { favs = new Set(JSON.parse(localStorage.getItem(LS) || '[]')); } catch (e) {}
  const save = () => { try { localStorage.setItem(LS, JSON.stringify([...favs])); } catch (e) {} };

  async function post(path, body) {
    try {
      const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
      const d = await r.json().catch(() => ({}));
      return { ok: r.ok, status: r.status, ...d };
    } catch (e) { return { ok: false, status: 0, message: 'Нет связи с сервером. Кабинет работает только при запущенном сервере.' }; }
  }
  function paint() {
    document.querySelectorAll('[data-auth="fav"]').forEach((a) => {
      const b = a.querySelector('.badge'); if (!b) return;
      b.textContent = favs.size; b.hidden = !favs.size;
    });
    document.querySelectorAll('[data-auth="me"]').forEach((a) => a.classList.toggle('in', !!user));
    document.querySelectorAll('[data-fav-id]').forEach((el) => {
      const on = favs.has(el.dataset.favId);
      el.classList.toggle('on', on); el.setAttribute('aria-pressed', on);
      if (el.dataset.favText) el.textContent = on ? 'В избранном ♥' : 'В избранное ♡';
    });
    subs.forEach((f) => f());
  }
  async function init() {
    try {
      const r = await fetch('/api/me');
      if (!r.ok) throw 0;
      const d = await r.json(); user = d.user;
      if (user) {
        if (favs.size) { const m = await post('/api/favs/merge', { ids: [...favs] }); if (m.favs) d.favs = m.favs; }
        favs = new Set(d.favs); save();
      }
    } catch (e) { serverUp = false; }
    paint();
  }
  async function toggle(id) {
    const on = !favs.has(id);
    on ? favs.add(id) : favs.delete(id); save(); paint();
    if (user) { const r = await post('/api/favs', { id, on }); if (r.favs) { favs = new Set(r.favs); save(); paint(); } }
    return on;
  }
  async function login(email, password) { const r = await post('/api/login', { email, password }); if (r.ok) await init(); return r; }
  async function register(name, email, password) { const r = await post('/api/register', { name, email, password }); if (r.ok) await init(); return r; }
  async function logout() { await post('/api/logout'); user = null; favs = new Set(); save(); paint(); }
  async function remove() { const r = await post('/api/account/delete'); if (r.ok) { user = null; favs = new Set(); save(); paint(); } return r; }
  // кнопка «в избранное» для карточки товара
  function bind(btn, id) { btn.dataset.favId = id; btn.dataset.favText = '1'; btn.onclick = () => toggle(id); paint(); }
  document.addEventListener('click', (e) => { const h = e.target.closest('.heart[data-fav-id]'); if (h) { e.preventDefault(); toggle(h.dataset.favId); } });
  document.addEventListener('DOMContentLoaded', init);
  return { init, toggle, login, register, logout, remove, bind, paint, on: (f) => subs.push(f),
    get user() { return user; }, get favs() { return favs; }, get serverUp() { return serverUp; } };
})();
