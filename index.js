(function() {
  'use strict';

  var nav = document.getElementById('navbar');
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  var burger = document.getElementById('hamburger');
  var links  = document.getElementById('navLinks');
  burger.addEventListener('click', function() {
    links.classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.addEventListener('click', function() { links.classList.remove('open'); });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });

  var revObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (en.isIntersecting) { en.target.classList.add('visible'); revObs.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function(el) { revObs.observe(el); });

  function countUp(el) {
    var target = parseInt(el.dataset.target, 10);
    var dur = 1800, step = 16;
    var ticks = Math.ceil(dur / step);
    var inc = target / ticks;
    var cur = 0;
    var t = setInterval(function() {
      cur = Math.min(cur + inc, target);
      el.textContent = cur >= 1000 ? Math.floor(cur).toLocaleString() : Math.floor(cur);
      if (cur >= target) clearInterval(t);
    }, step);
  }

  var statsObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (en.isIntersecting) {
        document.querySelectorAll('.sn').forEach(countUp);
        statsObs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  var strip = document.querySelector('.stats-strip');
  if (strip) statsObs.observe(strip);

  var ph = document.getElementById('apexPhone');
  if (ph) {
    ph.addEventListener('input', function() {
      var v = this.value.replace(/\D/g, '').slice(0, 10);
      if (v.length >= 7)      v = '(' + v.slice(0,3) + ') ' + v.slice(3,6) + '-' + v.slice(6);
      else if (v.length >= 4) v = '(' + v.slice(0,3) + ') ' + v.slice(3);
      else if (v.length)      v = '(' + v;
      this.value = v;
    });
  }

  // doctor specialty filter
  var docTabs = document.querySelectorAll('.doc-tab');
  var docCards = document.querySelectorAll('.doctor-card[data-spec]');
  docTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      docTabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var filter = tab.getAttribute('data-filter');
      docCards.forEach(function(card) {
        if (filter === 'all' || card.getAttribute('data-spec') === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // multi-step booking form
  var form = document.getElementById('apexForm');
  var succ = document.getElementById('apexSuccess');
  var progress = document.getElementById('bookingProgress');

  function stepValid(stepEl) {
    var required = stepEl.querySelectorAll('[required]');
    for (var i = 0; i < required.length; i++) {
      var el = required[i];
      if (el.type === 'radio') {
        var group = stepEl.querySelectorAll('input[name="' + el.name + '"]');
        var checked = Array.prototype.some.call(group, function(r) { return r.checked; });
        if (!checked) { return false; }
      } else if (!el.value.trim()) {
        el.focus();
        return false;
      }
    }
    return true;
  }

  function goToStep(n) {
    if (!form) return;
    form.querySelectorAll('.form-step').forEach(function(s) {
      s.classList.toggle('active', s.getAttribute('data-step') === String(n));
    });
    if (progress) {
      progress.querySelectorAll('.bp-step').forEach(function(s) {
        var sn = parseInt(s.getAttribute('data-step'), 10);
        s.classList.toggle('active', sn === n);
        s.classList.toggle('done', sn < n);
      });
      progress.querySelectorAll('.bp-line').forEach(function(l) {
        var ln = parseInt(l.getAttribute('data-line'), 10);
        l.classList.toggle('done', ln < n);
      });
    }
  }

  if (form) {
    form.querySelectorAll('.step-next').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var currentStep = btn.closest('.form-step');
        if (!stepValid(currentStep)) {
          notify('Please make a selection before continuing.');
          return;
        }
        var n = parseInt(currentStep.getAttribute('data-step'), 10);
        goToStep(n + 1);
      });
    });
    form.querySelectorAll('.step-back').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var currentStep = btn.closest('.form-step');
        var n = parseInt(currentStep.getAttribute('data-step'), 10);
        goToStep(n - 1);
      });
    });
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var lastStep = form.querySelector('.form-step[data-step="3"]');
      if (!stepValid(lastStep)) {
        notify('Please fill out the required fields.');
        return;
      }
      form.style.display = 'none';
      if (progress) progress.style.display = 'none';
      succ.style.display = 'block';
      notify('Appointment request received! Our team will confirm within 2 business hours.');
    });
  }

  function notify(msg) {
    var n = document.getElementById('notification');
    n.textContent = msg;
    n.classList.add('show');
    clearTimeout(n._t);
    n._t = setTimeout(function() { n.classList.remove('show'); }, 5000);
  }

})();
