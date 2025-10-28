// Google Apps Script 코드
// 이 코드를 Google Sheets의 Apps Script에 붙여넣으세요
// 사용 방법:
// 1. Google Sheets 문서 생성
// 2. 확장 프로그램 → Apps Script 열기
// 3. 이 코드 전체를 복사하여 붙여넣기
// 4. 저장 (Ctrl+S 또는 Cmd+S)
// 5. 배포 → 새 배포 → 웹 앱 → 액세스 권한: 모든 사용자 → 배포
// 6. 배포 후 받은 URL을 app.js의 GOOGLE_SCRIPT_URL에 입력

function doPost(e) {
  try {
    // 스프레드시트와 시트 가져오기
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // POST 데이터 파싱
    const data = JSON.parse(e.postData.contents);
    
    // 첫 번째 행에 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      const headers = [
        '제출 시간',
        '학생 이름',
        '성별',
        '현재 학년',
        '모바일 연락처',
        '카카오 ID',
        '이메일',
        '거주국가',
        '관심 프로그램',
        '문의내용',
        '언어'
      ];
      sheet.appendRow(headers);
      
      // 헤더 스타일링 (선택사항)
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f0f0f0');
    }
    
    // 관심 프로그램 배열을 문자열로 변환
    const interestsStr = Array.isArray(data.interests) ? data.interests.join(', ') : '';
    
    // 프로그램 이름 매핑 (한국어/영어 페이지 모두 지원)
    const programNames = {
      // 한국어 페이지 값
      'early': '조기유학',
      'tutoring': '튜터링',
      'transfer': '대학편입',
      'other': '기타',
      
      // 영어 페이지 값
      'Tuition': 'Tuition-Free Public Schools (무상 공립학교)',
      'Catholic': 'Catholic Private Schools (천주교 사립학교)',
      'Guardianship': 'Guardianship Program (관리형 유학)',
      'Academic': 'Academic Tutoring (아카데믹 튜터링)',
      'University': 'Adult Study Programs (성인유학 프로그램)'
    };
    
    // 언어에 따라 프로그램 이름 변환
    const interestsFormatted = Array.isArray(data.interests) 
      ? data.interests.map(item => programNames[item] || item).join(', ')
      : '';
    
    // 성별 표시 (모든 언어에서 M/F로 통일)
    const genderFormatted = data.gender || '';
    
    // 새 행 추가
    const newRow = [
      data.timestamp || new Date().toISOString(),  // 제출 시간
      data.studentName || '',                       // 학생 이름
      genderFormatted,                              // 성별 (M/F)
      data.grade || '',                             // 현재 학년
      data.mobile || '',                            // 모바일 연락처
      data.kakao || '',                             // 카카오 ID
      data.email || '',                             // 이메일
      data.country || '',                           // 거주국가
      interestsFormatted || interestsStr,           // 관심 프로그램
      data.message || '',                           // 문의내용
      data.language || 'ko'                         // 언어
    ];
    
    sheet.appendRow(newRow);
    
    // 새로 추가된 행 포맷팅 (선택사항)
    const lastRow = sheet.getLastRow();
    const newRowRange = sheet.getRange(lastRow, 1, 1, newRow.length);
    
    // 긴 텍스트 필드는 자동 줄바꿈 설정
    sheet.getRange(lastRow, 9).setWrap(true);  // 관심 프로그램
    sheet.getRange(lastRow, 10).setWrap(true); // 문의내용
    
    // 이메일 알림 전송 (선택사항)
    sendEmailNotification(data);
    
    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data saved successfully',
        rowNumber: lastRow
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    console.error('Error in doPost:', error);
    
    // 오류 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Failed to save data'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 처리 (테스트용)
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'API is working',
      message: 'Herald Uhak Consultation Form API',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 이메일 알림 함수 (선택사항)
