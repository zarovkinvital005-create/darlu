(function(){
  var KEY='darli_community';
  var seedQ=[
    {id:'q1',who:'Влад',text:'Что подарить папе-инженеру, который всё делает сам?',tags:['Папе','52 года','до 5 000 ₽'],ideas:[{t:'Фигурка-конструктор по фото',best:1},{t:'Именной набор для мастерской'}]},
    {id:'q2',who:'Аня',text:'Подруга любит аниме и рисует. Что посоветуете до 3 000 ₽?',tags:['Подруге','19 лет','до 3 000 ₽'],ideas:[{t:'Журнал-обложка с её фото',best:1}]},
    {id:'q3',who:'Даня',text:'Первый Новый год с девушкой, хочу что-то со смыслом',tags:['Девушке','20 лет','Новый год'],ideas:[{t:'Винил с вашей песней',best:1}]},
    {id:'q4',who:'Лиза',text:'Бабушке 70, у неё всё есть. Что можем порадовать?',tags:['Бабушке','70 лет','без повода'],ideas:[{t:'Журнал-интервью о её жизни',best:1}]}
  ];
  var seedS=[
    {id:'s1',who:'Катя',gift:'Брелок-паук с фото',story:'Подарила брату на день рождения: он коллекционирует пауков. Увидел и сразу повесил на ключи.'},
    {id:'s2',who:'Игорь',gift:'Часы с фото',story:'Маме на юбилей. Расплакалась, теперь носит каждый день.'}
  ];
  var my=load();
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||{q:[],s:[],i:{}}}catch(e){return {q:[],s:[],i:{}}}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(my))}catch(e){}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var cols=['#F4A8A0','#E4E7F2','#FBD9D3','#D7DCEB'];
  function ava(n){return '<span class="cm-ava" style="background:'+cols[(n||'?').charCodeAt(0)%4]+'">'+esc((n||'?')[0].toUpperCase())+'</span>'}

  function renderQ(){
    var all=my.q.concat(seedQ),h='';
    all.forEach(function(q){
      var ideas=(q.ideas||[]).concat(my.i[q.id]||[]);
      var best=ideas.filter(function(i){return i.best})[0]||ideas[0];
      h+='<article class="cm-card" data-id="'+q.id+'"><div class="cm-who">'+ava(q.who)+'<b>'+esc(q.who)+'</b><span>спрашивает</span></div>'
        +'<p class="cm-q">'+esc(q.text)+'</p>'
        +'<div class="cm-tags">'+(q.tags||[]).filter(Boolean).map(function(t){return '<span>'+esc(t)+'</span>'}).join('')+'</div>'
        +(best?'<div class="cm-best"><small>'+(best.best?'Лучший ответ':'Идея')+'</small><b>'+esc(best.t)+'</b></div>':'')
        +'<div class="cm-foot"><span>'+(ideas.length?ideas.length+' '+(ideas.length%10==1&&ideas.length!=11?'идея':(ideas.length%10>1&&ideas.length%10<5&&(ideas.length<10||ideas.length>20)?'идеи':'идей'))+' от участников':'Пока нет идей')+'</span>'
        +'<button class="btn btn-soft cm-idea" type="button">Предложить идею</button></div>'
        +'<form class="cm-inline" hidden><input maxlength="80" placeholder="Ваша идея подарка" required><button class="btn btn-coral" type="submit">Отправить</button></form></article>';
    });
    document.getElementById('cmQ').innerHTML=h;
  }
  function renderS(){
    var h='';
    my.s.concat(seedS).forEach(function(s){
      h+='<article class="cm-card"><div class="cm-who">'+ava(s.who)+'<b>'+esc(s.who)+'</b><span>подарил(а)</span></div><p class="cm-q">'+esc(s.gift)+'</p>'+(s.story?'<p class="cm-story">'+esc(s.story)+'</p>':'')+'</article>';
    });
    document.getElementById('cmS').innerHTML=h;
  }
  renderQ();renderS();

  document.getElementById('cmQ').addEventListener('click',function(e){
    var b=e.target.closest('.cm-idea');if(!b)return;
    var f=b.closest('.cm-card').querySelector('.cm-inline');f.hidden=!f.hidden;if(!f.hidden)f.querySelector('input').focus();
  });
  document.getElementById('cmQ').addEventListener('submit',function(e){
    e.preventDefault();var f=e.target,id=f.closest('.cm-card').dataset.id,v=f.querySelector('input').value.trim();if(!v)return;
    (my.i[id]=my.i[id]||[]).push({t:v});save();renderQ();
  });

  var dlg=document.getElementById('cmDlg'),form=document.getElementById('cmForm'),mode='ask';
  function open(m){
    mode=m;form.reset();
    document.getElementById('cmT').textContent=m==='ask'?'Спросить совета':'Поделиться историей';
    document.getElementById('cmAskF').hidden=m!=='ask';document.getElementById('cmStF').hidden=m==='ask';
    form.text.required=m==='ask';form.gift.required=m!=='ask';
    if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
  }
  document.getElementById('cmAsk').onclick=function(){open('ask')};
  document.getElementById('cmStory').onclick=function(){open('story')};
  document.getElementById('cmX').onclick=function(){dlg.close()};
  form.addEventListener('submit',function(e){
    e.preventDefault();var d=new FormData(form),who=(d.get('who')||'').trim();if(!who)return;
    if(mode==='ask'){
      my.q.unshift({id:'m'+Date.now(),who:who,text:(d.get('text')||'').trim(),tags:[d.get('whom'),d.get('age'),d.get('budget')].map(function(x){return (x||'').trim()}),ideas:[]});renderQ();
    }else{
      my.s.unshift({id:'m'+Date.now(),who:who,gift:(d.get('gift')||'').trim(),story:(d.get('story')||'').trim()});renderS();
    }
    save();dlg.close();
  });
})();
