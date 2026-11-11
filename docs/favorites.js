const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rub = (v, from) => (from ? 'от ' : '') + v.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';
const word = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'подарок' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'подарка' : 'подарков');
function render() {
  const list = products.filter((p) => Auth.favs.has(p.id));
  document.getElementById('favN').textContent = list.length ? `· ${list.length} ${word(list.length)}` : '';
  document.getElementById('favEmpty').hidden = list.length > 0;
  document.getElementById('favGrid').innerHTML = list.map((p) => `
    <div class="cardw">
      <a class="res prod2" href="catalog.html?p=${encodeURIComponent(p.id)}" aria-label="${esc(p.n)}, ${rub(p.p, p.from)}">
        ${p.hit ? '<span class="hit-tag">Хит</span>' : ''}
        <img src="${p.img}" alt="${esc(p.n)}" loading="lazy">
        <div class="res-b"><small>${esc(p.b)}</small><b>${esc(p.n)}</b><span class="res-p">${rub(p.p, p.from)}</span></div>
      </a>
      <button type="button" class="heart on" data-fav-id="${p.id}" aria-label="Убрать из избранного"><svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg></button>
    </div>`).join('');
}
Auth.on(render);
render();
