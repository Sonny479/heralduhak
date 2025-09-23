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

/* ===== Consult form (선택 2개 제한 + 500자 카운터) ===== */
(function initConsultForm(){
  const form = document.getElementById('consultForm');
  if(!form) return;

  // 관심프로그램: 최대 2개
  const maxSel = 2;
  const boxes = Array.from(form.querySelectorAll('input[name="interest"]'));
  const hint = form.querySelector('#interestHint');
  function updateInterests(){
    const checked = boxes.filter(b=>b.checked);
    boxes.forEach(b=>{
      if(!b.checked) b.disabled = checked.length >= maxSel;
    });
    hint.textContent = checked.length >= maxSel
      ? `최대 ${maxSel}개 선택 완료`
      : `최대 ${maxSel}개까지 선택 가능합니다.`;
  }
  boxes.forEach(b=> b.addEventListener('change', updateInterests));
  updateInterests();

  // 문의내용 500자 제한
  const ta = form.querySelector('#message');
  const counter = form.querySelector('#msgCount');
  const maxLen = 500;
  function updateCount(){
    if(ta.value.length > maxLen) ta.value = ta.value.slice(0, maxLen);
    counter.textContent = `${ta.value.length}/${maxLen}`;
  }
  ta.addEventListener('input', updateCount);
  updateCount();

  // 제출(데모)
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('상담 요청이 접수되었습니다. 운영자가 확인 후 연락드리겠습니다.');
    form.reset();
    updateInterests();
    updateCount();
  });
})();
