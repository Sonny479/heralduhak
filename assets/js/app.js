// 모바일 버전 nav 햄버거바
document.addEventListener('DOMContentLoaded', () => {
  const navToggleBtn = document.querySelector('.nav-toggle');
  const gnbList = document.querySelector('.gnb__list');
  const hasSubItems = document.querySelectorAll('.has-sub');

  // 현재 뷰포트 너비가 1024px 이하인지 확인하는 함수
  const isMobileView = () => window.innerWidth <= 1024;

  // 1. nav-toggle 기능: nav-toggle 클릭 시 gnb__list active 토글
  if (navToggleBtn && gnbList) {
    navToggleBtn.addEventListener('click', () => {
      if (isMobileView()) {
        gnbList.classList.toggle('active');
        // 모바일 메뉴가 열렸을 때 body 스크롤 방지 (선택 사항)
        // document.body.classList.toggle('no-scroll', gnbList.classList.contains('active'));
      }
    });
  }

  // 2. has-sub 기능: has-sub 클릭 시 해당 서브 메뉴 active 토글
  hasSubItems.forEach(item => {
    // has-sub 바로 아래의 <a> 태그를 클릭 이벤트 대상으로 설정
    const mainLink = item.querySelector('a');
    // has-sub 바로 아래의 <ul>.sub 태그가 서브 메뉴
    const subMenu = item.querySelector('.sub');

    if (mainLink && subMenu) { // 메인 링크와 서브 메뉴가 모두 존재할 경우에만 동작
      mainLink.addEventListener('click', (e) => {
        if (isMobileView()) {
          // 기본 링크 이동 동작 방지 (서브 메뉴 토글이 우선)
          e.preventDefault();

          // 클릭된 has-sub 항목의 서브 메뉴 active 클래스 토글
          subMenu.classList.toggle('active');

          // 다른 열려있는 서브 메뉴 닫기 (선택 사항)
          // 여러 서브 메뉴가 동시에 열리는 것을 방지하고 싶다면 다음 코드를 활용하세요.
          // hasSubItems.forEach(otherItem => {
          //   if (otherItem !== item) { // 현재 클릭된 항목이 아닌 다른 항목
          //     const otherSubMenu = otherItem.querySelector('.sub');
          //     if (otherSubMenu && otherSubMenu.classList.contains('active')) {
          //       otherSubMenu.classList.remove('active');
          //     }
          //   }
          // });
        }
      });
    }
  });

  // 3. 화면 크기 조절 시 메뉴 상태 초기화 (옵션)
  // 1024px을 넘어가면 모바일 메뉴와 서브 메뉴의 active 클래스 제거
  window.addEventListener('resize', () => {
    if (!isMobileView()) {
      if (gnbList.classList.contains('active')) {
        gnbList.classList.remove('active');
        // document.body.classList.remove('no-scroll');
      }
      hasSubItems.forEach(item => {
        const subMenu = item.querySelector('.sub');
        if (subMenu && subMenu.classList.contains('active')) {
          subMenu.classList.remove('active');
        }
      });
    }
  });
});








// 모바일 메뉴 토글
// const toggleBtn = document.querySelector('.gnb__toggle');
// const gnbList = document.querySelector('#gnbMenu');
// if (toggleBtn && gnbList) {
//   toggleBtn.addEventListener('click', () => {
//     const open = gnbList.classList.toggle('is-open');
//     toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
//     document.body.style.overflow = open ? 'hidden' : '';
//   });
//   gnbList.addEventListener('click', e => {
//     if (e.target.tagName === 'A' && gnbList.classList.contains('is-open')) {
//       gnbList.classList.remove('is-open');
//       toggleBtn.setAttribute('aria-expanded', 'false');
//       document.body.style.overflow = '';
//     }
//   });
// }





// 페이지 키로 활성 메뉴 표시
const pageKey = document.body.getAttribute('data-page'); // home/about/consult/study/early/tutoring/transfer
document.querySelectorAll('.gnb__list a').forEach(a => {
  const key = a.getAttribute('data-key');
  a.classList.toggle('is-active', key === pageKey);
});

// 스크롤 리빌 (iOS 호환성 개선)
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){ ent.target.classList.add('show'); io.unobserve(ent.target); }
    });
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
} else {
  // 구형 브라우저 폴백: 즉시 표시
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('show'));
}

