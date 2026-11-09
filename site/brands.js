const form = document.getElementById('brandForm'), note = document.getElementById('formNote'), btn = document.getElementById('send');
const TO = 'zarovkinvital@mail.ru';
const say = (t, cls) => { note.textContent = t; note.className = 'b-note ' + (cls || ''); };

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if (d.website) return; // ловушка для ботов
  const need = ['name', 'link', 'contact'].find((k) => !String(d[k] || '').trim());
  if (need) { form.elements[need].focus(); return say('Заполните название, ссылку и контакт.', 'err'); }
  btn.disabled = true; btn.textContent = 'Отправляем…';
  try {
    const r = await fetch('/api/brand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
    if (!r.ok) throw new Error(String(r.status));
    form.reset();
    say('Спасибо! Заявка отправлена, мы свяжемся с вами.', 'ok');
  } catch (err) {
    // сервера нет или почта не настроена: открываем письмо в почтовой программе, уже адресованное команде
    const body = `Название бренда: ${d.name}\nСайт или соцсети: ${d.link}\nЧто делаем: ${d.kind}\nКонтакт: ${d.contact}`;
    location.href = `mailto:${TO}?subject=${encodeURIComponent('Заявка бренда на Дарли: ' + d.name)}&body=${encodeURIComponent(body)}`;
    say('Открыли письмо в вашей почте: осталось нажать «Отправить». Если не открылось, напишите на ' + TO, '');
  }
  btn.disabled = false; btn.textContent = 'Отправить заявку';
});
