포트폴리오 만들기~

1. 프로젝트 기획서 및 요구사항 명세서

프로젝트 개요
본 프로젝트는 개인 포트폴리오 웹사이트로, 단순한 소개 페이지를 넘어 외부 API 연동과 풀스택 기능을 포함하여 개발 역량을 보여줄 수 있도록 기획되었습니다.

주요 특징:
- GitHub API 연동 → 최신 프로젝트 저장소 자동 표시
- Kakao Maps API 연동 → 지도 기반 기능 추가 (좌표 → 주소 변환, 검색)
- Contact Form + DB 연동 → 방문자가 메시지를 남기면 서버에서 저장 처리
- 다국어 지원 (한국어/영어), 다크 모드 지원, 반응형 UI

요구사항 정리
- 포트폴리오 페이지 구성: 소개, 기술 스택, 프로젝트, 연락처 등 
- GitHub 연동: 최신 6개 프로젝트 자동 가져오기  
- Kakao Maps 연동: 지도 + 위치 기반 정보 (주소 변환, 검색)
- 장소 상세 정보: 지도에서 특정 건물이나 시설 클릭 시 상세 정보(주소, 전화번호, 링크 등) 표시  
- Contact Form: 서버 DB에 메시지 저장 
- 검색 기록: 최근 검색어 표시 및 다시 선택 가능  
- 다국어 지원: 한국어 / 영어 지원  
- 다크 모드 지원: Tailwind 기반 낮/밤 모드 

----------------

2. 풀스택 웹 애플리케이션 소스 코드 및 실행 가능한 서비스 URL

기술 구성
- Frontend (Netlify 배포)
  - React + Vite + TypeScript → 컴포넌트 기반 개발, 빠른 빌드
  - TailwindCSS → 반응형 UI와 다크 모드 지원  

- Backend (Render 배포)
  - Node.js + Express → 간단하고 확장 가능한 API 서버  
  - Kakao Maps API 연동 → 장소 검색 및 좌표 변환  
  - GitHub API 연동 → 최신 저장소 가져오기

- Infra (인프라)
  - Docker → 개발/배포 환경 통일  
  - Netlify (프론트 배포)  
  - Render (백엔드 배포)  