/* ===== Hero Slider (홈 전용) ===== */
(function initHeroSliders(){
  document.querySelectorAll('.slider').forEach(slider=>{
    const slidesWrap = slider.querySelector('.slides');
    const slideEls = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.dot');
    const prevBtn = slider.querySelector('.prev');
    const nextBtn = slider.querySelector('.next');

    const total = slideEls.length;
    let index = 0;
    let timer = null;
    const interval = parseInt(slider.getAttribute('data-interval') || '5000', 10);
    const autoplay = slider.getAttribute('data-autoplay') === 'true';

    function go(to){
      index = (to + total) % total;
      slidesWrap.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d,i)=>{
        d.classList.toggle('is-active', i===index);
        d.setAttribute('aria-selected', i===index ? 'true' : 'false');
      });
    }
    function next(){ go(index+1); }
    function prev(){ go(index-1); }

    function start(){
      if(!autoplay || timer) return;
      timer = setInterval(next, interval);
    }
    function stop(){ if(timer){ clearInterval(timer); timer=null; } }

    nextBtn && nextBtn.addEventListener('click', ()=>{ stop(); next(); start(); });
    prevBtn && prevBtn.addEventListener('click', ()=>{ stop(); prev(); start(); });
    dots.forEach((dot,i)=> dot.addEventListener('click', ()=>{ stop(); go(i); start(); }));

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    let sx = 0;
    slider.addEventListener('touchstart', e=>{ sx = e.touches[0].clientX; stop(); }, {passive:true});
    slider.addEventListener('touchend', e=>{
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 30) (dx < 0 ? next() : prev());
      start();
    }, {passive:true});

    if ('IntersectionObserver' in window){
      const io = new IntersectionObserver((ents)=>{
        ents.forEach(ent=> ent.isIntersecting ? start() : stop());
      }, {threshold:0.3});
      io.observe(slider);
    } else {
      // 구형 브라우저 폴백
      start();
    }

    go(0);
    start();
  });
})();

/* ===== Reviews Marquee (홈) ===== */
(function initMarquees(){
  document.querySelectorAll('.marquee[data-dup="auto"]').forEach((wrap)=>{
    const track = wrap.querySelector('.marquee__track');
    if (!track) return;
    track.innerHTML = track.innerHTML + track.innerHTML; // 끊김 없는 루프
  });
})();

/* ===== Sticky Bar (채널톡 자리표시 링크) ===== */
// 실제 채널톡/블로그 URL이 준비되면 아래 selector의 href를 교체하면 끝.
document.querySelectorAll('[data-office="vancouver"]').forEach(a=>{
  // a.href = 'https://channel.io/...' // TODO: HERALD CAMPUS 채널톡 URL
});
document.querySelectorAll('[data-office="seoul"]').forEach(a=>{
  // a.href = 'https://channel.io/...' // TODO: HIS 헤럴드교육센터 채널톡 URL
});


// ===== Smooth scroll (custom easing) =====
function smoothScrollTo(targetY, duration = 900){
  const startY = window.scrollY || window.pageYOffset;
  const diff = Math.max(0, targetY) - startY;
  const startT = performance.now();
  const easeInOut = t => (t<.5) ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

  function frame(now){
    const elapsed = now - startT;
    const p = Math.min(1, elapsed / duration);
    const eased = easeInOut(p);
    window.scrollTo(0, startY + diff * eased);
    if(p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// TOP 버튼
document.addEventListener('DOMContentLoaded', ()=>{
  const topBtn = document.querySelector('.aside-nav .top-btn');
  if(topBtn){
    topBtn.addEventListener('click', e=>{
      e.preventDefault();
      smoothScrollTo(0, 900); // 0.9초
    });
  }

  // 내부 앵커 스무스 스크롤 (href="#section-id")
  document.querySelectorAll('a[href^="#"]:not([data-scroll="external"])').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href').slice(1);
      if(!id) return;
      const el = document.getElementById(id);
      if(!el) return; // 연결은 나중에 네가 추가 가능
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - 0; // 필요 시 오프셋 조절
      smoothScrollTo(y, 900);
    });
  });
});

