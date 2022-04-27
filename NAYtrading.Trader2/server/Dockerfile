FROM node:lts
WORKDIR /server
COPY package.json package-lock.json /server/
RUN npm ci


COPY . /server
RUN npm run build
EXPOSE 4010
ENV NODE_ENV=production
CMD [ "npm", "run", "start:prod" ]


