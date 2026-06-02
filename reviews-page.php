<?php header('Content-Type: text/html; charset=utf-8'); ?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Отзывы — Kedem Tours</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --gold:#c9a84c; --gold-light:#e8c96a; --dark:#1a1a2e; --accent:#0f3460; --white:#fff; --bg:#f8f5f0; --shadow:0 4px 20px rgba(0,0,0,.09); }
    body { font-family: 'Open Sans', sans-serif; background: var(--bg); color: #2d2d2d; display:flex; flex-direction:column; min-height:100vh; }

    header { background: linear-gradient(135deg,var(--dark),var(--accent)); box-shadow: 0 2px 20px rgba(0,0,0,.3); }
    .header-inner { max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:12px 20px; }
    .logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
    .logo-icon { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--gold),var(--gold-light)); display:flex; align-items:center; justify-content:center; font-size:18px; color:var(--dark); overflow:hidden; flex-shrink:0; }
    .logo-icon img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
    .logo-name { font-family:'Montserrat',sans-serif; font-weight:800; font-size:1.1rem; color:var(--white); letter-spacing:1px; }
    .logo-sub  { font-size:.6rem; color:var(--gold-light); letter-spacing:2px; text-transform:uppercase; }
    .back-btn  { display:inline-flex; align-items:center; gap:5px; background:transparent; border:1.5px solid var(--gold-light); color:var(--gold-light); text-decoration:none; font-size:.68rem; font-family:'Montserrat',sans-serif; font-weight:600; padding:4px 10px; border-radius:20px; white-space:nowrap; }

    /* HERO */
    .reviews-hero { background: linear-gradient(135deg, var(--accent) 0%, var(--dark) 100%); padding: 24px 20px; text-align: center; }
    .reviews-hero h1 { font-family:'Montserrat',sans-serif; font-weight:800; font-size:1.4rem; color:var(--white); margin-bottom:4px; }
    .reviews-hero h1 span { color:var(--gold); }
    .reviews-hero p { color:rgba(255,255,255,.75); font-size:.8rem; }

    .section { max-width:1000px; margin:0 auto; padding:20px 16px 100px; flex:1; width:100%; }

    /* STATS */
    .stats-row { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:20px; }
    .stat-pill { background:var(--white); border-radius:12px; padding:12px 24px; text-align:center; box-shadow:var(--shadow); }
    .stat-num  { font-family:'Montserrat',sans-serif; font-weight:800; font-size:1.4rem; color:var(--accent); }
    .stat-lbl  { font-size:.72rem; color:#888; margin-top:2px; }

    /* REVIEWS GRID */
    .r-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; margin-bottom:20px; }
    .r-card { background:var(--white); border-radius:12px; padding:14px; box-shadow:var(--shadow); display:flex; flex-direction:column; gap:6px; }
    .r-top  { display:flex; align-items:center; justify-content:space-between; }
    .r-name { font-family:'Montserrat',sans-serif; font-weight:700; font-size:.85rem; color:var(--accent); }
    .r-stars{ color:#f59e0b; font-size:.85rem; }
    .r-exc  { font-size:.7rem; color:var(--gold); font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
    .r-text { font-size:.82rem; color:#444; line-height:1.45; }
    .r-date { font-size:.7rem; color:#bbb; }

    .no-reviews { text-align:center; padding:40px 20px; color:#aaa; }
    .no-reviews i { font-size:2.5rem; display:block; margin-bottom:12px; color:#ddd; }

    /* FAB */
    .review-fab { position:fixed; bottom:24px; right:20px; z-index:300; background:linear-gradient(135deg,var(--gold),var(--gold-light)); color:var(--dark); border:none; border-radius:30px; padding:13px 22px; font-family:'Montserrat',sans-serif; font-weight:800; font-size:.95rem; cursor:pointer; box-shadow:0 4px 20px rgba(201,168,76,.5); display:flex; align-items:center; gap:8px; }
    .review-fab:active { transform:scale(0.95); }

    /* OVERLAY */
    .sheet-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:400; }
    .sheet-overlay.open { display:block; }

    /* BOTTOM SHEET */
    .review-sheet { position:fixed; bottom:0; left:0; right:0; z-index:401; background:var(--white); border-radius:20px 20px 0 0; padding:20px 20px 32px; max-height:92vh; overflow-y:auto; transform:translateY(100%); transition:transform .35s cubic-bezier(.32,1,.23,1); box-shadow:0 -8px 40px rgba(0,0,0,.2); }
    .review-sheet.open { transform:translateY(0); }
    .sheet-handle { width:40px; height:4px; background:#ddd; border-radius:4px; margin:0 auto 16px; }
    .sheet-close { position:absolute; top:14px; right:14px; background:rgba(0,0,0,.07); border:none; border-radius:50%; width:28px; height:28px; font-size:.9rem; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#555; }
    .form-title { font-family:'Montserrat',sans-serif; font-weight:800; font-size:1rem; color:var(--accent); margin-bottom:3px; }
    .form-sub   { color:#888; font-size:.75rem; margin-bottom:14px; }
    .form-row   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .form-group { margin-bottom:10px; }
    .form-group label { display:block; font-weight:600; font-size:.75rem; color:var(--accent); margin-bottom:3px; }
    .form-group input, .form-group select, .form-group textarea { width:100%; padding:8px 10px; border:2px solid #e0e0e0; border-radius:8px; font-family:'Open Sans',sans-serif; font-size:.82rem; outline:none; transition:border-color .2s; background:#fafafa; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color:var(--gold); background:var(--white); }
    .form-group textarea { resize:vertical; min-height:80px; }
    .star-picker { display:flex; gap:4px; margin-bottom:10px; }
    .star-picker label { font-size:1.6rem; cursor:pointer; color:#ddd; transition:color .15s; }
    .star-picker label.active { color:#f59e0b; }
    .submit-btn { width:100%; padding:11px; background:linear-gradient(135deg,var(--gold),var(--gold-light)); color:var(--dark); border:none; border-radius:10px; font-family:'Montserrat',sans-serif; font-weight:700; font-size:.9rem; cursor:pointer; transition:opacity .2s; margin-top:4px; }
    .submit-btn:hover { opacity:.9; }
    .submit-btn:disabled { opacity:.6; cursor:not-allowed; }
    .form-msg { text-align:center; padding:10px; border-radius:8px; font-weight:600; font-size:.82rem; margin-top:8px; display:none; }
    .form-msg.success { background:#d4edda; color:#155724; display:block; }
    .form-msg.error   { background:#f8d7da; color:#721c24; display:block; }

    footer { background:var(--dark); color:rgba(255,255,255,.7); text-align:center; padding:20px; font-size:.82rem; }
    footer strong { color:var(--gold); }

    @media (max-width:560px) { .form-row { grid-template-columns:1fr; } }
  </style>
</head>
<body>

<header>
  <div class="header-inner">
    <a class="logo" href="/" id="logoLink">
      <div class="logo-icon" id="logoIcon"><i class="fa fa-compass"></i></div>
      <div>
        <div class="logo-name" id="logoName">KEDEM TOURS</div>
        <div class="logo-sub" id="logoSub">Экскурсии по Израилю</div>
      </div>
    </a>
    <a class="back-btn" href="/"><i class="fa fa-arrow-left"></i> На главную</a>
  </div>
</header>

<div class="reviews-hero">
  <h1>Отзывы <span>наших клиентов</span></h1>
  <p>Мнения тех, кто уже открыл Израиль вместе с нами</p>
</div>

<div class="section">
  <div class="stats-row" id="statsRow"></div>
  <div class="r-grid" id="reviewsGrid">
    <div class="no-reviews" style="grid-column:1/-1"><i class="fa fa-spinner fa-spin"></i>Загружаем отзывы...</div>
  </div>
</div>

<footer><p>&copy; 2024 <strong id="footerName">Kedem Tours</strong>. Все права защищены.</p></footer>

<!-- FAB -->
<button class="review-fab" onclick="openSheet()"><i class="fa fa-pen"></i> Оставить отзыв</button>

<!-- OVERLAY -->
<div class="sheet-overlay" id="sheetOverlay" onclick="closeSheet()"></div>

<!-- BOTTOM SHEET -->
<div class="review-sheet" id="reviewSheet">
  <div class="sheet-handle"></div>
  <button class="sheet-close" onclick="closeSheet()"><i class="fa fa-times"></i></button>
  <div class="form-title">Оставить отзыв</div>
  <div class="form-sub">Расскажите о вашей экскурсии</div>
  <form id="reviewForm" novalidate>
    <div class="form-group">
      <label>Ваша оценка *</label>
      <div class="star-picker" id="starPicker">
        <label id="s5" onclick="setStar(5)">★</label>
        <label id="s4" onclick="setStar(4)">★</label>
        <label id="s3" onclick="setStar(3)">★</label>
        <label id="s2" onclick="setStar(2)">★</label>
        <label id="s1" onclick="setStar(1)">★</label>
      </div>
      <input type="hidden" id="rRating" value="5"/>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Ваше имя *</label><input type="text" id="rName" placeholder="Иван Иванов"/></div>
      <div class="form-group"><label>Экскурсия</label><select id="rExcursion"><option value="">— не выбрана —</option></select></div>
    </div>
    <div class="form-group"><label>Ваш отзыв *</label><textarea id="rText" placeholder="Что особенно понравилось?"></textarea></div>
    <button type="submit" class="submit-btn" id="submitBtn"><i class="fa fa-paper-plane"></i>&nbsp; Отправить отзыв</button>
    <div class="form-msg" id="formMsg"></div>
  </form>
</div>

<script>
var selectedRating = 5;
setStar(5);

function setStar(n) {
  selectedRating = n;
  document.getElementById('rRating').value = n;
  for (var i = 1; i <= 5; i++) document.getElementById('s' + i).classList.toggle('active', i <= n);
}

function openSheet() {
  document.getElementById('reviewSheet').classList.add('open');
  document.getElementById('sheetOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSheet() {
  document.getElementById('reviewSheet').classList.remove('open');
  document.getElementById('sheetOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Настройки
(function(s){ if(!s) return;
  if(s.logo_image) document.getElementById('logoIcon').innerHTML='<img src="'+s.logo_image+'" alt="logo">';
  if(s.logo_text){ document.getElementById('logoName').textContent=s.logo_text; document.getElementById('footerName').textContent=s.logo_text; }
  if(s.logo_sub) document.getElementById('logoSub').textContent=s.logo_sub;
})(JSON.parse(localStorage.getItem('site_settings')||'null'));

fetch('/settings.php').then(function(r){return r.json();}).then(function(s){
  localStorage.setItem('site_settings',JSON.stringify(s));
  if(s.logo_image) document.getElementById('logoIcon').innerHTML='<img src="'+s.logo_image+'" alt="logo">';
  if(s.logo_text){ document.getElementById('logoName').textContent=s.logo_text; document.getElementById('footerName').textContent=s.logo_text; }
  if(s.logo_sub) document.getElementById('logoSub').textContent=s.logo_sub;
}).catch(function(){});

// Экскурсии в select
fetch('/api/excursions.php').then(function(r){return r.json();}).then(function(list){
  var sel=document.getElementById('rExcursion');
  list.forEach(function(e){ var o=document.createElement('option'); o.value=o.textContent=e.title; sel.appendChild(o); });
}).catch(function(){});

// Отзывы
fetch('/reviews.php').then(function(r){return r.json();}).then(function(reviews){
  var grid=document.getElementById('reviewsGrid');
  var statsRow=document.getElementById('statsRow');
  if(reviews.length){
    var avg=(reviews.reduce(function(s,r){return s+(r.rating||5);},0)/reviews.length).toFixed(1);
    statsRow.innerHTML='<div class="stat-pill"><div class="stat-num">'+reviews.length+'</div><div class="stat-lbl">Отзывов</div></div>'+
      '<div class="stat-pill"><div class="stat-num">'+avg+' <span style="color:#f59e0b;font-size:1.1rem">★</span></div><div class="stat-lbl">Средняя оценка</div></div>';
  }
  if(!reviews.length){ grid.innerHTML='<div class="no-reviews" style="grid-column:1/-1"><i class="fa fa-comments"></i>Отзывов пока нет. Станьте первым!</div>'; return; }
  grid.innerHTML=reviews.map(function(r){
    var stars=''; for(var i=0;i<5;i++) stars+=i<r.rating?'★':'☆';
    return '<div class="r-card"><div class="r-top"><div class="r-name">'+r.name+'</div><div class="r-stars">'+stars+'</div></div>'+
      (r.excursion?'<div class="r-exc">'+r.excursion+'</div>':'')+
      '<div class="r-text">'+r.text+'</div><div class="r-date">'+new Date(r.date).toLocaleDateString('ru-RU')+'</div></div>';
  }).join('');
}).catch(function(){
  document.getElementById('reviewsGrid').innerHTML='<div class="no-reviews" style="grid-column:1/-1"><i class="fa fa-exclamation-circle"></i>Не удалось загрузить отзывы</div>';
});

// Отправка
document.getElementById('reviewForm').addEventListener('submit',function(e){
  e.preventDefault();
  var name=document.getElementById('rName').value.trim();
  var text=document.getElementById('rText').value.trim();
  var msg=document.getElementById('formMsg');
  var btn=document.getElementById('submitBtn');
  if(!name||!text){ msg.textContent='Пожалуйста, заполните имя и текст отзыва'; msg.className='form-msg error'; return; }
  btn.disabled=true; btn.textContent='Отправляем...';
  fetch('/reviews.php',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:name,text:text,rating:selectedRating,excursion:document.getElementById('rExcursion').value})
  }).then(function(r){return r.json();}).then(function(data){
    if(data.success){
      msg.textContent='✅ Спасибо! Ваш отзыв отправлен на модерацию.';
      msg.className='form-msg success';
      document.getElementById('reviewForm').reset(); setStar(5);
    } else { msg.textContent=data.error||'Ошибка. Попробуйте ещё раз.'; msg.className='form-msg error'; }
  }).catch(function(){ msg.textContent='Ошибка соединения.'; msg.className='form-msg error';
  }).finally(function(){ btn.disabled=false; btn.innerHTML='<i class="fa fa-paper-plane"></i>&nbsp; Отправить отзыв'; });
});
</script>
</body>
</html>
