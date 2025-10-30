// todo : 모바일 버전 nav 햄버거바
function initNav() {
  const navToggleBtn = document.querySelector('.nav-toggle');
  const gnbList = document.querySelector('.gnb__list');
  const hasSubItems = document.querySelectorAll('.has-sub');

  const isMobileView = () => window.innerWidth <= 1024;

  // 1. nav-toggle 클릭 시 메뉴 열기/닫기
  if (navToggleBtn && gnbList) {
    navToggleBtn.addEventListener('click', () => {
      if (isMobileView()) {
        gnbList.classList.toggle('active');
      }
    });
  }

  // 2. has-sub 클릭 시 서브 메뉴 열기/닫기
  hasSubItems.forEach(item => {
    const mainLink = item.querySelector('a');
    const subMenu = item.querySelector('.sub');

    if (mainLink && subMenu) {
      mainLink.addEventListener('click', (e) => {
        if (isMobileView()) {
          e.preventDefault();
          subMenu.classList.toggle('active');
        }
      });
    }
  });

  // 3. 창 크기 변경 시 초기화
  window.addEventListener('resize', () => {
    if (!isMobileView()) {
      if (gnbList && gnbList.classList.contains('active')) {
        gnbList.classList.remove('active');
      }
      hasSubItems.forEach(item => {
        const subMenu = item.querySelector('.sub');
        if (subMenu && subMenu.classList.contains('active')) {
          subMenu.classList.remove('active');
        }
      });
    }
  });
}

/* ===== Hero Slider (index페이지 배너 슬라이드) ===== */
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
document.addEventListener('DOMContentLoaded', function() {
  const btn = document.querySelector('.language-style');
  const layout = btn.closest('.language-layout');

  btn.addEventListener('click', function() {
    layout.classList.toggle('active');
  });
});

// ===== Consult page only (Extended with Google Sheets Integration) =====
(function(){
  const doc = document;
  const isConsult = (doc.documentElement.getAttribute('data-page') === 'consult') ||
                    (doc.body && doc.body.getAttribute('data-page') === 'consult');
  if(!isConsult) return;

  // Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmsSY08AtYwydMX39mnC5YDo45Wm5N2pB6TGyQUWr5z6ti4hDrIf6i8Tc_0eDe0YJl/exec';
  

  const form = doc.querySelector('.form-card form') || doc.querySelector('form.form-card');
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

  // Form Submit Handler for Google Sheets
  if(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // 폼 데이터 수집
      const formData = {
        studentName: doc.getElementById('studentName')?.value || '',
        gender: doc.querySelector('input[name="gender"]:checked')?.value || '',
        grade: doc.getElementById('grade')?.value || '',
        mobile: doc.getElementById('mobile')?.value || '',
        kakao: doc.getElementById('kakao')?.value || '',
        email: doc.getElementById('email')?.value || '',
        country: doc.getElementById('country')?.value || '',
        interests: Array.from(doc.querySelectorAll('input[name="interest"]:checked')).map(cb => cb.value),
        message: doc.getElementById('message')?.value || '',
        timestamp: new Date().toISOString(),
        language: doc.documentElement.lang || 'ko'
      };
      
      // 개인정보 동의 확인
      const agreeCheck = doc.getElementById('agree');
      if(!agreeCheck || !agreeCheck.checked) {
        const isKorean = doc.documentElement.lang === 'ko' || !doc.documentElement.lang;
        alert(isKorean ? '개인정보 취급방침에 동의해주세요.' : 'Please agree to the privacy policy.');
        return;
      }
      
      // 필수 필드 검증
      if(!formData.studentName || !formData.grade) {
        const isKorean = doc.documentElement.lang === 'ko' || !doc.documentElement.lang;
        alert(isKorean ? '필수 항목을 모두 입력해주세요.' : 'Please fill in all required fields.');
        return;
      }
      
      // 로딩 상태 표시
      const submitBtn = form.querySelector('.btn-submit') || form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      const isKorean = doc.documentElement.lang === 'ko' || !doc.documentElement.lang;
      submitBtn.disabled = true;
      submitBtn.textContent = isKorean ? '전송 중...' : 'Sending...';
      
      try {
        // Check if Google Script URL is configured
        if(GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
          console.warn('Google Apps Script URL is not configured. Form data:', formData);
          alert(isKorean ? 
            '현재 시스템 설정 중입니다. 잠시 후 다시 시도해주세요.\n\n문의사항은 카카오톡으로 연락 주시기 바랍니다.' : 
            'The system is currently being set up. Please try again later.\n\nFor inquiries, please contact us via KakaoTalk.');
          return;
        }

        // Google Sheets로 데이터 전송
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // CORS 우회
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 간주
        alert(isKorean ? 
          '상담 신청이 완료되었습니다.\n빠른 시일 내에 연락드리겠습니다.\n\n감사합니다.' : 
          'Your consultation request has been submitted.\nWe will contact you soon.\n\nThank you.');
        
        // 폼 리셋
        form.reset();
        if(charNow) charNow.textContent = '0';
        
        // 선택적: 페이지 리다이렉트
        // setTimeout(() => {
        //   window.location.href = isKorean ? '/index.html' : '/index_en.html';
        // }, 2000);
        
      } catch(error) {
        console.error('Error submitting form:', error);
        alert(isKorean ? 
          '전송 중 오류가 발생했습니다.\n다시 시도해주세요.\n\n지속적으로 문제가 발생하면 카카오톡으로 문의해주세요.' : 
          'An error occurred while sending.\nPlease try again.\n\nIf the problem persists, please contact us via KakaoTalk.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
})();
