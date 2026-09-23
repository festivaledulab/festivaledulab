# 페스티벌교육연구소 홈페이지

정적 HTML, CSS, JavaScript로 만든 반응형 홈페이지입니다. 모든 소스는 이 폴더 안에 있습니다. 메뉴마다 독립된 HTML 페이지를 두고, 이동할 때는 같은 탭에서 본문만 바꿉니다. 각 주소를 직접 열거나 새로고침해도 해당 페이지가 열립니다.

## 페이지 구조

| 메뉴 | 관리할 파일 | 주소 |
| --- | --- | --- |
| 홈 | `home/index.html` | `/home/` |
| 연구소 소개 | `about/index.html` | `/about/` |
| 교육 안내 | `programs/index.html` | `/programs/` |
| 교육 방식 | `approach/index.html` | `/approach/` |
| 교육 문의 | `contact/index.html` | `/contact/` |

공통 디자인은 `styles.css`, 메뉴 전환과 문의 폼 동작은 `site.js`에서 관리합니다. `index.html`은 루트 주소를 홈 페이지로 연결합니다.

## 로컬에서 보기

이 폴더에서 다음 명령을 실행하세요.

```powershell
node serve.mjs
```

이후 `http://localhost:8000`을 열면 홈 페이지로 이동합니다. 폴더별 페이지 주소도 직접 열 수 있습니다.

## 공개 전 확인할 내용

1. `about/index.html`과 `programs/index.html`의 설명을 실제 운영 내용에 맞게 확인하세요. 현재 문구는 확정된 과정·실적을 주장하지 않는 초안입니다.
2. `site.js`의 `INQUIRY_CONFIG.email`에 공식 이메일을 넣으면 문의 버튼이 이메일 앱을 엽니다. 접수용 API가 있다면 `formEndpoint`를 설정하면 문의가 해당 주소로 전송됩니다. 두 값이 모두 비어 있으면 제출 내용 복사만 가능합니다.
3. 실제 개인정보 보관 및 처리 방식에 따라 `contact/index.html`의 개인정보 안내 문구를 갱신하세요.
4. 대표 이미지, 로고, 사업자 정보가 있다면 공식 자료로 교체하거나 추가하세요.

외부 라이브러리는 사용하지 않습니다. 글꼴은 Google Fonts를 사용하며 연결되지 않을 때 시스템 글꼴로 표시됩니다.
