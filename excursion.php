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
    .exc-desc-short { font-size:1.1rem; color:#444; line-height:1.7; margin-bottom:28px; padding-bottom:28px; border-bottom:2px solid #e8e0d0; font-weight:600; }
    .exc-desc-full { font-size:1rem; color:#555; line-height:1.85; white-space:pre-line; }
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
    .form-group { margin-bottom:18px; }
    .form-group label { display:block; font-weight:600; font-size:.85rem; color:var(--accent); margin-bottom:6px; }
    .form-group input, .form-group select { width:100%; padding:11px 14px; border:2px solid #e0e0e0; border-radius:10px; font-family:'Open Sans',sans-serif; font-size:.9rem; transition:border-color .2s; outline:none; background:#fafafa; }
    .form-group input:focus, .form-group select:focus { border-color:var(--gold); background:var(--white); }
    .form-group input.error, .form-group select.error { border-color:#e74c3c; }
    .submit-btn { width:100%; padding:14px; background:linear-gradient(135deg,var(--gold),var(--gold-light)); color:var(--dark); border:none; border-radius:12px; font-family:'Montserrat',sans-serif; font-weight:700; font-size:1rem; cursor:pointer; transition:opacity .2s,transform .15s; margin-top:8px; }
    .submit-btn:hover { opacity:.9; transform:translateY(-1px); }
    .submit-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
    .form-msg { text-align:center; padding:12px; border-radius:10px; font-weight:600; font-size:.9rem; margin-top:14px; display:none; }
    .form-msg.success { background:#d4edda; color:#155724; display:block; }
    .form-msg.error { background:#f8d7da; color:#721c24; display:block; }

    footer { background:var(--dark); color:rgba(255,255,255,.7); text-align:center; padding:24px; font-size:.85rem; margin-top:60px; }
    footer strong { color:var(--gold); }

    @media (max-width:560px) {
      .form-row { grid-template-columns:1fr; }
      .exc-hero { height:280px; }
      .exc-hero-placeholder { font-size:5rem; }
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
  <div class="book-block">
    <div class="book-title">Записаться на экскурсию</div>
    <div class="book-sub">Заполните форму — мы свяжемся с вами для подтверждения</div>
    <form id="bookingForm" novalidate>
      <div class="form-row">
        <div class="form-group"><label>Имя *</label><input type="text" id="firstName" placeholder="Иван"/></div>
        <div class="form-group"><label>Фамилия *</label><input type="text" id="lastName" placeholder="Иванов"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Телефон *</label><input type="tel" id="phone" placeholder="+972-50-000-0000"/></div>
        <div class="form-group"><label>Количество мест *</label><input type="number" id="seats" min="1" max="20" placeholder="1"/></div>
      </div>
      <div class="form-group">
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
      <button type="submit" class="submit-btn" id="submitBtn"><i class="fa fa-check-circle"></i>&nbsp; Записаться</button>
      <div class="form-msg" id="formMsg"></div>
    </form>
  </div>
</div>

<footer><p>&copy; 2024 <strong>KEDEM TOURS</strong>. Все права защищены.</p></footer>

<script src="/widgets.js"></script>
<script>
const EXCURSION_TITLE = <?= json_encode($exc['title']) ?>;
const form     = document.getElementById('bookingForm');
const submitBtn = document.getElementById('submitBtn');
const formMsg  = document.getElementById('formMsg');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const fields = ['firstName','lastName','phone','seats','pickup'];
  let valid = true;
  fields.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('error');
    if (!el.value.trim()) { el.classList.add('error'); valid = false; }
  });
  if (!valid) { showMsg('Пожалуйста, заполните все обязательные поля', 'error'); return; }
  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';
  try {
    const res = await fetch('/order.php', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        excursion: EXCURSION_TITLE,
        firstName: document.getElementById('firstName').value.trim(),
        lastName:  document.getElementById('lastName').value.trim(),
        phone:     document.getElementById('phone').value.trim(),
        seats:     document.getElementById('seats').value,
        pickup:    document.getElementById('pickup').value
      })
    });
    const data = await res.json();
    if (data.success) {
      showMsg('✅ Вы успешно записаны! Мы свяжемся с вами в ближайшее время.', 'success');
      form.reset();
    } else {
      showMsg(data.error || 'Ошибка. Попробуйте ещё раз.', 'error');
    }
  } catch { showMsg('Ошибка соединения. Попробуйте позже.', 'error'); }
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fa fa-check-circle"></i>&nbsp; Записаться';
});

function showMsg(text, type) { formMsg.textContent = text; formMsg.className = 'form-msg ' + type; }
</script>
</body>
</html>
