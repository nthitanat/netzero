FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
COPY .npmrc ./
RUN npm ci
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
