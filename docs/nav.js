/* Мобильное меню: те же разделы, что и в шапке на компьютере */
(function(){
  var hdr=document.querySelector('.hdr'),nav=document.querySelector('.hdr .nav'),r=document.querySelector('.hdr-r');
  if(!hdr||!nav||!r)return;
  var b=document.createElement('button');
  b.className='icon-btn burger';b.type='button';b.setAttribute('aria-label','Меню');b.setAttribute('aria-expanded','false');
  b.innerHTML='<svg viewBox="0 0 24 24"><path class="b1" d="M4 7h16"/><path class="b2" d="M4 12h16"/><path class="b3" d="M4 17h16"/></svg>';
  r.appendChild(b);
  var p=document.createElement('nav');
  p.className='m-nav';p.setAttribute('aria-label','Разделы');p.hidden=true;
  p.innerHTML=nav.innerHTML+'<a class="btn btn-coral" href="ai.html">Подобрать подарок</a>';
  hdr.appendChild(p);
  function set(o){p.hidden=!o;b.setAttribute('aria-expanded',o);hdr.classList.toggle('open',o)}
  b.addEventListener('click',function(){set(p.hidden)});
  p.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
  window.addEventListener('resize',function(){if(innerWidth>1100)set(false)});
})();
