/* Приветственная заставка: один раз за визит (sessionStorage). Подключается в <head> каждой страницы. */
(() => {
  let seen = false;
  try { seen = sessionStorage.getItem('darli_splash') === '1'; sessionStorage.setItem('darli_splash', '1'); } catch (e) {}
  if (seen) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN = calm ? 700 : 1000, MAX = 4500;

  const css = `
  #splash{position:fixed;inset:0;z-index:99999;background:#1E2A4A;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;
    background-image:radial-gradient(rgba(244,168,160,.22) 1.5px,transparent 1.5px);background-size:26px 26px;cursor:pointer;transition:opacity .35s ease,visibility .55s}
  #splash.out{opacity:0;visibility:hidden}
  #splash .mark{width:92px;height:92px;animation:sp-pop .5s cubic-bezier(.2,.9,.3,1.3) both}
  #splash .word{display:flex;font-family:'Comfortaa',system-ui,sans-serif;font-weight:700;font-size:clamp(54px,11vw,104px);line-height:1;letter-spacing:.02em}
  #splash .word i{font-style:normal;display:inline-block;animation:sp-up .4s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(.1s + var(--k) * .06s)}
  #splash .cap{font-family:'Nunito',system-ui,sans-serif;font-weight:700;letter-spacing:.34em;text-transform:uppercase;font-size:clamp(12px,1.9vw,16px);color:#F4A8A0;animation:sp-fade .4s .45s both}
  #splash .bar{position:absolute;left:50%;bottom:9vh;width:min(220px,50vw);height:4px;border-radius:4px;background:rgba(255,255,255,.14);transform:translateX(-50%);overflow:hidden}
  #splash .bar b{display:block;height:100%;width:100%;background:#F4A8A0;border-radius:4px;transform:scaleX(0);transform-origin:left;animation:sp-bar ${MIN}ms ease-out forwards}
  #splash .sp{position:absolute;color:#F4A8A0;animation:sp-tw 2.6s ease-in-out infinite}
  @keyframes sp-pop{from{opacity:0;transform:scale(.4) rotate(-12deg)}}
  @keyframes sp-up{from{opacity:0;transform:translateY(.5em)}}
  @keyframes sp-fade{from{opacity:0;transform:translateY(8px)}}
  @keyframes sp-bar{to{transform:scaleX(1)}}
  @keyframes sp-tw{50%{opacity:.2;transform:scale(.6)}}
  @media(prefers-reduced-motion:reduce){#splash *{animation:none!important}}`;

  const word = [...'Дарлу'].map((c, k) => `<i style="--k:${k}">${c}</i>`).join('');
  const el = document.createElement('div');
  el.id = 'splash'; el.setAttribute('role', 'presentation');
  el.innerHTML = `<style>${css}</style>
    <svg class="mark" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="8" y="22" width="32" height="20" rx="4" fill="#F4A8A0"/><rect x="6" y="16" width="36" height="9" rx="4" fill="#F7B9B2"/>
      <rect x="21" y="16" width="6" height="26" rx="2" fill="#E98A82"/><path d="M24 16C16 15 11 9 14 6c3-3 8 0 10 10 2-10 7-13 10-10 3 3-2 9-10 10z" fill="#E98A82"/>
    </svg>
    <div class="word" aria-label="Дарлу">${word}</div>
    <div class="cap">Подарки на заказ</div>
    <div class="bar"><b></b></div>
    <span class="sp" style="left:18%;top:24%;font-size:22px">✦</span><span class="sp" style="right:20%;top:30%;font-size:14px;animation-delay:.9s">✦</span>
    <span class="sp" style="left:26%;bottom:26%;font-size:12px;animation-delay:1.6s">✦</span><span class="sp" style="right:24%;bottom:22%;font-size:20px;animation-delay:.4s">✦</span>`;
  document.documentElement.appendChild(el); // сразу, до отрисовки страницы: без «мигания»

  const t0 = performance.now();
  let done = false;
  const hide = () => {
    if (done) return; done = true;
    el.classList.add('out');
    setTimeout(() => el.remove(), 400);
  };
  const ready = () => { const wait = Math.max(0, MIN - (performance.now() - t0)); setTimeout(hide, wait); };
  if (document.readyState === 'complete') ready(); else addEventListener('load', ready, { once: true });
  setTimeout(hide, MAX);          // страховка: не держим заставку дольше 4,5 с
  el.addEventListener('click', hide);
  addEventListener('keydown', hide, { once: true });
})();
