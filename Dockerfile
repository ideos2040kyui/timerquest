FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN [ -f userdata.json ] || echo '{"users":[]}' > userdata.json
RUN chmod 666 userdata.json
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start" ]