// ===== Stories: seamless marquee (center 1194px) =====
document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.querySelector('.stories-viewport');
  const track = document.querySelector('.stories-track');
  if (!viewport || !track) return;

  const SPEED = 60; // px/sec (원하는 속도 조절)

  // 1) 콘텐츠를 복제해 전체 길이가 최소 2배(무한 순환) 되도록 채움
  const orig = Array.from(track.children);
  let w = track.scrollWidth;
  const need = viewport.clientWidth * 2; // 2배 이상이면 자연 루프
  while (w < need) {
    orig.forEach(node => track.appendChild(node.cloneNode(true)));
    w = track.scrollWidth;
  }

  // 2) 루프 구간 너비(= 원본 세트 길이) 계산
  const setWidth = (() => {
    // 원본 세트 길이는 최초 8장의 폭 + 간격
    // track 첫 세트(원본 8개)의 총 폭을 계산
    let sum = 0;
    for (let i = 0; i < orig.length; i++) {
      const el = track.children[i];
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || 0);
      sum += el.getBoundingClientRect().width;
      if (i < orig.length - 1) sum += gap;
    }
    return Math.round(sum);
  })();

  // 3) CSS 변수 주입: 루프 길이/지속시간
  const duration = (setWidth / SPEED).toFixed(2); // 초
  track.style.setProperty('--loop', `${setWidth}px`);
  track.style.setProperty('--duration', `${duration}s`);
  track.classList.add('is-animating');

  // 4) 리사이즈 대응(간단): 폭 변화 시 재계산
  let rid = null;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rid);
    rid = requestAnimationFrame(() => {
      const newW = track.scrollWidth;
      if (newW < viewport.clientWidth * 2) {
        // 부족하면 한 세트 더 복제
        orig.forEach(node => track.appendChild(node.cloneNode(true)));
      }
    });
  });

  // 내부 앵커 스무스 스크롤(우리가 이미 넣은 로직과 중복되지 않으면 패스)
});

// =========================
// About page only scripts
// =========================
(function () {
  var html = document.documentElement;
  if (!html || html.getAttribute('data-page') !== 'about') return;

  // 1) 인터섹션 옵저버로 섹션 페이드인 (중복 방지)
  if (!window.__ABOUT_OBS_INITIALIZED__) {
    window.__ABOUT_OBS_INITIALIZED__ = true;

    try {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });

      document.querySelectorAll('.js-observe').forEach(function (el) { io.observe(el); });
    } catch (err) {
      // 구형 브라우저 폴백: 즉시 표시
      document.querySelectorAll('.js-observe').forEach(function (el) {
        el.classList.add('is-in');
      });
    }
  }

  // 2) CTA 버튼(선택) – consult 페이지로 이동 (기본 a링크지만, 혹시 버튼으로 바뀌어도 안전)
  var cta = document.getElementById('cta-consult');
  if (cta && cta.tagName === 'BUTTON') {
    cta.addEventListener('click', function () { window.location.href = 'consult.html'; });
  }
})();

/* =========================
   Consult Page Scripts (scoped)
   ========================= */
// (function(){
//   var html = document.documentElement;
//   if (!html || html.getAttribute('data-page') !== 'consult') return;

//   var form = document.getElementById('consultForm');
//   var message = document.getElementById('message');
//   var charNow = document.getElementById('charNow');
//   var interestGroup = document.getElementById('interestGroup');
//   var maxPick = parseInt(interestGroup?.dataset.max || '2', 10);

//   // 글자수 카운터
//   if (message && charNow) {
//     var updateCount = function(){
//       var len = message.value.length;
//       charNow.textContent = String(len);
//     };
//     message.addEventListener('input', updateCount);
//     updateCount();
//   }

//   // 관심 프로그램: 최대 2개 제한
//   if (interestGroup) {
//     var checkboxes = interestGroup.querySelectorAll('input[type="checkbox"]');
//     interestGroup.addEventListener('change', function(){
//       var picked = Array.from(checkboxes).filter(function(c){ return c.checked; });
//       if (picked.length > maxPick) {
//         // 마지막 클릭 취소
//         var last = picked[picked.length-1];
//         last.checked = false;
//         alert('관심 프로그램은 최대 ' + maxPick + '개까지 선택할 수 있어요.');
//       }
//     });
//   }

//   // 간단 검증 & 제출 (백엔드 미연동: 일단 기본 동작 방지)
//   if (form) {
//     form.addEventListener('submit', function(e){
//       e.preventDefault();

//       // 필수값
//       var requiredOk = true;
//       ['studentName','grade','agree'].forEach(function(id){
//         var el = document.getElementById(id);
//         if (!el) return;
//         if ((el.type === 'checkbox' && !el.checked) || (el.value || '').trim() === '') {
//           requiredOk = false;
//           el.focus();
//         }
//       });

//       // 성별 라디오
//       var genderChecked = !!form.querySelector('input[name="gender"]:checked');
//       if (!genderChecked) { requiredOk = false; form.querySelector('input[name="gender"]').focus(); }

//       if (!requiredOk) {
//         alert('필수 항목을 확인해주세요.2');
//         return;
//       }

