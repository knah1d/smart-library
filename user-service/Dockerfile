FROM node:lts-alpine3.21
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8081 8082 8083 8084
CMD ["npm", "start"]