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
    body { font-family: 'Open Sans', sans-serif; background: var(--bg); color: #2d2d2d; }

    header { background: linear-gradient(135deg,var(--dark),var(--accent)); box-shadow: 0 2px 20px rgba(0,0,0,.3); }
    .header-inner { max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:14px 24px; }
    .logo { display:flex; align-items:center; gap:12px; text-decoration:none; }
    .logo-icon { width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,var(--gold),var(--gold-light)); display:flex; align-items:center; justify-content:center; font-size:20px; color:var(--dark); overflow:hidden; }
    .logo-icon img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
    .logo-name { font-family:'Montserrat',sans-serif; font-weight:800; font-size:1.3rem; color:var(--white); letter-spacing:1px; }
    .logo-sub  { font-size:.65rem; color:var(--gold-light); letter-spacing:2px; text-transform:uppercase; }
    .back-btn  { color:var(--gold-light); text-decoration:none; font-size:.9rem; display:flex; align-items:center; gap:6px; }
    .back-btn:hover { color:var(--gold); }

    /* HERO */
    .reviews-hero {
      background: linear-gradient(135deg, var(--accent) 0%, var(--dark) 100%);
      padding: 52px 24px; text-align: center;
    }
    .reviews-hero h1 { font-family:'Montserrat',sans-serif; font-weight:800; font-size:clamp(1.6rem,4vw,2.4rem); color:var(--white); margin-bottom:10px; }
    .reviews-hero h1 span { color:var(--gold); }
    .reviews-hero p { color:rgba(255,255,255,.75); font-size:.95rem; }

    .section { max-width:1000px; margin:0 auto; padding:48px 24px; }

    /* STATS */
    .stats-row { display:flex; gap:24px; justify-content:center; flex-wrap:wrap; margin-bottom:40px; }
    .stat-pill { background:var(--white); border-radius:14px; padding:20px 32px; text-align:center; box-shadow:var(--shadow); }
    .stat-num  { font-family:'Montserrat',sans-serif; font-weight:800; font-size:2rem; color:var(--accent); }
    .stat-lbl  { font-size:.8rem; color:#888; margin-top:2px; }

    /* REVIEWS GRID */
    .r-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; margin-bottom:48px; }
    .r-card { background:var(--white); border-radius:16px; padding:24px; box-shadow:var(--shadow); display:flex; flex-direction:column; gap:10px; }
    .r-top  { display:flex; align-items:center; justify-content:space-between; }
    .r-name { font-family:'Montserrat',sans-serif; font-weight:700; font-size:.95rem; color:var(--accent); }
    .r-stars{ color:#f59e0b; letter-spacing:2px; }
    .r-exc  { font-size:.75rem; color:var(--gold); font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
    .r-text { font-size:.88rem; color:#444; line-height:1.45; flex:1; }
    .r-date { font-size:.75rem; color:#bbb; }

    .no-reviews { text-align:center; padding:60px 20px; color:#aaa; }
    .no-reviews i { font-size:3rem; display:block; margin-bottom:16px; color:#ddd; }

    /* FORM */
    .form-section {
      background:var(--white); border-radius:20px; padding:36px;
      box-shadow:var(--shadow); border-top:4px solid var(--gold);
    }
    .form-title { font-family:'Montserrat',sans-serif; font-weight:800; font-size:1.3rem; color:var(--accent); margin-bottom:6px; }
    .form-sub   { color:#888; font-size:.9rem; margin-bottom:24px; }
    .form-row   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .form-group { margin-bottom:18px; }
    .form-group label { display:block; font-weight:600; font-size:.85rem; color:var(--accent); margin-bottom:6px; }
    .form-group input,
    .form-group select,
    .form-group textarea {
      width:100%; padding:11px 14px; border:2px solid #e0e0e0; border-radius:10px;
      font-family:'Open Sans',sans-serif; font-size:.9rem; outline:none;
      transition:border-color .2s; background:#fafafa;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color:var(--gold); background:var(--white); }
    .form-group textarea { resize:vertical; min-height:110px; }
    .submit-btn {
      width:100%; padding:14px; background:linear-gradient(135deg,var(--gold),var(--gold-light));
      color:var(--dark); border:none; border-radius:12px;
      font-family:'Montserrat',sans-serif; font-weight:700; font-size:1rem;
      cursor:pointer; transition:opacity .2s; margin-top:4px;
    }
    .submit-btn:hover { opacity:.9; }
    .submit-btn:disabled { opacity:.6; cursor:not-allowed; }
    .form-msg { text-align:center; padding:12px; border-radius:10px; font-weight:600; font-size:.9rem; margin-top:14px; display:none; }
    .form-msg.success { background:#d4edda; color:#155724; display:block; }
    .form-msg.error   { background:#f8d7da; color:#721c24; display:block; }

    /* STAR PICKER */
    .star-picker { display:flex; gap:6px; margin-bottom:18px; }
    .star-picker input { display:none; }
    .star-picker label { font-size:1.8rem; cursor:pointer; color:#ddd; transition:color .15s; }
    .star-picker label:hover,
    .star-picker label.active { color:#f59e0b; }

    footer { background:var(--dark); color:rgba(255,255,255,.7); text-align:center; padding:24px; font-size:.85rem; margin-top:48px; }
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

  <!-- Статистика -->
  <div class="stats-row" id="statsRow"></div>

  <!-- Список отзывов -->
  <div class="r-grid" id="reviewsGrid">
    <div class="no-reviews" style="grid-column:1/-1">
      <i class="fa fa-spinner fa-spin"></i>
      Загружаем отзывы...
    </div>
  </div>

  <!-- Форма -->
  <div class="form-section">
    <div class="form-title">Оставить отзыв</div>
    <div class="form-sub">Расскажите о вашей экскурсии — это поможет другим путешественникам</div>

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
        <div class="form-group">
          <label>Ваше имя *</label>
          <input type="text" id="rName" placeholder="Иван Иванов"/>
        </div>
        <div class="form-group">
          <label>Экскурсия</label>
          <select id="rExcursion"><option value="">— не выбрана —</option></select>
        </div>
      </div>
      <div class="form-group">
        <label>Ваш отзыв *</label>
        <textarea id="rText" placeholder="Что особенно понравилось? Как прошла экскурсия?"></textarea>
      </div>
      <button type="submit" class="submit-btn" id="submitBtn">
        <i class="fa fa-paper-plane"></i>&nbsp; Отправить отзыв
      </button>
      <div class="form-msg" id="formMsg"></div>
    </form>
  </div>

</div>

<footer>
  <p>&copy; 2024 <strong id="footerName">Kedem Tours</strong>. Все права защищены.</p>
</footer>

<script>
var selectedRating = 5;
setStar(5);

function setStar(n) {
  selectedRating = n;
  document.getElementById('rRating').value = n;
  for (var i = 1; i <= 5; i++) {
    document.getElementById('s' + i).classList.toggle('active', i <= n);
  }
}

// Загрузка настроек сайта
fetch('/settings.php').then(function(r){ return r.json(); }).then(function(s) {
  if (s.logo_image) document.getElementById('logoIcon').innerHTML = '<img src="' + s.logo_image + '" alt="logo">';
  if (s.logo_text)  { document.getElementById('logoName').textContent = s.logo_text; document.getElementById('footerName').textContent = s.logo_text; }
  if (s.logo_sub)   document.getElementById('logoSub').textContent = s.logo_sub;
}).catch(function(){});

// Загрузка экскурсий в select
fetch('/api/excursions.php').then(function(r){ return r.json(); }).then(function(list) {
  var sel = document.getElementById('rExcursion');
  list.forEach(function(e) {
    var opt = document.createElement('option');
    opt.value = opt.textContent = e.title;
    sel.appendChild(opt);
  });
}).catch(function(){});

// Загрузка отзывов
fetch('/reviews.php').then(function(r){ return r.json(); }).then(function(reviews) {
  var grid = document.getElementById('reviewsGrid');
  var statsRow = document.getElementById('statsRow');

  // Статистика
  if (reviews.length) {
    var avg = (reviews.reduce(function(s,r){ return s + (r.rating||5); }, 0) / reviews.length).toFixed(1);
    statsRow.innerHTML =
      '<div class="stat-pill"><div class="stat-num">' + reviews.length + '</div><div class="stat-lbl">Отзывов</div></div>' +
      '<div class="stat-pill"><div class="stat-num">' + avg + ' <span style="color:#f59e0b;font-size:1.5rem">★</span></div><div class="stat-lbl">Средняя оценка</div></div>';
  }

  // Карточки
  if (!reviews.length) {
    grid.innerHTML = '<div class="no-reviews" style="grid-column:1/-1"><i class="fa fa-comments"></i>Отзывов пока нет. Станьте первым!</div>';
    return;
  }
  grid.innerHTML = reviews.map(function(r) {
    var stars = '';
    for (var i=0;i<5;i++) stars += i < r.rating ? '★' : '☆';
    return '<div class="r-card">' +
      '<div class="r-top"><div class="r-name">' + r.name + '</div><div class="r-stars">' + stars + '</div></div>' +
      (r.excursion ? '<div class="r-exc">' + r.excursion + '</div>' : '') +
      '<div class="r-text">' + r.text + '</div>' +
      '<div class="r-date">' + new Date(r.date).toLocaleDateString('ru-RU') + '</div>' +
    '</div>';
  }).join('');
}).catch(function(){
  document.getElementById('reviewsGrid').innerHTML =
    '<div class="no-reviews" style="grid-column:1/-1"><i class="fa fa-exclamation-circle"></i>Не удалось загрузить отзывы</div>';
});

// Отправка отзыва
document.getElementById('reviewForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var name = document.getElementById('rName').value.trim();
  var text = document.getElementById('rText').value.trim();
  var msg  = document.getElementById('formMsg');
  var btn  = document.getElementById('submitBtn');
  if (!name || !text) {
    msg.textContent = 'Пожалуйста, заполните имя и текст отзыва';
    msg.className = 'form-msg error';
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Отправляем...';
  fetch('/reviews.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      text: text,
      rating: selectedRating,
      excursion: document.getElementById('rExcursion').value
    })
  }).then(function(r){ return r.json(); }).then(function(data) {
    if (data.success) {
      msg.textContent = '✅ Спасибо! Ваш отзыв отправлен на модерацию и появится после проверки.';
      msg.className = 'form-msg success';
      document.getElementById('reviewForm').reset();
      setStar(5);
    } else {
      msg.textContent = data.error || 'Ошибка. Попробуйте ещё раз.';
      msg.className = 'form-msg error';
    }
  }).catch(function() {
    msg.textContent = 'Ошибка соединения. Попробуйте позже.';
    msg.className = 'form-msg error';
  }).finally(function() {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-paper-plane"></i>&nbsp; Отправить отзыв';
  });
});
</script>
</body>
</html>
