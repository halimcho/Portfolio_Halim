FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
ENV HOST=0.0.0.0 PORT=5173
EXPOSE 5173
CMD ["npm","run","dev"]
