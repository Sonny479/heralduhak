// todo : header 및 footer 불러오기 JS 
function includeHTML() {

  const headerPath = '/views/common/header.html';
  const footerPath = '/views/common/footer.html';
  const enheaderPath = '/views/common/en_header.html';
  const enfooterPath = '/views/common/en_footer.html';

  // header 먼저 불러오기
  fetch(headerPath)
    .then(res => res.text())
    .then(data => {
      document.getElementById('header').innerHTML = data;
      initNav(); // ← header 로드가 끝난 뒤 실행
    })
  .catch(err => console.error('header 불러오기 실패:', err));

  // footer는 순서 상관없음
  fetch(footerPath)
    .then(res => res.text())
    .then(data => document.getElementById('footer').innerHTML = data)
  .catch(err => console.error('footer 불러오기 실패:', err));

  // en_header 먼저 불러오기
  fetch(enheaderPath)
    .then(res => res.text())
    .then(data => {
      document.getElementById('en_header').innerHTML = data;
      initNav(); // ← header 로드가 끝난 뒤 실행
    })
  .catch(err => console.error('en_header 불러오기 실패:', err));

  // en_footer는 순서 상관없음
  fetch(enfooterPath)
    .then(res => res.text())
    .then(data => document.getElementById('en_footer').innerHTML = data)
  .catch(err => console.error('en_footer 불러오기 실패:', err));
}