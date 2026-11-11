// Mobile menu: the list is visible without JavaScript; with it, it collapses behind a button.
(function () {
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (!btn || !menu) return;

  function setOpen(open) {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Cerrar' : 'Menú';
  }

  btn.addEventListener('click', function () {
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setOpen(false); btn.focus(); }
  });
})();

// "Guía" dropdown in the header.
(function () {
  var btn = document.querySelector('.guides-btn');
  var panel = document.getElementById('guides-panel');
  if (!btn || !panel) return;
  function setOpen(open) {
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('click', function (e) {
    if (!panel.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) { setOpen(false); btn.focus(); }
  });
})();

// Budget calculator: every amount is editable; city and work status prefill rent and insurance.
(function () {
  var form = document.getElementById('budget');
  if (!form) return;

  var INSURANCE_WORKING = 27; // ~158 € basic insurance minus up to 131 € zorgtoeslag (2026)
  var DUO_BASISBEURS = 324.52;
  var GROUPS = [
    { ids: ['b-rent'], label: 'Alquiler', cls: 'c-rent' },
    { ids: ['b-food'], label: 'Comida', cls: 'c-food' },
    { ids: ['b-fun'], label: 'Salir y ocio', cls: 'c-fun' },
    { ids: ['b-insurance'], label: 'Seguro', cls: 'c-insurance' },
    { ids: ['b-transport', 'b-clothes', 'b-books', 'b-trips'], label: 'Resto', cls: 'c-rest' }
  ];

  function euros(n) {
    var r = Math.round(n);
    var s = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (r < 0 ? '−' : '') + s + ' €';
  }
  function val(id) {
    var el = document.getElementById(id);
    var n = parseFloat(String(el.value).replace(',', '.'));
    return isFinite(n) && n > 0 ? n : 0;
  }

  var bar = document.getElementById('b-bar');
  var legend = document.getElementById('b-legend');
  var totalOut = document.getElementById('b-total');
  var yearOut = document.getElementById('b-year');
  var balance = document.getElementById('b-balance');

  function update() {
    var total = 0;
    form.querySelectorAll('[data-cost]').forEach(function (el) { total += val(el.id); });

    bar.innerHTML = '';
    legend.innerHTML = '';
    GROUPS.forEach(function (g) {
      var sum = g.ids.reduce(function (a, id) { return a + val(id); }, 0);
      var seg = document.createElement('span');
      seg.className = 'seg ' + g.cls;
      seg.style.width = total > 0 ? (sum / total * 100) + '%' : '0';
      bar.appendChild(seg);
      var li = document.createElement('li');
      li.innerHTML = '<span class="swatch ' + g.cls + '"></span><span class="lg-name"></span><span class="lg-val"></span>';
      li.querySelector('.lg-name').textContent = g.label;
      li.querySelector('.lg-val').textContent = euros(sum);
      legend.appendChild(li);
    });

    totalOut.textContent = euros(total);
    var mini = document.getElementById('b-mini');
    if (mini) mini.textContent = euros(total);
    yearOut.textContent = euros(total * 12);

    var income = val('b-job') + val('b-home') + (document.getElementById('b-duo').checked ? DUO_BASISBEURS : 0);
    if (income > 0) {
      var diff = income - total;
      balance.className = 'result-balance ' + (diff >= 0 ? 'is-plus' : 'is-minus');
      balance.innerHTML = '<p class="bal-line"></p><p class="bal-detail"></p>';
      balance.querySelector('.bal-line').textContent = diff >= 0
        ? 'Te sobran ' + euros(diff) + ' al mes'
        : 'Te faltan ' + euros(-diff) + ' al mes';
      balance.querySelector('.bal-detail').textContent = 'Ingresos: ' + euros(income) + ' al mes.';
    } else {
      balance.className = 'result-balance';
      balance.innerHTML = '<p>Añade tus ingresos para ver cuánto te sobra o te falta cada mes.</p>';
    }
  }

  document.getElementById('b-city').addEventListener('change', function (e) {
    document.getElementById('b-rent').value = e.target.value;
    update();
  });
  form.querySelectorAll('input[name="b-work"]').forEach(function (r) {
    r.addEventListener('change', function () {
      document.getElementById('b-insurance').value = r.value === 'yes' ? INSURANCE_WORKING : 0;
      update();
    });
  });
  form.addEventListener('input', update);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  update();
})();

// Arrival checklist: ticks are kept in this browser only.
(function () {
  var boxes = document.querySelectorAll('input[data-step]');
  if (!boxes.length) return;
  var KEY = 'llegando-a-holanda:llegada';
  var done = [];
  try { done = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { done = []; }
  var num = document.getElementById('progreso-num');
  var bar = document.getElementById('progreso-barra');

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) { /* storage blocked: ticks last for this visit */ }
  }
  function render() {
    boxes.forEach(function (b) {
      b.checked = done.indexOf(b.dataset.step) !== -1;
      b.closest('.step').classList.toggle('is-done', b.checked);
    });
    num.textContent = done.length + ' de ' + boxes.length;
    bar.style.width = (done.length / boxes.length * 100) + '%';
  }
  boxes.forEach(function (b) {
    b.addEventListener('change', function () {
      var i = done.indexOf(b.dataset.step);
      if (b.checked && i === -1) done.push(b.dataset.step);
      if (!b.checked && i !== -1) done.splice(i, 1);
      save(); render();
    });
  });
  document.getElementById('progreso-borrar').addEventListener('click', function () {
    done = []; save(); render();
  });
  render();
})();

