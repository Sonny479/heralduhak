// 모바일 버전 nav 햄버거바
document.addEventListener('DOMContentLoaded', function(){
  var navToggleBtn = document.querySelector('.nav-toggle');
  var gnbList = document.querySelector('.gnb__list');
  var hasSubItems = document.querySelectorAll('.has-sub');

  // 현재 뷰포트 너비가 1024px 이하인지 확인하는 함수
  function isMobileView(){ return window.innerWidth <= 1024; }

  // 1. nav-toggle 기능
  if (navToggleBtn && gnbList){
    navToggleBtn.addEventListener('click', function(){
      if (isMobileView()) {
        gnbList.classList.toggle('active');
      }
    });
  }

  // 2. has-sub 기능
  for (var i=0; i<hasSubItems.length; i++){
    var item = hasSubItems[i];
    var mainLink = item.querySelector('a');
    var subMenu = item.querySelector('.sub');
    if (mainLink && subMenu){
      mainLink.addEventListener('click', function(e){
        if (isMobileView()){
          e.preventDefault();
          var sub = this.parentNode.querySelector('.sub');
          if (sub) sub.classList.toggle('active');
        }
      });
    }
  }

  // 3. 리사이즈 시 메뉴 초기화
  window.addEventListener('resize', function(){
    if (!isMobileView()){
      if (gnbList && gnbList.classList.contains('active')){
        gnbList.classList.remove('active');
      }
      for (var j=0; j<hasSubItems.length; j++){
        var sub = hasSubItems[j].querySelector('.sub');
        if (sub && sub.classList.contains('active')){
          sub.classList.remove('active');
        }
      }
    }
  });
});


/* ===== Hero Slider (홈 전용) ===== */
(function initHeroSliders(){
  var sliders = document.querySelectorAll('.slider');
  for (var i=0; i<sliders.length; i++){
    (function(slider){
      var slidesWrap = slider.querySelector('.slides');
      var slideEls = slider.querySelectorAll('.slide');
      var dots = slider.querySelectorAll('.dot');
      var prevBtn = slider.querySelector('.prev');
      var nextBtn = slider.querySelector('.next');

      var total = slideEls.length;
      var index = 0;
      var timer = null;
      var interval = parseInt(slider.getAttribute('data-interval') || '5000', 10);
      var autoplay = slider.getAttribute('data-autoplay') === 'true';

      function go(to){
        index = (to + total) % total;
        if (slidesWrap) slidesWrap.style.transform = 'translateX(-' + (index * 100) + '%)';
        for (var d=0; d<dots.length; d++){
          var active = (d === index);
          dots[d].classList.toggle('is-active', active);
          dots[d].setAttribute('aria-selected', active ? 'true' : 'false');
        }
      }

      function next(){ go(index+1); }
      function prev(){ go(index-1); }

      function start(){
        if(!autoplay || timer) return;
        timer = setInterval(next, interval);
      }
      function stop(){
        if(timer){ clearInterval(timer); timer = null; }
      }

      if (nextBtn) nextBtn.addEventListener('click', function(){ stop(); next(); start(); });
      if (prevBtn) prevBtn.addEventListener('click', function(){ stop(); prev(); start(); });
      for (var d2=0; d2<dots.length; d2++){
        (function(i2){
          dots[i2].addEventListener('click', function(){ stop(); go(i2); start(); });
        })(d2);
      }

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);

      var sx = 0;
      slider.addEventListener('touchstart', function(e){
        sx = e.touches[0].clientX; stop();
      }, {passive:true});
      slider.addEventListener('touchend', function(e){
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 30) (dx < 0 ? next() : prev());
        start();
      }, {passive:true});

      if ('IntersectionObserver' in window){
        var io = new IntersectionObserver(function(ents){
          for (var k=0; k<ents.length; k++){
            if (ents[k].isIntersecting) start(); else stop();
          }
        }, {threshold:0.3});
        io.observe(slider);
      } else {
        start();
      }

      go(0);
      start();
    })(sliders[i]);
  }
})();


