# Run with Docker (Dev)

1) env 파일 생성
# 백엔드
Copy-Item backend/app/.env.example backend/app/.env

# 프론트엔드
Copy-Item frontend/app/.env.example frontend/app/.env


2) .env
frontend/app/.env
VITE_API_BASE=http://localhost:5001
VITE_KAKAO_JS_KEY=여기에_카카오_Javascript_키

backend/app/.env
NODE_ENV=development
PORT=5001


3) 실행
docker compose down
docker compose build frontend --no-cache
docker compose up

- 프론트앤드 http://localhost:5173
- 백앤드:  http://localhost:5001


4) 오류 나는 경우

- 프론트에서 API 호출이 404/CORS
- 카카오 지도 SDK 에러
- 포트 충돌

docker compose build --no-cache
docker compose up