function sendEmailNotification(data) {
  try {
    // 알림 받을 이메일 주소 설정
    const notificationEmail = 'admin@heralduhak.com'; // 실제 이메일 주소로 변경하세요
    
    // 프로그램 이름 매핑
    const programNames = {
      // 한국어 페이지 값
      'early': '조기유학',
      'tutoring': '튜터링',
      'transfer': '대학편입',
      'other': '기타',
      
      // 영어 페이지 값
      'Tuition': 'Tuition-Free Public Schools',
      'Catholic': 'Catholic Private Schools',
      'Guardianship': 'Guardianship Program',
      'Academic': 'Academic Tutoring',
      'University': 'Adult Study Programs'
    };
    
    const interests = Array.isArray(data.interests) 
      ? data.interests.map(item => programNames[item] || item).join(', ')
      : '없음';
    
    // 언어에 따른 이메일 제목 및 본문
    const isEnglish = data.language === 'en';
    
    // 이메일 제목
    const subject = isEnglish 
      ? `[New Consultation] ${data.studentName} - ${data.grade}`
      : `[새 상담 신청] ${data.studentName} - ${data.grade}`;
    
    // 이메일 본문 (성별 표시도 M/F로 통일)
    const body = isEnglish ? `
New consultation request received.

━━━━━━━━━━━━━━━━━━━━━━━━
【 Student Information 】
━━━━━━━━━━━━━━━━━━━━━━━━
• Name: ${data.studentName}
• Gender: ${data.gender}
• Grade: ${data.grade}

━━━━━━━━━━━━━━━━━━━━━━━━
【 Contact Information 】
━━━━━━━━━━━━━━━━━━━━━━━━
• Mobile: ${data.mobile || 'Not provided'}
• KakaoTalk ID: ${data.kakao || 'Not provided'}
• Email: ${data.email || 'Not provided'}
• Country: ${data.country || 'Not provided'}

━━━━━━━━━━━━━━━━━━━━━━━━
【 Consultation Details 】
━━━━━━━━━━━━━━━━━━━━━━━━
• Programs of Interest: ${interests}
• Message:
${data.message || 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━
• Submitted: ${new Date(data.timestamp).toLocaleString('en-US', {timeZone: 'America/Vancouver'})} (Vancouver Time)
• Language: English

Please check Google Sheets for complete data.
    ` : `
새로운 상담 신청이 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━
【 학생 정보 】
━━━━━━━━━━━━━━━━━━━━━━━━
• 이름: ${data.studentName}
• 성별: ${data.gender}
• 학년: ${data.grade}

━━━━━━━━━━━━━━━━━━━━━━━━
【 연락처 정보 】
━━━━━━━━━━━━━━━━━━━━━━━━
• 모바일: ${data.mobile || '미입력'}
• 카카오ID: ${data.kakao || '미입력'}
• 이메일: ${data.email || '미입력'}
• 거주국가: ${data.country || '미입력'}

━━━━━━━━━━━━━━━━━━━━━━━━
【 상담 내용 】
━━━━━━━━━━━━━━━━━━━━━━━━
• 관심 프로그램: ${interests}
• 문의내용:
${data.message || '없음'}

━━━━━━━━━━━━━━━━━━━━━━━━
• 접수 시간: ${new Date(data.timestamp).toLocaleString('ko-KR', {timeZone: 'America/Vancouver'})} (밴쿠버 시간)
• 언어: 한국어

Google Sheets에서 전체 데이터를 확인하세요.
    `;
    
    // 이메일 전송 (주석 해제하여 사용)
    // MailApp.sendEmail({
    //   to: notificationEmail,
    //   subject: subject,
    //   body: body
    // });
    
  } catch(error) {
    console.error('Error sending email notification:', error);
    // 이메일 전송 실패해도 데이터 저장은 계속 진행
  }
}

// 테스트 함수 (Apps Script 에디터에서 직접 실행 가능)
function testFunction() {
  // 한국어 페이지 테스트
  const testDataKorean = {
    postData: {
      contents: JSON.stringify({
        studentName: '홍길동',
        gender: 'M',
        grade: 'G10',
        mobile: '778-123-4567',
        kakao: 'test_kakao',
        email: 'test@example.com',
        country: '캐나다',
        interests: ['early', 'tutoring'],
        message: '한국어 테스트 메시지입니다.',
        timestamp: new Date().toISOString(),
        language: 'ko'
      })
    }
  };
  
  // 영어 페이지 테스트
  const testDataEnglish = {
    postData: {
      contents: JSON.stringify({
        studentName: 'John Doe',
        gender: 'M',
        grade: 'Grade 10',
        mobile: '778-987-6543',
        kakao: 'test_kakao_en',
        email: 'test_en@example.com',
        country: 'Canada',
        interests: ['Tuition', 'Academic'],
        message: 'English test message.',
        timestamp: new Date().toISOString(),
        language: 'en'
      })
    }
  };
  
  console.log('Korean form test:');
  const resultKorean = doPost(testDataKorean);
  console.log(resultKorean.getContent());
  
  console.log('English form test:');
  const resultEnglish = doPost(testDataEnglish);
  console.log(resultEnglish.getContent());
}