// Site search on the home page: loads assets/search-index.json and matches every word typed.
(function () {
  var input = document.getElementById('buscar');
  if (!input) return;
  var status = document.getElementById('buscar-estado');
  var list = document.getElementById('buscar-resultados');
  var index = null, loading = null, timer = null;

  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function load() {
    if (index || loading) return loading;
    loading = fetch('assets/search-index.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        index = data.map(function (e) { e.nh = norm(e.h); e.nt = norm(e.t); e.np = norm(e.pt); return e; });
      })
      .catch(function () { status.textContent = 'No se ha podido cargar la búsqueda. Recarga la página e inténtalo de nuevo.'; });
    return loading;
  }
  function snippet(text, words) {
    var n = norm(text), pos = -1;
    words.forEach(function (w) { var i = n.indexOf(w); if (i !== -1 && (pos === -1 || i < pos)) pos = i; });
    var start = Math.max(0, pos - 60), end = Math.min(text.length, start + 180);
    var out = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    return out;
  }
  function render(q) {
    var words = norm(q).split(/\s+/).filter(function (w) { return w.length > 1; });
    list.innerHTML = '';
    if (!words.length) { status.textContent = ''; return; }
    var hits = [];
    index.forEach(function (e) {
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        var w = words[i], inH = e.nh.indexOf(w) !== -1, inT = e.nt.indexOf(w) !== -1, inP = e.np.indexOf(w) !== -1;
        if (!inH && !inT && !inP) return;
        score += (inH ? 5 : 0) + (inP ? 2 : 0) + (inT ? 1 : 0);
      }
      hits.push({ e: e, s: score });
    });
    hits.sort(function (a, b) { return b.s - a.s; });
    var shown = hits.slice(0, 8);
    status.textContent = hits.length
      ? (hits.length === 1 ? '1 resultado' : hits.length + ' resultados') + (hits.length > 8 ? '. Se muestran los 8 primeros.' : '.')
      : 'No hay resultados para «' + q.trim() + '». Prueba con otra palabra o envíanos tu duda desde Preguntas frecuentes.';
    shown.forEach(function (h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = h.e.p + (h.e.a ? '#' + h.e.a : '');
      var page = document.createElement('span'); page.className = 'sr-page'; page.textContent = h.e.pt;
      var title = document.createElement('strong'); title.textContent = h.e.h;
      var text = document.createElement('span'); text.className = 'sr-text'; text.textContent = h.e.t ? snippet(h.e.t, words) : '';
      a.appendChild(page); a.appendChild(title); if (h.e.t) a.appendChild(text);
      li.appendChild(a); list.appendChild(li);
    });
  }
  input.addEventListener('focus', load);
  input.addEventListener('input', function () {
    clearTimeout(timer);
    var q = input.value;
    timer = setTimeout(function () { load().then(function () { if (index) render(q); }); }, 120);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var first = list.querySelector('a'); if (first) { e.preventDefault(); first.click(); } }
    if (e.key === 'Escape') { input.value = ''; render(''); }
  });
})();
