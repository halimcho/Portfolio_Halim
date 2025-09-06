# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app

COPY frontend/app/package.json frontend/app/package-lock.json ./frontend/app/
COPY backend/app/package.json  backend/app/package-lock.json  ./backend/app/

WORKDIR /app/frontend/app
RUN npm ci
WORKDIR /app/backend/app
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app /app

COPY frontend/app ./frontend/app
COPY backend/app  ./backend/app

ARG VITE_KAKAO_JS_KEY
ENV VITE_KAKAO_JS_KEY=$VITE_KAKAO_JS_KEY

WORKDIR /app/frontend/app
RUN npm run build

WORKDIR /app/backend/app
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=5001

COPY --from=build /app/backend/app/dist ./dist
COPY --from=build /app/backend/app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/frontend/app/client_dist ./client_dist

EXPOSE 5001
CMD ["node", "dist/index.js"]
