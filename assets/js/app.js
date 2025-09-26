// 모바일 메뉴 토글
const toggleBtn = document.querySelector('.gnb__toggle');
const gnbList = document.querySelector('#gnbMenu');
if (toggleBtn && gnbList) {
  toggleBtn.addEventListener('click', () => {
    const open = gnbList.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  gnbList.addEventListener('click', e => {
    if (e.target.tagName === 'A' && gnbList.classList.contains('is-open')) {
      gnbList.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

// 페이지 키로 활성 메뉴 표시
const pageKey = document.body.getAttribute('data-page'); // home/about/consult/study/early/tutoring/transfer
document.querySelectorAll('.gnb__list a').forEach(a => {
  const key = a.getAttribute('data-key');
  a.classList.toggle('is-active', key === pageKey);
});

// 스크롤 리빌
const io = new IntersectionObserver((entries)=>{
  entries.forEach(ent=>{
    if(ent.isIntersecting){ ent.target.classList.add('show'); io.unobserve(ent.target); }
  });
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

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


