# Google Sheets 상담 신청 연동 설정 가이드

## 📋 개요
이 가이드는 Herald Uhak 웹사이트의 상담 신청 폼을 Google Sheets와 연동하는 방법을 설명합니다.

## 🚀 설정 단계

### 1단계: Google Sheets 문서 생성
1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 제목을 "Herald Uhak 상담 신청" 등으로 변경

### 2단계: Apps Script 설정
1. Google Sheets 문서에서 **확장 프로그램** → **Apps Script** 클릭
2. 기본 코드 모두 삭제
3. `google_apps_script.gs` 파일의 내용 전체를 복사하여 붙여넣기
4. **Ctrl+S** (Mac: Cmd+S)로 저장
5. 프로젝트 이름을 "Herald Uhak Form Handler" 등으로 변경

### 3단계: 웹 앱 배포
1. Apps Script 에디터에서 **배포** → **새 배포** 클릭
2. 설정:
   - **유형**: 웹 앱
   - **설명**: Herald Uhak Form Handler v1.0
   - **실행 계정**: 나 (본인 계정)
   - **액세스 권한**: **모든 사용자** ⚠️ 중요!
3. **배포** 버튼 클릭
4. 권한 요청이 나타나면:
   - **액세스 권한 부여** 클릭
   - Google 계정 선택
   - "안전하지 않은 페이지로 이동" 클릭 (고급 옵션)
   - **허용** 클릭

### 4단계: URL 복사 및 적용
1. 배포 완료 후 **웹 앱 URL** 복사
   - 예시: `https://script.google.com/macros/s/AKfyc.../exec`
2. `assets/js/app.js` 파일 열기
3. `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` 부분을 복사한 URL로 교체:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfyc.../exec';
   ```
4. 파일 저장

### 5단계: 테스트
1. 웹사이트의 상담 신청 페이지 접속
2. 테스트 데이터 입력:
   - 학생 이름: 테스트
   - 성별: 선택
   - 현재 학년: G10
   - 카카오 ID: test_kakao
   - 관심 프로그램: 1-2개 선택
   - 문의내용: 테스트 메시지
   - 개인정보 동의: 체크
3. **상담예약 제출하기** 클릭
4. Google Sheets 확인하여 데이터 저장 확인

## 📊 Google Sheets 데이터 구조

자동으로 생성되는 열:
- **제출 시간**: ISO 형식 타임스탬프
- **학생 이름**: 입력된 이름
- **성별**: 남자/여자
- **현재 학년**: G1-G12, Post Secondary
- **모바일 연락처**: 캐나다 전화번호
- **카카오 ID**: 카카오톡 ID
- **이메일**: 이메일 주소
- **거주국가**: 거주 국가
- **관심 프로그램**: 선택된 프로그램 (최대 2개)
- **문의내용**: 상세 문의 내용
- **언어**: ko(한국어) / en(영어)

## 🔧 추가 설정 (선택사항)

### 이메일 알림 설정
1. `google_apps_script.gs` 파일의 `sendEmailNotification` 함수에서:
2. `notificationEmail` 변수를 실제 이메일 주소로 변경
3. 주석 처리된 `MailApp.sendEmail` 부분의 주석 해제
4. Apps Script에서 다시 배포

### Google Sheets 자동 서식 설정
1. Google Sheets에서 첫 번째 행 선택
2. **서식** → **텍스트 줄 바꿈** → **줄 바꿈**
3. 헤더 행에 배경색 설정
4. 필터 추가: **데이터** → **필터 만들기**

## 🐛 문제 해결

### "CORS 에러" 발생 시
- `mode: 'no-cors'`가 설정되어 있는지 확인
- Apps Script 배포 시 "모든 사용자" 권한 확인

### 데이터가 저장되지 않을 때
1. Apps Script URL이 정확한지 확인
2. Google Sheets 권한 확인 (편집 권한 필요)
3. 브라우저 콘솔에서 에러 메시지 확인

### 테스트 방법
1. Apps Script 에디터에서 `testFunction` 실행
2. 실행 로그 확인: **보기** → **실행 로그**

## 📝 유지보수

### Apps Script 코드 업데이트 시
1. 코드 수정 후 저장
2. **배포** → **배포 관리**
3. **편집** 클릭 → **버전**: 새 버전
4. **배포** 클릭

### 백업 권장사항
- Google Sheets 정기적 백업
- Apps Script 코드 로컬 백업 유지
- 월별 데이터 다운로드 및 보관

## 📞 지원

문제 발생 시:
- 기술 지원: [개발팀 연락처]
- 문서 업데이트: [날짜]
- 버전: 1.0.0

## ✅ 체크리스트

- [ ] Google Sheets 생성
- [ ] Apps Script 코드 복사 및 저장
- [ ] 웹 앱 배포 및 권한 설정
- [ ] URL을 app.js에 적용
- [ ] 테스트 제출 완료
- [ ] Google Sheets에 데이터 확인
- [ ] 이메일 알림 설정 (선택)
- [ ] 백업 계획 수립

---
작성일: 2024년 10월
버전: 1.0.0
