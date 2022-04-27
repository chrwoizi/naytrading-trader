FROM node:lts as builder
WORKDIR /client
COPY package.json package-lock.json /client/
RUN npm ci
# Skips NPM INSTALL if nothing changed!

COPY . /client
RUN npm run build



FROM nginx:latest

COPY --from=builder /client/dist /usr/share/nginx/html
COPY --from=builder /client/nginx.conf /etc/nginx/conf.d/default.conf

