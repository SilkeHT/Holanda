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
    { ids: ['b-tuition'], label: 'Matrícula', cls: 'c-tuition' },
    { ids: ['b-insurance'], label: 'Seguro', cls: 'c-insurance' },
    { ids: ['b-transport', 'b-clothes', 'b-books', 'b-phone', 'b-trips'], label: 'Resto', cls: 'c-rest' }
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
