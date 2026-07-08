FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production=false

COPY . .
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_APP_ENV=production
ARG VITE_SUPPORT_EMAIL=arfan2173@gmail.com
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