실행 가능한 URL
- 개발 환경: [http://localhost:5173](http://localhost:5173)  
- 배포 (프론트) URL: https://halimgoormportfolio.netlify.app/
- 배포 (백엔드) URL: https://portfolio-halim.onrender.com
----------------

3. 기술 스택 선정 이유와 아키텍처 설계

기술 스택 선정 이유
- React + Vite: 빠른 빌드 속도, 최적화된 빌드 속도
- TypeScript: 타입 안전성을 통해 오류를 줄이고 코드 가독성 향상  
- Express (Node.js): 간단하고 확장 가능한 API 서버
- Kakao Maps API: 한국 서비스에 최적화, 장소 검색 및 지도 표시 용이  
- GitHub API: 최신 프로젝트 자동 동기화
- Docker: 어디서든 동일하게 실행되는 환경 제공  
- Netlify / Render: 무료 배포 가능, CI/CD 지원  

아키텍처 구조
Project
┣  frontend (React, Vite, Tailwind)
┃ ┗  client/src/components (HeroSection, KakaoMap, Navigation 등)
┣  backend (Express 서버)
┃ ┗  routes (GitHub, Kakao, Contact API) -> API 루트
┣  docs (문서 및 발표자료)
┗ docker-compose.yml


----------------


4. 개발 과정 기록 및 문제 해결

주요 개발 과정
- 프로젝트 초기 기획 및 와이어프레임 설계  
- 포트폴리오 기본 섹션 구현 (소개, 기술, 프로젝트, 연락처)
- Kakao Maps API 연동으로 지도 표시 및 좌표 → 주소 변환 기능 구현
- Contact Form을 통해 서버 DB 저장 구현
- GitHub API 연동으로 최신 프로젝트 자동 표시
- UI 개선: 다크 모드, 반응형, 접근성(ARIA 속성)  
- Docker 기반 개발 환경 통일  
- 다국어 지원 및 다크 모드 UI 개선
- 배포 테스트 (Netlify + Render)  

문제 해결:
- 문제 1: 위치 권한 거부 시 지도 기능이 동작하지 않음  
  - 해결: 에러 메시지 표시 ("현재 위치를 가져올 수 없습니다. 브라우저 권한을 확인해주세요")  

- 문제 2: 지도를 클릭해도 내가 원하는 건물이 아닌 주변 시설이 선택됨  
  - 해결: 클릭 좌표 기준으로 가장 가까운 장소를 거리순으로 정렬 후 첫 번째 장소만 표시  

- 문제 3: 검색 반경이 너무 짧아 전국 검색 불가  
  - 해결: 반경 0 = 전국 전체 옵션 추가  

- 문제 4: 다크 모드에서 글씨 가독성 저하  
  - 해결: TailwindCSS의 dark: 속성을 적극 활용하여 대비 강화  

- 문제 5: Render에서 GitHub API fetch 실패
  - 해결: GITHUB_TOKEN을 Render 환경변수에 등록, Authorization 헤더 추가

- 문제 6: Kakao Map이 무한 로딩되는 문제
  - 해결: Helmet CSP에 daumcdn.net, kakaocdn.net 추가

- 문제 7: 지도 로드 시 API 키 누락 문제
  - 해결: VITE_KAKAO_JS_KEY를 Netlify 환경변수에 등록하여 프론트에서 로드

- 문제 8: .env 노출 위험
  - 해결: .gitignore에 .env 추가, Netlify/Render 환경변수 대시보드에서만 관리


----------------


5. 서비스 배포 및 운영 관련 문서

배포 과정
1. 프론트엔드(Netlify):
  배포 트리거: GitHub push 시 자동 빌드/배포
   - npm run build 후 Netlify에 자동 배포 (Publish directory: frontend/app/client_dist (프로젝트 구조에 맞게))
   - 환경변수(VITE_API_BASE_URL, VITE_KAKAO_JS_KEY)는 Netlify 대시보드에서 관리

3. 백엔드(Render):  
   - 서비스 타입: Web Service (Node)
   - Build Command: npm ci --include=dev && npm run build 또는 NPM_CONFIG_PRODUCTION=false npm ci && npm run build
   - Start Command: npm run start (package.json → node dist/index.js)
   - 환경변수(GITHUB_TOKEN, KAKAO_API_KEY,PORT=5001, GITHUB_USERNAME)는 Render 대시보드에서 관리
   - 서버 코드 권장 설정 (app.set('trust proxy', 1) (프록시 환경에서 rate-limit/XFF 이슈 방지) -> Helmet CSP에 daumcdn.net, kakaocdn.net 허용 유지
     
4. 로컬 개발:  
   - docker-compose up --build → 로컬 환경에서 동시에 실행  

운영 방법
- 에러 로그 확인: docker logs backend 또는 Render/Netlify 콘솔
- 환경 변수 관리: Render/Netlify 환경 탭에서 관리
- 서비스 점검: /healthz 엔드포인트로 확인

----------------


영상에서는  
1. 포트폴리오 소개 섹션
2. GitHub 최신 프로젝트 자동 표시
3. Kakao Maps 연동 (좌표 변환)
4. Contact Form 제출 성공
5. 다국어 전환, 다크 모드

등의 기능을 실제로 보여줍니다.  

----------------

결론
이 프로젝트는 단순한 포트폴리오 페이지를 넘어 API 연동, 서버-클라이언트 구조, 배포 경험까지 담고 있습니다.

- 기획 단계에서 문제 정의 → 요구사항 명세 과정을 경험했고,  
- 개발 단계에서 프론트엔드, 백엔드, 배포를 모두 다뤄보며 풀스택 경험을 쌓았으며,  
- 문제 해결 과정에서 코드 디버깅, API 활용, 배포 환경 세팅등 실질적인 역량을 길렀습니다 + 환경변수 보안 관리!

이 프로젝트를 통해 얻은 가장 큰 성과는 “자신의 역량을 실제 서비스로 구현한 포트폴리오”입니다.  
