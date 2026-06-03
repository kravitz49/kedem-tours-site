<?php
header('Content-Type: text/html; charset=utf-8');
$id   = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$file = __DIR__ . '/excursions.json';
$all  = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
$exc  = null;
foreach ($all as $e) { if ($e['id'] == $id) { $exc = $e; break; } }
if (!$exc) { header('Location: /'); exit; }

$title    = htmlspecialchars($exc['title']);
$desc     = htmlspecialchars($exc['desc'] ?? '');
$descFull = nl2br(htmlspecialchars($exc['desc_full'] ?? ''));
$image    = htmlspecialchars($exc['image'] ?? '');
$tag      = htmlspecialchars($exc['tag'] ?? '');
$duration = htmlspecialchars($exc['duration'] ?? '');
$icon     = $exc['icon'] ?? '🗺️';
$bg       = htmlspecialchars($exc['bg'] ?? '#e8f4f8');
?><!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title><?= $title ?> — KEDEM TOURS</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --gold:#c9a84c; --gold-light:#e8c96a; --dark:#1a1a2e; --accent:#0f3460; --white:#fff; --bg:#f8f5f0; --radius:14px; }
    body { font-family: 'Open Sans', sans-serif; background: var(--bg); color: #2d2d2d; }

    /* HEADER */
    header { background: linear-gradient(135deg,var(--dark),var(--accent)); position:sticky; top:0; z-index:100; box-shadow: 0 2px 20px rgba(0,0,0,.3); }
    .header-inner { max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:12px 24px; gap:12px; }
    .logo { display:flex; align-items:center; gap:12px; text-decoration:none; flex-shrink:0; }
    .logo-icon { width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,var(--gold),var(--gold-light)); display:flex; align-items:center; justify-content:center; font-size:20px; color:var(--dark); overflow:hidden; flex-shrink:0; }
    .logo-icon img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
    .logo-name { font-family:'Montserrat',sans-serif; font-weight:800; font-size:1.3rem; color:var(--white); letter-spacing:1px; }
    .logo-sub { font-size:.65rem; color:var(--gold-light); letter-spacing:2px; text-transform:uppercase; }
    .back-btn { color:var(--gold-light); text-decoration:none; font-size:.9rem; display:flex; align-items:center; gap:8px; transition:color .2s; white-space:nowrap; }
    .back-btn:hover { color:var(--gold); }
    @media (max-width:640px) {
      .header-inner { padding:10px 16px; }
      .logo-icon { width:36px; height:36px; font-size:16px; }
      .logo-name { font-size:1.1rem; }
      .logo-sub { display:none; }
    }

    /* HERO IMAGE */
    .exc-hero {
      width:100%; height:420px; position:relative; overflow:hidden;
      background: <?= $image ? 'var(--dark)' : $bg ?>;
      display:flex; align-items:center; justify-content:center;
    }
    .exc-hero img { width:100%; height:100%; object-fit:cover; display:block; }
    .exc-hero-placeholder { font-size:8rem; }
    .exc-hero-overlay {
      position:absolute; inset:0;
      background:linear-gradient(to top, rgba(15,52,96,.85) 0%, rgba(15,52,96,.2) 60%, transparent 100%);
    }
    .exc-hero-text { position:absolute; bottom:0; left:0; right:0; padding:32px; }
    .exc-hero-text .tag { display:inline-block; background:var(--gold); color:var(--dark); font-size:.75rem; font-weight:700; padding:4px 12px; border-radius:20px; margin-bottom:12px; text-transform:uppercase; letter-spacing:.5px; }
    .exc-hero-text h1 { font-family:'Montserrat',sans-serif; font-weight:800; font-size:clamp(1.6rem,4vw,2.5rem); color:var(--white); line-height:1.2; margin-bottom:10px; }
    .exc-hero-text .meta { display:flex; gap:20px; flex-wrap:wrap; }
    .exc-meta-item { color:rgba(255,255,255,.85); font-size:.9rem; display:flex; align-items:center; gap:6px; }
    .exc-meta-item i { color:var(--gold); }

    /* CONTENT */
    .exc-content { max-width:800px; margin:0 auto; padding:48px 24px; }
    .exc-desc-short { font-size:0.9rem; color:#444; line-height:1.5; margin-bottom:28px; padding-bottom:28px; border-bottom:2px solid #e8e0d0; font-weight:600; }
    .exc-desc-full { font-size:0.88rem; color:#555; line-height:1.5; }
    .exc-desc-full p { margin-bottom:16px; }

    /* BOOK BLOCK */
    .book-block {
      background:var(--white); border-radius:20px; padding:32px;
      box-shadow:0 8px 32px rgba(0,0,0,.1); margin-top:48px;
      border-top:4px solid var(--gold);
    }
    .book-title { font-family:'Montserrat',sans-serif; font-weight:800; font-size:1.3rem; color:var(--accent); margin-bottom:6px; }
    .book-sub { color:#888; font-size:.9rem; margin-bottom:24px; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .form-row-3 { grid-template-columns:1fr 1fr 1fr; }
    .form-group { margin-bottom:18px; }
    .form-group label { display:block; font-weight:600; font-size:.85rem; color:var(--accent); margin-bottom:6px; }
    .form-group input, .form-group select, .form-group textarea { width:100%; padding:11px 14px; border:2px solid #e0e0e0; border-radius:10px; font-family:'Open Sans',sans-serif; font-size:.9rem; transition:border-color .2s; outline:none; background:#fafafa; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color:var(--gold); background:var(--white); }
    .form-group input.error, .form-group select.error { border-color:#e74c3c; }
    .form-group textarea { resize:vertical; min-height:72px; }
    .toggle-row { display:flex; gap:8px; margin-top:4px; }
    .toggle-btn { flex:1; padding:9px 14px; border:2px solid #e0e0e0; border-radius:10px; background:#fafafa; font-family:'Open Sans',sans-serif; font-size:.88rem; font-weight:600; cursor:pointer; transition:all .2s; color:#666; }
    .toggle-btn.active { border-color:var(--gold); background:linear-gradient(135deg,var(--gold),var(--gold-light)); color:var(--dark); }
    .extra-passengers-section { margin-bottom:18px; }
    .extra-passenger { display:grid; grid-template-columns:1fr 1fr; gap:10px; background:#f8f5f0; border-radius:12px; padding:14px; margin-bottom:10px; }
    .extra-passenger .form-group { margin:0; }
    .ep-header { grid-column:1/-1; font-family:'Montserrat',sans-serif; font-weight:700; font-size:.82rem; color:var(--accent); padding-bottom:8px; border-bottom:1.5px solid #e0d8cc; margin-bottom:2px; }
    .ep-full { grid-column:1/-1; }
    .remove-passenger-btn { padding:9px 12px; border:none; background:#fef2f2; color:#dc2626; border-radius:8px; cursor:pointer; font-size:.9rem; align-self:end; height:42px; }
    .remove-passenger-btn:hover { background:#fee2e2; }
    .add-passenger-btn { width:100%; padding:9px; border:2px dashed #d0c8b8; border-radius:10px; background:none; cursor:pointer; font-size:.82rem; color:#888; font-family:'Open Sans',sans-serif; transition:all .2s; margin-top:4px; }
    .add-passenger-btn:hover { border-color:var(--gold); color:var(--accent); }
    @media (max-width:640px) {
      .extra-passenger { grid-template-columns:1fr 1fr auto; gap:6px; padding:10px; }
    }
    .submit-btn { width:100%; padding:14px; background:linear-gradient(135deg,var(--gold),var(--gold-light)); color:var(--dark); border:none; border-radius:12px; font-family:'Montserrat',sans-serif; font-weight:700; font-size:1rem; cursor:pointer; transition:opacity .2s,transform .15s; margin-top:8px; }
    .submit-btn:hover { opacity:.9; transform:translateY(-1px); }
    .submit-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
    .form-msg { text-align:center; padding:12px; border-radius:10px; font-weight:600; font-size:.9rem; margin-top:14px; display:none; }
    .form-msg.success { background:#d4edda; color:#155724; display:block; }
    .form-msg.error { background:#f8d7da; color:#721c24; display:block; }

    /* FLOATING ORDER BUTTON */
    .order-fab {
      position:fixed; bottom:16px; left:50%;
      transform:translateX(-50%) translateY(20px);
      z-index:300;
      background:linear-gradient(135deg,var(--gold),var(--gold-light));
      color:var(--dark); border:none;
      padding:0 18px; height:44px; border-radius:30px;
      font-family:'Montserrat',sans-serif; font-weight:700; font-size:.88rem;
      cursor:pointer; white-space:nowrap;
      display:flex; align-items:center; gap:8px;
      box-shadow:0 6px 24px rgba(201,168,76,.55);
      opacity:0; pointer-events:none;
      transition:opacity .3s, transform .3s, box-shadow .2s;
    }
    .order-fab.visible {
      opacity:1; pointer-events:auto;
      transform:translateX(-50%) translateY(0);
    }
    .order-fab:hover { box-shadow:0 8px 32px rgba(201,168,76,.7); }
    .order-fab:active { transform:translateX(-50%) scale(.95); }

    footer { background:var(--dark); color:rgba(255,255,255,.7); text-align:center; padding:24px; font-size:.85rem; margin-top:60px; }
    footer strong { color:var(--gold); }

    @media (max-width:640px) {
      /* Hero */
      .exc-hero            { height: 220px; }
      .exc-hero-placeholder{ font-size: 4rem; }
      .exc-hero-text       { padding: 16px; }
      .exc-hero-text h1    { font-size: 1.25rem; line-height: 1.25; margin-bottom: 8px; }
      .exc-hero-text .tag  { font-size: .68rem; padding: 3px 10px; margin-bottom: 8px; }
      .exc-hero-text .meta { gap: 10px; }
      .exc-meta-item       { font-size: .78rem; }

      /* Content */
      .exc-content         { padding: 20px 16px; }
      .exc-desc-short      { font-size: .82rem; line-height: 1.5; margin-bottom: 18px; padding-bottom: 18px; }
      .exc-desc-full       { font-size: .8rem; line-height: 1.5; }

      /* Form block */
      .book-block          { padding: 18px 14px; border-radius: 14px; margin-top: 24px; }
      .book-title          { font-size: 1rem; margin-bottom: 4px; }
      .book-sub            { font-size: .8rem; margin-bottom: 18px; }
      .form-row            { grid-template-columns: 1fr; gap: 0; }
      .form-row-3          { grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
      .extra-passenger     { grid-template-columns: 1fr; gap: 8px; }
      .form-group          { margin-bottom: 12px; }
      .form-group label    { font-size: .78rem; margin-bottom: 4px; }
      .form-group input,
      .form-group select,
      .form-group textarea { padding: 9px 11px; font-size: .85rem; border-radius: 8px; }
      .submit-btn          { padding: 11px; font-size: .9rem; border-radius: 10px; }
      .form-msg            { font-size: .82rem; padding: 10px; }

      footer               { padding: 18px 16px; font-size: .8rem; }
    }
  </style>
</head>
<body>

<header role="banner">
  <div class="header-inner">
    <a class="logo" href="/" id="logoLink">
      <div class="logo-icon" id="logoIcon"><i class="fa fa-compass" aria-hidden="true"></i></div>
      <div>
        <div class="logo-name" id="logoName">KEDEM TOURS</div>
        <div class="logo-sub" id="logoSub">Экскурсии по Израилю</div>
      </div>
    </a>
    <a class="back-btn" href="/"><i class="fa fa-arrow-left" aria-hidden="true"></i> Все экскурсии</a>
  </div>
</header>
<script>
(function(){
  try {
    var s=JSON.parse(localStorage.getItem('siteSettings')||'null');
    if(!s) return;
    var li=document.getElementById('logoIcon');
    if(li&&s.logo_image) li.innerHTML='<img src="'+s.logo_image+'" alt="'+(s.logo_text||'Логотип')+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
    var ln=document.getElementById('logoName'); if(ln&&s.logo_text) ln.textContent=s.logo_text;
    var ls=document.getElementById('logoSub');  if(ls&&s.logo_sub)  ls.textContent=s.logo_sub;
  } catch(e){}
})();
</script>

<!-- HERO -->
<div class="exc-hero">
  <?php if ($image): ?>
    <img src="<?= $image ?>" alt="<?= $title ?>"/>
  <?php else: ?>
    <div class="exc-hero-placeholder"><?= $icon ?></div>
  <?php endif; ?>
  <div class="exc-hero-overlay"></div>
  <div class="exc-hero-text">
    <?php if ($tag): ?><span class="tag"><?= $tag ?></span><?php endif; ?>
    <h1><?= $title ?></h1>
    <div class="meta">
      <?php if ($duration): ?><span class="exc-meta-item"><i class="fa fa-clock"></i> <?= $duration ?></span><?php endif; ?>
      <span class="exc-meta-item"><i class="fa fa-map-marker-alt"></i> Израиль</span>
    </div>
  </div>
</div>

<!-- CONTENT -->
<div class="exc-content">
  <?php if ($desc): ?><div class="exc-desc-short"><?= $desc ?></div><?php endif; ?>
  <?php if ($descFull): ?><div class="exc-desc-full"><?= $descFull ?></div><?php endif; ?>

  <!-- BOOKING FORM -->
  <div class="book-block" id="bookBlock">
    <div class="book-title">Записаться на экскурсию</div>
    <div class="book-sub">Заполните форму — мы свяжемся с вами для подтверждения</div>
    <form id="bookingForm" novalidate>
      <div class="form-row">
        <div class="form-group"><label>Имя *</label><input type="text" id="firstName" placeholder="Иван"/></div>
        <div class="form-group"><label>Фамилия *</label><input type="text" id="lastName" placeholder="Иванов"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Телефон *</label><input type="tel" id="phone" placeholder="+972-50-000-0000"/></div>
        <div class="form-group"><label>Email</label><input type="email" id="email" placeholder="example@mail.com"/></div>
      </div>
      <div class="form-row form-row-3" id="countsGroup">
        <div class="form-group"><label>Взрослых *</label><input type="number" id="adultsCount" min="0" max="20" value="0"/></div>
        <div class="form-group"><label>Детей *</label><input type="number" id="childrenCount" min="0" max="20" value="0"/></div>
        <div class="form-group"><label>Пенсионеров *</label><input type="number" id="seniorsCount" min="0" max="20" value="0"/></div>
      </div>
      <div class="form-group" id="pickupGroup">
        <label>Место посадки *</label>
        <select id="pickup">
          <option value="">— выберите остановку —</option>
          <option>Каньён Авиа</option>
          <option>Каньён Шауль Ха-Мелех</option>
          <option>Гранд Каньёон</option>
          <option>Неве Зеев-Жаботински</option>
          <option>Бигудит Вицо</option>
          <option>Сорока</option>
          <option>Центр Орен</option>
        </select>
      </div>
      <div class="form-group">
        <label>Все пассажиры садятся на одной остановке?</label>
        <div class="toggle-row">
          <button type="button" class="toggle-btn active" id="sameStopYes" onclick="setSameStop(true)">Да</button>
          <button type="button" class="toggle-btn" id="sameStopNo" onclick="setSameStop(false)">Нет</button>
        </div>
      </div>
      <div class="extra-passengers-section" id="extraPassengersSection" style="display:none">
        <div id="extraPassengersList"></div>
      </div>

      <div class="form-group">
        <label>Особые потребности <span style="color:#aaa;font-weight:400">(необязательно)</span></label>
        <textarea id="specialNeeds" placeholder="Например: вегетарианское питание, передвижение на коляске, аллергия…"></textarea>
      </div>
      <button type="submit" class="submit-btn" id="submitBtn"><i class="fa fa-check-circle"></i>&nbsp; Записаться</button>
      <div class="form-msg" id="formMsg"></div>
    </form>
  </div>
</div>

<!-- FLOATING ORDER BUTTON -->
<button class="order-fab" id="orderFab" aria-label="Перейти к форме записи">
  <i class="fa fa-calendar-check" aria-hidden="true"></i> Заказать сейчас
</button>

<footer><p>&copy; 2024 <strong>KEDEM TOURS</strong>. Все права защищены.</p></footer>

<script src="/widgets.js"></script>
<script>
const EXCURSION_TITLE = <?= json_encode($exc['title']) ?>;
const form     = document.getElementById('bookingForm');
const submitBtn = document.getElementById('submitBtn');
const formMsg  = document.getElementById('formMsg');

const STOPS = ['Каньён Авиа','Каньён Шауль Ха-Мелех','Гранд Каньёон','Неве Зеев-Жаботински','Бигудит Вицо','Сорока','Центр Орен'];
let sameStop = true;
let passengerIdx = 0;

function getTotal() {
  return (parseInt(document.getElementById('adultsCount').value)   || 0)
       + (parseInt(document.getElementById('childrenCount').value) || 0)
       + (parseInt(document.getElementById('seniorsCount').value)  || 0);
}

function setSameStop(val) {
  sameStop = val;
  document.getElementById('sameStopYes').classList.toggle('active', val);
  document.getElementById('sameStopNo').classList.toggle('active', !val);
  document.getElementById('pickupGroup').style.display  = val ? '' : 'none';
  document.getElementById('countsGroup').style.display  = val ? '' : 'none';
  document.getElementById('extraPassengersSection').style.display = val ? 'none' : 'block';
  if (!val) {
    syncPassengerCount();
    if (document.getElementById('extraPassengersList').querySelectorAll('.extra-passenger').length === 0) {
      addPassenger();
    }
  } else {
    document.getElementById('extraPassengersList').innerHTML = '';
  }
}

function syncPassengerCount() {
  if (sameStop) return;
  const target = getTotal();
  const list = document.getElementById('extraPassengersList');
  const entries = list.querySelectorAll('.extra-passenger');
  if (entries.length < target) {
    for (let i = entries.length; i < target; i++) addPassenger();
  } else if (entries.length > target) {
    for (let i = entries.length - 1; i >= target; i--) entries[i].remove();
  }
  list.querySelectorAll('.extra-passenger').forEach((el, i) => {
    const lbl = el.querySelector('.p-num-label');
    if (lbl) lbl.textContent = `Пассажир ${i + 1}`;
  });
}

function addPassenger() {
  const id   = 'ep' + (++passengerIdx);
  const n    = document.getElementById('extraPassengersList').querySelectorAll('.extra-passenger').length + 1;
  const opts = STOPS.map(s => `<option>${s}</option>`).join('');
  const ages = [
    ['Взрослый',  'Взрослый (18–64 года)'],
    ['Ребёнок',   'Ребёнок (до 12 лет)'],
    ['Пенсионер', 'Пенсионер (65+)']
  ].map(([v,l]) => `<option value="${v}">${l}</option>`).join('');
  const div = document.createElement('div');
  div.className = 'extra-passenger';
  div.id = id;
  div.innerHTML =
    `<div class="ep-header p-num-label">Пассажир ${n}</div>` +
    `<div class="form-group"><label>Имя</label><input type="text" class="p-fname" placeholder="Иван"/></div>` +
    `<div class="form-group"><label>Фамилия</label><input type="text" class="p-lname" placeholder="Иванов"/></div>` +
    `<div class="form-group"><label>Телефон</label><input type="tel" class="p-phone" placeholder="+972-50-000-0000"/></div>` +
    `<div class="form-group"><label>Возрастная категория</label><select class="p-age"><option value="">— выберите —</option>${ages}</select></div>` +
    `<div class="form-group ep-full"><label>Место посадки</label><select class="p-pickup"><option value="">— выберите —</option>${opts}</select></div>`;
  document.getElementById('extraPassengersList').appendChild(div);
}

['adultsCount','childrenCount','seniorsCount'].forEach(function(id) {
  document.getElementById(id).addEventListener('input', syncPassengerCount);
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  /* обязательные поля всегда */
  let valid = true;
  ['firstName','lastName','phone'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('error');
    if (!el.value.trim()) { el.classList.add('error'); valid = false; }
  });
  if (!valid) { showMsg('Пожалуйста, заполните все обязательные поля', 'error'); return; }

  const adults   = parseInt(document.getElementById('adultsCount').value)   || 0;
  const children = parseInt(document.getElementById('childrenCount').value) || 0;
  const seniors  = parseInt(document.getElementById('seniorsCount').value)  || 0;
  if (sameStop && adults + children + seniors < 1) {
    showMsg('Укажите хотя бы одного участника', 'error'); return;
  }
  if (!sameStop && document.querySelectorAll('.extra-passenger').length < 1) {
    showMsg('Добавьте хотя бы одного пассажира', 'error'); return;
  }

  /* посадка: либо общая, либо по каждому пассажиру */
  if (sameStop) {
    const pe = document.getElementById('pickup');
    pe.classList.remove('error');
    if (!pe.value) { pe.classList.add('error'); showMsg('Выберите место посадки', 'error'); return; }
  } else {
    let pValid = true;
    document.querySelectorAll('.extra-passenger').forEach(p => {
      const fn = p.querySelector('.p-fname');
      const ln = p.querySelector('.p-lname');
      const ph = p.querySelector('.p-phone');
      const ag = p.querySelector('.p-age');
      const se = p.querySelector('.p-pickup');
      [fn, ln, ph, ag, se].forEach(el => el.classList.remove('error'));
      if (!fn.value.trim()) { fn.classList.add('error'); pValid = false; }
      if (!ln.value.trim()) { ln.classList.add('error'); pValid = false; }
      if (!ph.value.trim()) { ph.classList.add('error'); pValid = false; }
      if (!ag.value)        { ag.classList.add('error'); pValid = false; }
      if (!se.value)        { se.classList.add('error'); pValid = false; }
    });
    if (!pValid) { showMsg('Заполните все данные для каждого пассажира', 'error'); return; }
  }
  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';
  try {
    const res = await fetch('/order.php', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        excursion:    EXCURSION_TITLE,
        firstName:    document.getElementById('firstName').value.trim(),
        lastName:     document.getElementById('lastName').value.trim(),
        phone:        document.getElementById('phone').value.trim(),
        email:        document.getElementById('email').value.trim(),
        adultsCount:  adults,
        childrenCount: children,
        seniorsCount: seniors,
        seats:        sameStop ? adults + children + seniors : document.querySelectorAll('.extra-passenger').length,
        pickup:     sameStop ? document.getElementById('pickup').value : '',
        passengers: sameStop ? [] : Array.from(document.querySelectorAll('.extra-passenger')).map(p => ({
          firstName:   p.querySelector('.p-fname').value.trim(),
          lastName:    p.querySelector('.p-lname').value.trim(),
          phone:       p.querySelector('.p-phone').value.trim(),
          ageCategory: p.querySelector('.p-age').value,
          pickup:      p.querySelector('.p-pickup').value
        })),
        specialNeeds: document.getElementById('specialNeeds').value.trim()
      })
    });
    const data = await res.json();
    if (data.success) {
      showMsg('✅ Вы успешно записаны! Мы свяжемся с вами в ближайшее время.', 'success');
      form.reset();
      document.getElementById('extraPassengersList').innerHTML = '';
      setSameStop(true);
    } else {
      showMsg(data.error || 'Ошибка. Попробуйте ещё раз.', 'error');
    }
  } catch { showMsg('Ошибка соединения. Попробуйте позже.', 'error'); }
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fa fa-check-circle"></i>&nbsp; Записаться';
});

function showMsg(text, type) { formMsg.textContent = text; formMsg.className = 'form-msg ' + type; }

// Floating order button
(function() {
  var fab = document.getElementById('orderFab');
  var hero = document.querySelector('.exc-hero');
  var book = document.getElementById('bookBlock');
  function update() {
    var heroGone = hero.getBoundingClientRect().bottom < 0;
    var formVisible = book.getBoundingClientRect().top < window.innerHeight;
    fab.classList.toggle('visible', heroGone && !formVisible);
  }
  window.addEventListener('scroll', update, { passive: true });
  fab.addEventListener('click', function() {
    book.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  update();
})();
</script>
</body>
</html>
