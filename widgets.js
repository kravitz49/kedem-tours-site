/* widgets.js — FAB + Accessibility widget, all pages */
(function () {
  'use strict';
  if (window._widgetsLoaded) return;
  window._widgetsLoaded = true;

  /* ── CSS ─────────────────────────────────────────────────────── */
  var css = `
  :focus-visible { outline: 3px solid #c9a84c; outline-offset: 3px; border-radius: 4px; }

  /* FAB overlay */
  .fab-overlay { display:none; position:fixed; inset:0; z-index:299; background:rgba(0,0,0,.35); }
  .fab-overlay.open { display:block; }

  /* FAB wrap — top-right, below header */
  .fab-wrap {
    display:flex; position:fixed; top:82px; right:16px; z-index:400;
    flex-direction:column; align-items:flex-end; gap:10px;
    pointer-events:none;
  }
  .fab-menu {
    display:flex; flex-direction:column; align-items:flex-end; gap:8px;
    transition:opacity .25s,transform .25s;
    opacity:0; transform:translateY(-10px) scale(.95);
    pointer-events:none; order:2;
  }
  .fab-menu.open { opacity:1; transform:none; pointer-events:all; }
  .fab-item {
    display:flex; align-items:center; gap:10px;
    text-decoration:none; background:#fff;
    border-radius:30px; padding:9px 16px 9px 12px;
    box-shadow:0 4px 16px rgba(0,0,0,.18);
    font-size:.85rem; font-weight:600; color:#1a1a2e;
    transition:transform .15s; white-space:nowrap;
  }
  .fab-item:active { transform:scale(.97); }
  .fab-item i { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.95rem; color:#fff; flex-shrink:0; }
  .fab-item .fi-phone { background:#0f3460; }
  .fab-item .fi-wa    { background:#25d366; }
  .fab-item .fi-email { background:#c9a84c; }
  .fab-item .fi-fb    { background:#1877f2; }
  .fab-item .fi-ig    { background:radial-gradient(circle at 30% 110%,#f09433,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888); }
  .fab-item .fi-tg    { background:#229ed9; }
  .fab-item .fi-yt    { background:#ff0000; }
  .fab-item .fi-tt    { background:#010101; }
  .fab-btn {
    height:44px; border-radius:30px; padding:0 18px 0 14px;
    background:linear-gradient(135deg,#c9a84c,#e8c96a);
    border:none; color:#1a1a2e; font-size:.88rem;
    font-family:'Montserrat',sans-serif; font-weight:700;
    box-shadow:0 4px 18px rgba(201,168,76,.55);
    cursor:pointer; display:flex; align-items:center; gap:8px;
    transition:transform .2s; white-space:nowrap; order:1;
    pointer-events:auto;
  }
  .fab-btn:active { transform:scale(.93); }
  .fab-btn .fab-icon-close { display:none; }
  .fab-btn.open .fab-icon-open  { display:none; }
  .fab-btn.open .fab-icon-close { display:block; }

  /* A11y toggle button */
  #a11yToggleBtn {
    position:fixed; top:82px; left:0; z-index:800;
    background:#0f3460; color:#fff; border:none;
    border-radius:0 10px 10px 0; padding:14px 10px;
    cursor:pointer; display:flex; flex-direction:column;
    align-items:center; gap:5px;
    box-shadow:3px 3px 14px rgba(0,0,0,.35);
    transition:background .2s;
  }
  #a11yToggleBtn:hover { background:#163d74; }
  #a11yToggleBtn .a11y-ico { font-size:1.3rem; }
  #a11yToggleBtn .a11y-lbl {
    writing-mode:vertical-rl; transform:rotate(180deg);
    font-family:'Montserrat',sans-serif; font-size:.58rem;
    font-weight:700; letter-spacing:1px; text-transform:uppercase; opacity:.85;
  }

  /* A11y overlay */
  #a11yOverlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:799; }
  #a11yOverlay.open { display:block; }

  /* A11y panel */
  #a11yPanel {
    position:fixed; top:0; left:0;
    width:310px; max-width:96vw; height:100vh;
    background:#eef0f8; z-index:800;
    display:flex; flex-direction:column;
    box-shadow:5px 0 40px rgba(0,0,0,.28);
    transform:translateX(-100%); transition:transform .3s ease;
    overflow:hidden;
  }
  #a11yPanel.open { transform:translateX(0); }
  .a11y-hdr { background:#1a1a2e; color:#fff; padding:0 14px; min-height:54px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .a11y-hdr-title { font-family:'Montserrat',sans-serif; font-weight:800; font-size:1rem; letter-spacing:.5px; }
  .a11y-hdr-close { background:rgba(255,255,255,.15); border:none; color:#fff; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; }
  .a11y-hdr-close:hover { background:rgba(255,255,255,.3); }
  .a11y-body { flex:1; overflow-y:auto; padding:10px; }
  .a11y-body::-webkit-scrollbar { width:4px; }
  .a11y-body::-webkit-scrollbar-thumb { background:#bbb; border-radius:2px; }
  .a11y-reset-all { width:100%; background:none; border:1.5px solid #d0d4e8; border-radius:8px; padding:8px; font-size:.78rem; color:#595959; cursor:pointer; margin-bottom:10px; font-family:'Open Sans',sans-serif; display:flex; align-items:center; justify-content:center; gap:6px; }
  .a11y-reset-all:hover { background:#e4e7f5; }
  .a11y-sec { background:#fff; border-radius:10px; margin-bottom:8px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.07); }
  .a11y-sec-hdr { width:100%; background:none; border:none; padding:11px 14px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-family:'Montserrat',sans-serif; font-weight:700; font-size:.8rem; color:#1a1a2e; text-align:left; }
  .a11y-sec-hdr:hover { background:#f4f6fb; }
  .a11y-sec-plus { width:24px; height:24px; background:#0f3460; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.78rem; flex-shrink:0; transition:transform .2s; }
  .a11y-sec-hdr[aria-expanded="true"] .a11y-sec-plus { transform:rotate(45deg); }
  .a11y-sec-body { padding:4px 10px 12px; }
  .a11y-sec-body[hidden] { display:none; }
  .a11y-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
  .a11y-feat { background:#f4f6fb; border:1.5px solid #dde1f0; border-radius:10px; padding:11px 4px 9px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:6px; transition:border-color .15s,background .15s; font-family:'Open Sans',sans-serif; }
  .a11y-feat:hover { border-color:#0f3460; background:#eaedfa; }
  .a11y-feat.active { background:#0f3460; border-color:#0f3460; }
  .a11y-feat-ico { font-size:1.4rem; color:#0f3460; line-height:1; }
  .a11y-feat.active .a11y-feat-ico { color:#fff; }
  .a11y-feat-lbl { font-size:.63rem; font-weight:600; text-align:center; color:#1a1a2e; line-height:1.25; }
  .a11y-feat.active .a11y-feat-lbl { color:#fff; }
  .a11y-slider-g { margin-bottom:13px; }
  .a11y-slider-row { display:flex; justify-content:space-between; align-items:center; font-size:.76rem; font-weight:600; color:#1a1a2e; margin-bottom:4px; }
  .a11y-slider-row span { color:#0f3460; font-weight:700; font-size:.78rem; }
  input[type=range].a11y-range { width:100%; accent-color:#0f3460; cursor:pointer; }
  .a11y-step-btns { display:flex; gap:5px; margin-top:5px; }
  .a11y-step-btns button { flex:1; padding:5px 4px; border:1.5px solid #d0d4e8; border-radius:7px; background:none; cursor:pointer; font-family:'Montserrat',sans-serif; font-weight:700; font-size:.72rem; color:#0f3460; }
  .a11y-step-btns button:hover { background:#eaedfa; }
  .a11y-clr-row { display:flex; align-items:center; gap:8px; margin-bottom:9px; font-size:.78rem; }
  .a11y-clr-row label { flex:1; font-weight:600; color:#1a1a2e; }
  .a11y-clr-row input[type=color] { width:38px; height:28px; border:1px solid #ccc; border-radius:6px; cursor:pointer; padding:2px; }
  .a11y-sec-reset { width:100%; background:none; border:1.5px solid #dde1f0; border-radius:7px; padding:7px; font-size:.73rem; color:#595959; cursor:pointer; margin-top:8px; font-family:'Open Sans',sans-serif; display:flex; align-items:center; justify-content:center; gap:5px; }
  .a11y-sec-reset:hover { background:#f0f2fb; }

  /* Body effect classes */
  body.a11y-hc-light  { filter:contrast(1.5) brightness(1.05); }
  body.a11y-hc-dark   { filter:invert(1) hue-rotate(180deg); }
  body.a11y-hc-dark img,body.a11y-hc-dark video { filter:invert(1) hue-rotate(180deg); }
  body.a11y-mono      { filter:grayscale(1); }
  body.a11y-invert    { filter:invert(1); }
  body.a11y-high-sat  { filter:saturate(2.2); }
  body.a11y-low-sat   { filter:saturate(.4) brightness(1.1); }
  body.a11y-no-motion *,body.a11y-no-motion *::before,body.a11y-no-motion *::after { animation-duration:.01ms !important; transition-duration:.01ms !important; }
  body.a11y-kbd *:focus { outline:4px solid #e65c00 !important; outline-offset:3px !important; border-radius:3px !important; }
  body.a11y-links a { text-decoration:underline !important; font-weight:700 !important; }
  body.a11y-titles h1,body.a11y-titles h2,body.a11y-titles h3,body.a11y-titles h4 { background:#fffde0 !important; color:#000 !important; }
  body.a11y-dyslexia { font-family:'Open Sans',Arial,sans-serif !important; letter-spacing:.05em; word-spacing:.12em; line-height:1.9; }
  body.a11y-cursor * { cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Cpath d='M8 2l20 14-9 2 5 10-4 2-5-10-7 6z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 8 2,auto !important; }

  @media (prefers-reduced-motion:reduce) {
    .fab-menu,.fab-btn,#a11yPanel { transition:none !important; }
  }
  @media (max-width:640px) {
    .fab-wrap { top:auto; bottom:16px; right:12px; }
    .fab-menu { order:1; }
    .fab-btn  { order:2; width:48px; height:48px; border-radius:50%; padding:0; justify-content:center; }
    .fab-btn .fab-icon-open + span { display:none; }
    #a11yToggleBtn { top:62px; padding:10px 8px; }
    #a11yToggleBtn .a11y-lbl { display:none; }
    #a11yPanel { width:100vw; max-width:100vw; }
    body { padding-bottom:72px; }
  }
  `;

  if (!document.getElementById('_widgetCss')) {
    var st = document.createElement('style');
    st.id = '_widgetCss';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ── HTML injection ──────────────────────────────────────────── */
  function injectWidgets() {
    /* FAB */
    if (!document.getElementById('fabWrap')) {
      var fabHtml = '<div class="fab-overlay" id="fabOverlay"></div>' +
        '<div class="fab-wrap" id="fabWrap">' +
          '<div class="fab-menu" id="fabMenu"></div>' +
          '<button class="fab-btn" id="fabBtn"' +
            ' aria-expanded="false" aria-controls="fabMenu"' +
            ' aria-label="Свяжитесь с нами">' +
            '<i class="fa fa-phone fab-icon-open" aria-hidden="true"></i>' +
            '<span class="fab-icon-open">Свяжитесь с нами</span>' +
            '<i class="fa fa-times fab-icon-close" aria-hidden="true"></i>' +
          '</button>' +
        '</div>';
      document.body.insertAdjacentHTML('beforeend', fabHtml);
      document.getElementById('fabOverlay').onclick = fabClose;
      document.getElementById('fabBtn').onclick = fabToggle;
    }

    /* A11y panel */
    if (!document.getElementById('a11yPanel')) {
      document.body.insertAdjacentHTML('beforeend', buildA11yHtml());
    }
  }

  function buildA11yHtml() {
    return '<div id="a11yOverlay"></div>' +
    '<button id="a11yToggleBtn" aria-expanded="false" aria-controls="a11yPanel" aria-label="Параметры доступности">' +
      '<span class="a11y-ico">♿</span><span class="a11y-lbl">Доступность</span>' +
    '</button>' +
    '<div id="a11yPanel" role="dialog" aria-modal="true" aria-label="Настройки доступности" aria-hidden="true">' +
      '<div class="a11y-hdr">' +
        '<span class="a11y-hdr-title">♿ Доступность</span>' +
        '<button class="a11y-hdr-close" aria-label="Закрыть"><i class="fa fa-times" aria-hidden="true"></i></button>' +
      '</div>' +
      '<div class="a11y-body">' +
        '<button class="a11y-reset-all"><i class="fa fa-rotate-left" aria-hidden="true"></i> Сбросить все настройки</button>' +
        a11ySection('Профили доступности', false,
          a11yGrid([
            ['profile-motor','fa fa-hand','Нарушение моторики','profile','motor'],
            ['profile-blind','fa fa-eye-slash','Слабое зрение','profile','blind'],
            ['profile-dyslexia','fa fa-book-open','Дислексия','profile','dyslexia'],
            ['profile-cognitive','fa fa-brain','Когнитивные нарушения','profile','cognitive'],
            ['profile-senior','fa fa-person-cane','Пожилой пользователь','profile','senior'],
            ['profile-adhd','fa fa-bolt','СДВГ','profile','adhd'],
          ])
        ) +
        a11ySection('Навигация', true,
          a11yGrid([
            ['kbd','fa fa-keyboard','Навигация с клавиатуры','feat','kbd'],
            ['zones','fa fa-table-cells','Навигация по зонам','feat','zones'],
            ['speak','fa fa-volume-high','Озвучивание текста','feat','speak'],
            ['no-motion','fa fa-pause','Стоп анимация','feat','no-motion'],
            ['cursor','fa fa-arrow-pointer','Крупный курсор','feat','cursor'],
            ['screen-reader','fa fa-ear-listen','Для чтения с экрана','feat','screen-reader'],
          ])
        ) +
        a11ySection('Контрастность', true,
          a11yGrid([
            ['hc-light','fa fa-sun','Светлый контраст','contrast','hc-light'],
            ['hc-dark','fa fa-moon','Тёмный режим','contrast','hc-dark'],
            ['mono','fa fa-circle-half-stroke','Монохром','contrast','mono'],
            ['invert','fa fa-adjust','Инверсия','contrast','invert'],
            ['high-sat','fa fa-droplet','Насыщенность+','contrast','high-sat'],
            ['low-sat','fa fa-droplet-slash','Насыщенность−','contrast','low-sat'],
          ]) +
          '<button class="a11y-sec-reset"><i class="fa fa-rotate-left" aria-hidden="true"></i> Сбросить контраст</button>'
        ) +
        a11ySection('Настройка цветов', false,
          '<div class="a11y-clr-row"><label for="a11yBgClr">Фон страницы</label><input type="color" id="a11yBgClr" value="#f8f5f0"></div>' +
          '<div class="a11y-clr-row"><label for="a11yTxtClr">Цвет текста</label><input type="color" id="a11yTxtClr" value="#2d2d2d"></div>' +
          '<div class="a11y-clr-row"><label for="a11yLnkClr">Цвет ссылок</label><input type="color" id="a11yLnkClr" value="#0f3460"></div>' +
          '<button class="a11y-sec-reset"><i class="fa fa-rotate-left" aria-hidden="true"></i> Сбросить цвета</button>'
        ) +
        a11ySection('Текст и контент', true,
          '<div class="a11y-slider-g"><div class="a11y-slider-row">Размер шрифта <span id="sFont">100%</span></div>' +
          '<input type="range" class="a11y-range" id="rFont" min="0" max="6" value="2">' +
          '<div class="a11y-step-btns"><button id="sFontDec">A−</button><button id="sFontReset">A</button><button id="sFontInc">A+</button></div></div>' +
          '<div class="a11y-slider-g"><div class="a11y-slider-row">Межстрочный интервал <span id="sLine">норма</span></div><input type="range" class="a11y-range" id="rLine" min="0" max="4" value="0"></div>' +
          '<div class="a11y-slider-g"><div class="a11y-slider-row">Расстояние между словами <span id="sWord">норма</span></div><input type="range" class="a11y-range" id="rWord" min="0" max="4" value="0"></div>' +
          '<div class="a11y-slider-g"><div class="a11y-slider-row">Межбуквенный интервал <span id="sLetter">норма</span></div><input type="range" class="a11y-range" id="rLetter" min="0" max="4" value="0"></div>' +
          a11yGrid([
            ['links','fa fa-link','Выделить ссылки','feat','links'],
            ['titles','fa fa-heading','Выделить заголовки','feat','titles'],
            ['dyslexia','fa fa-font','Шрифт для дислексии','feat','dyslexia'],
          ]) +
          '<button class="a11y-sec-reset"><i class="fa fa-rotate-left" aria-hidden="true"></i> Сбросить текст</button>'
        ) +
        '<a href="/accessibility.html" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:#fff;border-radius:10px;text-decoration:none;color:#0f3460;font-size:.8rem;font-weight:700;border:1.5px solid #dde1f0;margin-top:4px">' +
          '<i class="fa fa-file-lines" aria-hidden="true"></i> Декларация доступности' +
        '</a>' +
      '</div>' +
    '</div>';
  }

  function a11ySection(title, open, content) {
    var exp = open ? 'true' : 'false';
    var rot = open ? 'style="transform:rotate(45deg)"' : '';
    var hid = open ? '' : ' hidden';
    return '<div class="a11y-sec">' +
      '<button class="a11y-sec-hdr" aria-expanded="' + exp + '">' + title +
        '<span class="a11y-sec-plus" ' + rot + '><i class="fa fa-plus" aria-hidden="true"></i></span>' +
      '</button>' +
      '<div class="a11y-sec-body"' + hid + '>' + content + '</div>' +
    '</div>';
  }

  function a11yGrid(items) {
    return '<div class="a11y-grid">' + items.map(function(it) {
      var feat = it[0], icon = it[1], label = it[2], type = it[3], val = it[4];
      return '<button class="a11y-feat" data-feat="' + feat + '" data-type="' + type + '" data-val="' + val + '" aria-pressed="false">' +
        '<span class="a11y-feat-ico"><i class="' + icon + '" aria-hidden="true"></i></span>' +
        '<span class="a11y-feat-lbl">' + label + '</span>' +
      '</button>';
    }).join('') + '</div>';
  }

  /* ── FAB JS ──────────────────────────────────────────────────── */
  function fabToggle() {
    var btn = document.getElementById('fabBtn');
    var menu = document.getElementById('fabMenu');
    var ov = document.getElementById('fabOverlay');
    var open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    ov.classList.toggle('open', open);
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
  }
  function fabClose() {
    var btn = document.getElementById('fabBtn');
    var menu = document.getElementById('fabMenu');
    var ov = document.getElementById('fabOverlay');
    if (menu) menu.classList.remove('open');
    if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    if (ov) ov.classList.remove('open');
  }
  window.toggleFab = fabToggle;
  window.closeFab = fabClose;

  /* ── FAB settings ────────────────────────────────────────────── */
  function buildFab(s) {
    var fabMenu = document.getElementById('fabMenu');
    if (!fabMenu) return;
    var phone = s.phone || '';
    var wa = s.whatsapp ? s.whatsapp.replace(/\D/g,'') : '';
    var email = s.email || '';
    var socials = [
      {key:'facebook', icon:'fab fa-facebook-f', cls:'fi-fb', label:'Facebook', base:'https://facebook.com/'},
      {key:'instagram', icon:'fab fa-instagram', cls:'fi-ig', label:'Instagram', base:'https://instagram.com/'},
      {key:'telegram', icon:'fab fa-telegram-plane', cls:'fi-tg', label:'Telegram', base:'https://t.me/'},
      {key:'youtube', icon:'fab fa-youtube', cls:'fi-yt', label:'YouTube', base:'https://youtube.com/'},
      {key:'tiktok', icon:'fab fa-tiktok', cls:'fi-tt', label:'TikTok', base:'https://tiktok.com/@'},
    ];
    var html = '';
    if (phone) html += '<a class="fab-item" href="tel:' + phone.replace(/[\s\-]/g,'') + '"><i class="fi-phone fa fa-phone"></i><span>' + phone + '</span></a>';
    if (wa)    html += '<a class="fab-item" href="https://wa.me/' + wa + '" target="_blank" rel="noopener"><i class="fi-wa fab fa-whatsapp"></i><span>WhatsApp</span></a>';
    if (email) html += '<a class="fab-item" href="mailto:' + email + '"><i class="fi-email fa fa-envelope"></i><span>' + email + '</span></a>';
    socials.forEach(function(soc) {
      var val = s[soc.key]; if (!val) return;
      var href = val.startsWith('http') ? val : soc.base + val;
      html += '<a class="fab-item" href="' + href + '" target="_blank" rel="noopener"><i class="' + soc.cls + ' ' + soc.icon + '"></i><span>' + soc.label + '</span></a>';
    });
    fabMenu.innerHTML = html;
  }
  window._widgetBuildFab = buildFab;

  /* Apply logo/header settings to any page with standard logo IDs */
  function applyHeaderSettings(s) {
    var logoIcon = document.getElementById('logoIcon');
    var logoName = document.getElementById('logoName');
    var logoSub  = document.getElementById('logoSub');
    var footerName = document.getElementById('footerName');
    if (logoIcon && s.logo_image) {
      logoIcon.innerHTML = '<img src="' + s.logo_image + '" alt="' + (s.logo_text || 'Логотип') + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
    }
    if (logoName && s.logo_text) logoName.textContent = s.logo_text;
    if (logoSub  && s.logo_sub)  logoSub.textContent  = s.logo_sub;
    if (footerName && s.logo_text) footerName.textContent = s.logo_text;
  }

  function loadFabSettings() {
    try { var c = localStorage.getItem('siteSettings'); if (c) { buildFab(JSON.parse(c)); applyHeaderSettings(JSON.parse(c)); } } catch(e) {}
    fetch('/settings.php').then(function(r){ return r.json(); }).then(function(s){
      buildFab(s);
      applyHeaderSettings(s);
      try { localStorage.setItem('siteSettings', JSON.stringify(s)); } catch(e) {}
    }).catch(function(){});
  }

  /* ── A11Y JS ─────────────────────────────────────────────────── */
  var _A = { contrast:null,fontIdx:2,line:0,word:0,letter:0,feats:{},bgClr:null,txtClr:null,lnkClr:null };
  var _fontSteps  = [80,90,100,110,120,140,160];
  var _lineAdds   = [0,.3,.6,.9,1.2];
  var _wordAdds   = [0,4,8,12,16];
  var _letterAdds = [0,1,2,3,4];
  var _contrastCls= ['a11y-hc-light','a11y-hc-dark','a11y-mono','a11y-invert','a11y-high-sat','a11y-low-sat'];

  function a11yToggle() {
    var p = document.getElementById('a11yPanel');
    if (p.classList.contains('open')) a11yClose(); else a11yOpen();
  }
  function a11yOpen() {
    var p = document.getElementById('a11yPanel');
    p.classList.add('open'); p.removeAttribute('aria-hidden');
    document.getElementById('a11yToggleBtn').setAttribute('aria-expanded','true');
    document.getElementById('a11yOverlay').classList.add('open');
    p.querySelector('button').focus();
  }
  function a11yClose() {
    var p = document.getElementById('a11yPanel');
    if (!p) return;
    p.classList.remove('open'); p.setAttribute('aria-hidden','true');
    document.getElementById('a11yToggleBtn').setAttribute('aria-expanded','false');
    document.getElementById('a11yOverlay').classList.remove('open');
    document.getElementById('a11yToggleBtn').focus();
  }
  window.a11yToggle = a11yToggle;
  window.a11yClose  = a11yClose;
  window.a11yOpen   = a11yOpen;

  function a11yToggleSec(hdr) {
    var body = hdr.nextElementSibling;
    var plus = hdr.querySelector('.a11y-sec-plus');
    var open = hdr.getAttribute('aria-expanded') === 'true';
    hdr.setAttribute('aria-expanded', open ? 'false' : 'true');
    body.hidden = open;
    plus.style.transform = open ? '' : 'rotate(45deg)';
  }

  function _applyFeat(feat, on) {
    var map = { kbd:'a11y-kbd','no-motion':'a11y-no-motion',links:'a11y-links',titles:'a11y-titles',dyslexia:'a11y-dyslexia',cursor:'a11y-cursor',speak:'a11y-speak',zones:'a11y-zones','screen-reader':'a11y-sr' };
    var cls = map[feat]; if (cls) document.body.classList.toggle(cls, on);
    if (feat === 'speak') {
      if (on) document.addEventListener('click', _speakClick);
      else { document.removeEventListener('click', _speakClick); window.speechSynthesis && speechSynthesis.cancel(); }
    }
  }
  function _speakClick(e) {
    var txt = (e.target.textContent || e.target.alt || e.target.getAttribute('aria-label') || '').trim().slice(0,300);
    if (!txt || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(txt); u.lang = 'ru-RU'; speechSynthesis.speak(u);
  }

  function _clearContrast() {
    _contrastCls.forEach(function(c){ document.body.classList.remove(c); });
    document.querySelectorAll('[data-type="contrast"]').forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
    _A.contrast = null;
  }

  function _applyColorStyle() {
    var s = document.getElementById('a11yCss') || (function(){ var x=document.createElement('style'); x.id='a11yCss'; document.head.appendChild(x); return x; })();
    var c = '';
    if (_A.bgClr) c += 'body{background:' + _A.bgClr + ' !important}';
    if (_A.txtClr) c += 'body,p,li,div,span{color:' + _A.txtClr + ' !important}';
    if (_A.lnkClr) c += 'a{color:' + _A.lnkClr + ' !important}';
    s.textContent = c;
  }

  function _applyTextStyle() {
    var s = document.getElementById('a11yTxtCss') || (function(){ var x=document.createElement('style'); x.id='a11yTxtCss'; document.head.appendChild(x); return x; })();
    var c = '';
    if (_A.line)   c += 'body,p,li,div{line-height:calc(1.6em + ' + _lineAdds[_A.line] + 'em) !important}';
    if (_A.word)   c += 'body,p,li,span{word-spacing:' + _wordAdds[_A.word] + 'px !important}';
    if (_A.letter) c += 'body,p,li,h1,h2,h3,span{letter-spacing:' + _letterAdds[_A.letter] + 'px !important}';
    s.textContent = c;
  }

  function a11ySave() {
    try { localStorage.setItem('a11yData', JSON.stringify({ contrast:_A.contrast,fontIdx:_A.fontIdx,line:_A.line,word:_A.word,letter:_A.letter,feats:_A.feats,bgClr:_A.bgClr,txtClr:_A.txtClr,lnkClr:_A.lnkClr })); } catch(e){}
  }
  window.a11ySave = a11ySave;

  function a11yRestore() {
    try {
      var d = JSON.parse(localStorage.getItem('a11yData') || 'null'); if (!d) return;
      Object.keys(d.feats||{}).forEach(function(f){ if(d.feats[f]){ var b=document.querySelector('[data-feat="'+f+'"]'); if(b){b.classList.add('active');b.setAttribute('aria-pressed','true');} _A.feats[f]=true; _applyFeat(f,true); } });
      if (d.contrast) { var cb=document.querySelector('[data-val="'+d.contrast+'"][data-type="contrast"]'); if(cb){cb.classList.add('active');cb.setAttribute('aria-pressed','true');} var clsMap={'hc-light':'a11y-hc-light','hc-dark':'a11y-hc-dark','mono':'a11y-mono','invert':'a11y-invert','high-sat':'a11y-high-sat','low-sat':'a11y-low-sat'}; document.body.classList.add(clsMap[d.contrast]||''); _A.contrast=d.contrast; }
      if (d.fontIdx !== undefined && d.fontIdx !== 2) { _A.fontIdx=d.fontIdx; document.documentElement.style.fontSize=_fontSteps[d.fontIdx]+'%'; var rF=document.getElementById('rFont'); if(rF) rF.value=d.fontIdx; var sF=document.getElementById('sFont'); if(sF) sF.textContent=_fontSteps[d.fontIdx]+'%'; }
      if (d.line){ _A.line=d.line; var rL=document.getElementById('rLine'); if(rL) rL.value=d.line; var sL=document.getElementById('sLine'); if(sL) sL.textContent='+'+d.line; }
      if (d.word){ _A.word=d.word; var rW=document.getElementById('rWord'); if(rW) rW.value=d.word; var sW=document.getElementById('sWord'); if(sW) sW.textContent='+'+d.word; }
      if (d.letter){ _A.letter=d.letter; var rLt=document.getElementById('rLetter'); if(rLt) rLt.value=d.letter; var sLt=document.getElementById('sLetter'); if(sLt) sLt.textContent='+'+d.letter; }
      if (d.line||d.word||d.letter) _applyTextStyle();
      if (d.bgClr){ _A.bgClr=d.bgClr; var bc=document.getElementById('a11yBgClr'); if(bc) bc.value=d.bgClr; }
      if (d.txtClr){ _A.txtClr=d.txtClr; var tc=document.getElementById('a11yTxtClr'); if(tc) tc.value=d.txtClr; }
      if (d.lnkClr){ _A.lnkClr=d.lnkClr; var lc=document.getElementById('a11yLnkClr'); if(lc) lc.value=d.lnkClr; }
      if (d.bgClr||d.txtClr||d.lnkClr) _applyColorStyle();
    } catch(e){}
  }

  var _profiles = {
    motor:    {feats:['kbd','cursor']},
    blind:    {feats:['screen-reader','kbd','speak'],fontIdx:4},
    dyslexia: {feats:['dyslexia','links'],fontIdx:3,line:2,word:1},
    cognitive:{feats:['links','titles','no-motion'],fontIdx:3},
    senior:   {feats:['links'],fontIdx:4,line:1},
    adhd:     {feats:['no-motion','links']}
  };

  function a11yResetAll(silent) {
    _clearContrast();
    ['a11y-kbd','a11y-no-motion','a11y-links','a11y-titles','a11y-dyslexia','a11y-cursor','a11y-speak','a11y-zones','a11y-sr'].forEach(function(c){ document.body.classList.remove(c); });
    document.removeEventListener('click',_speakClick);
    window.speechSynthesis && speechSynthesis.cancel();
    document.documentElement.style.fontSize='';
    ['a11yCss','a11yTxtCss'].forEach(function(id){ var s=document.getElementById(id); if(s) s.textContent=''; });
    document.querySelectorAll('.a11y-feat').forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
    ['rFont','rLine','rWord','rLetter'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=(id==='rFont'?2:0); });
    ['sFont','sLine','sWord','sLetter'].forEach(function(id){ var el=document.getElementById(id); if(el) el.textContent=(id==='sFont'?'100%':'норма'); });
    var bc=document.getElementById('a11yBgClr'); if(bc) bc.value='#f8f5f0';
    var tc=document.getElementById('a11yTxtClr'); if(tc) tc.value='#2d2d2d';
    var lc=document.getElementById('a11yLnkClr'); if(lc) lc.value='#0f3460';
    _A={contrast:null,fontIdx:2,line:0,word:0,letter:0,feats:{},bgClr:null,txtClr:null,lnkClr:null};
    if (!silent) try { localStorage.removeItem('a11yData'); } catch(e){}
  }
  window.a11yResetAll = a11yResetAll;

  /* ── Event delegation (a11y panel) ──────────────────────────── */
  function bindA11y() {
    var overlay = document.getElementById('a11yOverlay');
    var btn     = document.getElementById('a11yToggleBtn');
    var panel   = document.getElementById('a11yPanel');
    if (!panel) return;

    overlay.onclick = a11yClose;
    btn.onclick = a11yToggle;
    panel.querySelector('.a11y-hdr-close').onclick = a11yClose;
    panel.querySelector('.a11y-reset-all').onclick = function(){ a11yResetAll(); };

    /* Section toggles */
    panel.querySelectorAll('.a11y-sec-hdr').forEach(function(hdr){
      hdr.onclick = function(){ a11yToggleSec(this); };
    });

    /* Feature buttons */
    panel.querySelectorAll('.a11y-feat').forEach(function(b){
      b.onclick = function(){
        var type = this.getAttribute('data-type');
        var val  = this.getAttribute('data-val');
        if (type === 'contrast') {
          var wasActive = this.classList.contains('active');
          _clearContrast();
          if (!wasActive) {
            this.classList.add('active'); this.setAttribute('aria-pressed','true');
            var m = {'hc-light':'a11y-hc-light','hc-dark':'a11y-hc-dark',mono:'a11y-mono',invert:'a11y-invert','high-sat':'a11y-high-sat','low-sat':'a11y-low-sat'};
            document.body.classList.add(m[val]||''); _A.contrast=val;
          }
        } else if (type === 'profile') {
          var wasP = this.classList.contains('active');
          a11yResetAll(true);
          if (!wasP) {
            this.classList.add('active'); this.setAttribute('aria-pressed','true');
            var cfg = _profiles[val]||{};
            (cfg.feats||[]).forEach(function(f){ var fb=document.querySelector('[data-feat="'+f+'"]'); if(fb){fb.classList.add('active');fb.setAttribute('aria-pressed','true');} _A.feats[f]=true; _applyFeat(f,true); });
            if (cfg.fontIdx!==undefined){ _A.fontIdx=cfg.fontIdx; document.documentElement.style.fontSize=_fontSteps[cfg.fontIdx]+'%'; var rF=document.getElementById('rFont'); if(rF) rF.value=cfg.fontIdx; var sF=document.getElementById('sFont'); if(sF) sF.textContent=_fontSteps[cfg.fontIdx]+'%'; }
            if (cfg.line){ _A.line=cfg.line; var rL=document.getElementById('rLine'); if(rL) rL.value=cfg.line; var sL=document.getElementById('sLine'); if(sL) sL.textContent='+'+cfg.line; }
            if (cfg.word){ _A.word=cfg.word; }
            _applyTextStyle();
          }
        } else {
          var on = this.classList.toggle('active');
          this.setAttribute('aria-pressed', on ? 'true' : 'false');
          _A.feats[val] = on; _applyFeat(val, on);
        }
        a11ySave();
      };
    });

    /* Contrast section reset */
    panel.querySelectorAll('.a11y-sec-reset').forEach(function(btn){
      btn.onclick = function(){
        var sec = this.closest('.a11y-sec-body');
        var secHdr = this.closest('.a11y-sec').querySelector('.a11y-sec-hdr');
        var title = secHdr ? secHdr.textContent.trim() : '';
        if (title.indexOf('контраст') > -1 || title.indexOf('Контраст') > -1) { _clearContrast(); }
        else if (title.indexOf('цвет') > -1 || title.indexOf('Цвет') > -1) {
          _A.bgClr=null; _A.txtClr=null; _A.lnkClr=null;
          var s=document.getElementById('a11yCss'); if(s) s.textContent='';
          var bc2=document.getElementById('a11yBgClr'); if(bc2) bc2.value='#f8f5f0';
          var tc2=document.getElementById('a11yTxtClr'); if(tc2) tc2.value='#2d2d2d';
          var lc2=document.getElementById('a11yLnkClr'); if(lc2) lc2.value='#0f3460';
        } else {
          _A.fontIdx=2; _A.line=0; _A.word=0; _A.letter=0;
          document.documentElement.style.fontSize='';
          var st=document.getElementById('a11yTxtCss'); if(st) st.textContent='';
          ['rFont','rLine','rWord','rLetter'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=(id==='rFont'?2:0); });
          ['sFont','sLine','sWord','sLetter'].forEach(function(id){ var el=document.getElementById(id); if(el) el.textContent=(id==='sFont'?'100%':'норма'); });
          ['links','titles','dyslexia'].forEach(function(f){ var fb=document.querySelector('[data-feat="'+f+'"]'); if(fb){fb.classList.remove('active');fb.setAttribute('aria-pressed','false');} _applyFeat(f,false); delete _A.feats[f]; });
        }
        a11ySave();
      };
    });

    /* Color inputs */
    var bgClr = document.getElementById('a11yBgClr');
    var txtClr = document.getElementById('a11yTxtClr');
    var lnkClr = document.getElementById('a11yLnkClr');
    if (bgClr)  bgClr.oninput  = function(){ _A.bgClr=this.value;  _applyColorStyle(); a11ySave(); };
    if (txtClr) txtClr.oninput = function(){ _A.txtClr=this.value; _applyColorStyle(); a11ySave(); };
    if (lnkClr) lnkClr.oninput = function(){ _A.lnkClr=this.value; _applyColorStyle(); a11ySave(); };

    /* Sliders */
    var rFont = document.getElementById('rFont');
    var rLine = document.getElementById('rLine');
    var rWord = document.getElementById('rWord');
    var rLetter = document.getElementById('rLetter');
    if (rFont) rFont.oninput = function(){ _A.fontIdx=+this.value; document.documentElement.style.fontSize=_fontSteps[_A.fontIdx]+'%'; var s=document.getElementById('sFont'); if(s) s.textContent=_fontSteps[_A.fontIdx]+'%'; a11ySave(); };
    if (rLine) rLine.oninput = function(){ _A.line=+this.value; var s=document.getElementById('sLine'); if(s) s.textContent=_A.line?'+'+_A.line:'норма'; _applyTextStyle(); a11ySave(); };
    if (rWord) rWord.oninput = function(){ _A.word=+this.value; var s=document.getElementById('sWord'); if(s) s.textContent=_A.word?'+'+_A.word:'норма'; _applyTextStyle(); a11ySave(); };
    if (rLetter) rLetter.oninput = function(){ _A.letter=+this.value; var s=document.getElementById('sLetter'); if(s) s.textContent=_A.letter?'+'+_A.letter:'норма'; _applyTextStyle(); a11ySave(); };

    /* Font step buttons */
    var fDec = document.getElementById('sFontDec');
    var fRst = document.getElementById('sFontReset');
    var fInc = document.getElementById('sFontInc');
    if (fDec) fDec.onclick = function(){ if(!rFont) return; rFont.value=Math.max(0,+rFont.value-1); rFont.dispatchEvent(new Event('input')); };
    if (fRst) fRst.onclick = function(){ if(!rFont) return; rFont.value=2; rFont.dispatchEvent(new Event('input')); };
    if (fInc) fInc.onclick = function(){ if(!rFont) return; rFont.value=Math.min(6,+rFont.value+1); rFont.dispatchEvent(new Event('input')); };
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    injectWidgets();
    bindA11y();
    a11yRestore();
    loadFabSettings();
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { fabClose(); a11yClose(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
