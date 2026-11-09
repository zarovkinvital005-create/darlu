// Ролик «Как мы ищем бренды» пока не загружен: честно говорим об этом, а не оставляем мёртвую кнопку.
const v = document.getElementById('abVideo'), cap = document.getElementById('abCap');
v.addEventListener('click', () => {
  cap.textContent = 'Видео скоро появится';
  setTimeout(() => { cap.textContent = 'Видео: как мы ищем бренды'; }, 2200);
});
