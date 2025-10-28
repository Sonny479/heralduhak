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



// TOP 버튼
document.addEventListener('DOMContentLoaded', ()=>{

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
});



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
})();