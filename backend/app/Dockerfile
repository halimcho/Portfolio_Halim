FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
ENV NODE_ENV=development PORT=5001
EXPOSE 5001
CMD ["npm","run","dev"]
