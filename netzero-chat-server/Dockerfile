FROM node:18-alpine AS development

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3004
CMD ["npm", "run", "dev"]

FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install dependencies for better caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.CHAT_PORT || 3004) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
