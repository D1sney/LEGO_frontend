#Dockerfile
FROM node:lts-alpine as builder

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# Устанавливаем переменную окружения для Vue приложения
ARG VUE_APP_API_URL=https://lego-collector.ru/api
ENV VUE_APP_API_URL=$VUE_APP_API_URL

RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