//       // 여기서 실제 전송 로직 연결 (fetch/POST 등)
//       alert('상담 요청이 접수되었습니다. 담당자가 상담시간 내에 연락드릴게요!');
//       form.reset();
//       if (charNow) charNow.textContent = '0';
//     });
//   }
// })();

document.querySelectorAll('.table-wrap').forEach(el=>el.style.scrollBehavior='smooth');

/* =========================================
   [ADD] Lang Switch + i18n
========================================= */
(function(){
  const $root = document.documentElement;
  const $switch = document.getElementById('langSwitch');
  if(!$switch) return;

  const $btn = $switch.querySelector('.lang-switch__btn');
  const $list = $switch.querySelector('.lang-switch__list');
  const $label = $switch.querySelector('[data-lang-label]');



  function applyI18n(lang){
    const dict = I18N[lang] || I18N.ko;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(dict[key]) el.textContent = dict[key];
    });
    $root.setAttribute('lang', lang === 'ko' ? 'ko' : 'en');
  }

  function setLang(lang, displayLabel){
    localStorage.setItem('site_lang', lang);
    if(displayLabel) $label.textContent = displayLabel;
    // applyI18n(lang);
  }

  // toggle open/close
  $btn.addEventListener('click', e=>{
    e.stopPropagation();
    const open = $switch.classList.toggle('is-open');
    $btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // select
  $list.addEventListener('click', e=>{
    const b = e.target.closest('button[data-lang]');
    if(!b) return;
    const lang = b.getAttribute('data-lang');      // 'en' | 'ko'
    const lab  = b.getAttribute('data-label');     // 'EN' | 'KR'
    setLang(lang, lab);
    $switch.classList.remove('is-open');
    $btn.setAttribute('aria-expanded','false');
  });
  // close on outside
  document.addEventListener('click', ()=> {
    if($switch.classList.contains('is-open')){
      $switch.classList.remove('is-open');
      $btn.setAttribute('aria-expanded','false');
    }
  });

  // init
  const saved = localStorage.getItem('site_lang') || 'kr';
  setLang(saved, saved==='ko' ? 'KR' : 'EN');
})();

// ===== Consult page only =====
(function(){
  const doc = document;
  const isConsult = (doc.documentElement.getAttribute('data-page') === 'consult') ||
                    (doc.body && doc.body.getAttribute('data-page') === 'consult');
  if(!isConsult) return;

  const form = doc.getElementById('consultForm');
  const message = doc.getElementById('message');
  const charNow = doc.getElementById('charNow');
  const interestGroup = doc.getElementById('interestGroup');
  const maxPick = parseInt(interestGroup?.dataset.max || '2', 10);

  // 글자수 표시
  if (message && charNow){
    const update = () => { charNow.textContent = String(message.value.length); };
    message.addEventListener('input', update); update();
  }

  // 관심 프로그램 최대 2개 선택 제한
  if (interestGroup){
    const boxes = interestGroup.querySelectorAll('input[type="checkbox"]');
    interestGroup.addEventListener('change', () => {
      const picked = Array.from(boxes).filter(b => b.checked);
      if (picked.length > maxPick){
        picked[picked.length - 1].checked = false;
        alert('관심 프로그램은 최대 ' + maxPick + '개까지 선택할 수 있어요.');
      }
    });
  }

  // 간단 검증
  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const need = ['studentName','grade','agree'];
      for (const id of need){
        const el = doc.getElementById(id);
        if (!el) continue;
        if ((el.type === 'checkbox' && !el.checked) || (el.value || '').trim() === ''){
          el.focus(); alert('필수 항목을 확인해주세요.'); return;
        }
      }
      alert('상담 요청이 접수되었습니다. 담당자가 상담시간 내에 연락드릴게요!');
      form.reset(); if (charNow) charNow.textContent = '0';
    });
  }
})();

// ===== GNB: mobile toggle & submenu accordion =====
(function(){
  const nav = document.querySelector('.gnb');
  if(!nav) return;

  const toggleBtn = nav.querySelector('.nav-toggle');
  const list = nav.querySelector('.gnb__list');
  if(toggleBtn && list){
    toggleBtn.addEventListener('click', ()=>{
      const open = list.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // mobile submenu accordion
  const mq = window.matchMedia('(max-width: 1024px)');
  nav.querySelectorAll('.has-sub > a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      if(!mq.matches) return; // desktop은 기본 hover 동작
      e.preventDefault();
      const li = a.closest('.has-sub');
      const open = li.classList.toggle('open');
      // 다른 open 닫기 (선택)
      nav.querySelectorAll('.has-sub').forEach(x=>{
        if(x !== li) x.classList.remove('open');
      });
    });
  });
})();