// TOP 버튼 및 스무스 스크롤
document.addEventListener('DOMContentLoaded', function(){
  var links = document.querySelectorAll('a[href^="#"]:not([data-scroll="external"])');
  for (var i=0; i<links.length; i++){
    links[i].addEventListener('click', function(e){
      var id = this.getAttribute('href').slice(1);
      if(!id) return;
      var el = document.getElementById(id);
      if(!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - 0;
      if (window.scrollTo){
        window.scrollTo({top: y, behavior:'smooth'});
      } else {
        window.scroll(0, y);
      }
    });
  }
});


// ===== Stories: seamless marquee =====
document.addEventListener('DOMContentLoaded', function(){
  var viewport = document.querySelector('.stories-viewport');
  var track = document.querySelector('.stories-track');
  if (!viewport || !track) return;

  var SPEED = 60; // px/sec
  var orig = Array.prototype.slice.call(track.children);
  var w = track.scrollWidth;
  var need = viewport.clientWidth * 2;

  while (w < need){
    for (var i=0; i<orig.length; i++){
      track.appendChild(orig[i].cloneNode(true));
    }
    w = track.scrollWidth;
  }

  var setWidth = 0;
  for (var i2=0; i2<orig.length; i2++){
    var el = track.children[i2];
    var rect = el.getBoundingClientRect();
    if (!rect.width) continue; // Safari 0 width guard
    var style = window.getComputedStyle ? getComputedStyle(track) : {};
    var gap = parseFloat(style.columnGap || style.gap || 0) || 0;
    setWidth += rect.width;
    if (i2 < orig.length - 1) setWidth += gap;
  }

  if (setWidth > 0){
    var duration = (setWidth / SPEED).toFixed(2);
    track.style.setProperty('--loop', setWidth + 'px');
    track.style.setProperty('--duration', duration + 's');
    track.classList.add('is-animating');
  }

  var rid = null;
  window.addEventListener('resize', function(){
    cancelAnimationFrame(rid);
    rid = requestAnimationFrame(function(){
      var newW = track.scrollWidth;
      if (newW < viewport.clientWidth * 2){
        for (var i3=0; i3<orig.length; i3++){
          track.appendChild(orig[i3].cloneNode(true));
        }
      }
    });
  });
});


/* ===== Lang Switch + i18n ===== */
(function(){
  var root = document.documentElement;
  var switchEl = document.getElementById('langSwitch');
  if(!switchEl) return;

  var btn = switchEl.querySelector('.lang-switch__btn');
  var list = switchEl.querySelector('.lang-switch__list');
  var label = switchEl.querySelector('[data-lang-label]');

  function applyI18n(lang){
    var dict = (window.I18N && window.I18N[lang]) || (window.I18N && window.I18N.ko) || {};
    var els = document.querySelectorAll('[data-i18n]');
    for (var i=0; i<els.length; i++){
      var key = els[i].getAttribute('data-i18n');
      if (dict[key]) els[i].textContent = dict[key];
    }
    root.setAttribute('lang', lang === 'ko' ? 'ko' : 'en');
  }

  function setLang(lang, displayLabel){
    try {
      localStorage.setItem('site_lang', lang);
    } catch(e){
      console.warn('localStorage unavailable:', e.message);
    }
    if (label && displayLabel) label.textContent = displayLabel;
    // applyI18n(lang); // 필요 시 해제
  }

  btn.addEventListener('click', function(e){
    e.stopPropagation();
    var open = switchEl.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  list.addEventListener('click', function(e){
    var b = e.target.closest('button[data-lang]');
    if(!b) return;
    var lang = b.getAttribute('data-lang');
    var lab  = b.getAttribute('data-label');
    setLang(lang, lab);
    switchEl.classList.remove('is-open');
    btn.setAttribute('aria-expanded','false');
  });

  document.addEventListener('click', function(){
    if(switchEl.classList.contains('is-open')){
      switchEl.classList.remove('is-open');
      btn.setAttribute('aria-expanded','false');
    }
  });

  var saved = 'ko';
  try {
    saved = localStorage.getItem('site_lang') || 'ko';
  } catch(e){
    console.warn('localStorage not accessible in Safari private mode.');
  }
  setLang(saved, saved==='ko' ? 'KR' : 'EN');
})();


// ===== Consult page only =====
(function(){
  var doc = document;
  var isConsult = (doc.documentElement.getAttribute('data-page') === 'consult') ||
                  (doc.body && doc.body.getAttribute('data-page') === 'consult');
  if(!isConsult) return;

  var form = doc.getElementById('consultForm');
  var message = doc.getElementById('message');
  var charNow = doc.getElementById('charNow');
  var interestGroup = doc.getElementById('interestGroup');
  var maxPick = parseInt((interestGroup && interestGroup.dataset && interestGroup.dataset.max) || '2', 10);

  // 글자수 표시
  if (message && charNow){
    function update(){ charNow.textContent = String(message.value.length); }
    message.addEventListener('input', update);
    update();
  }

  // 관심 프로그램 최대 선택 제한
  if (interestGroup){
    var boxes = interestGroup.querySelectorAll('input[type="checkbox"]');
    interestGroup.addEventListener('change', function(){
      var picked = [];
      for (var i=0; i<boxes.length; i++){
        if (boxes[i].checked) picked.push(boxes[i]);
      }
      if (picked.length > maxPick){
        picked[picked.length - 1].checked = false;
        alert('관심 프로그램은 최대 ' + maxPick + '개까지 선택할 수 있어요.');
      }
    });
  }
})();