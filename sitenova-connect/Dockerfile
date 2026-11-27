FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY public ./public
COPY server ./server
USER node
EXPOSE 3000
CMD ["node", "server/app.js"]
