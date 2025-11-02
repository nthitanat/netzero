# Multi-stage build for React application

# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Accept build arguments for environment variables
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_CHAT_API_BASE_URL
ARG REACT_APP_USE_REAL_TREE_API
ARG REACT_APP_TREE_IMAGES_BASE_URL
ARG REACT_APP_ENABLE_API_LOGGING

# Set environment variables from build args
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_CHAT_API_BASE_URL=$REACT_APP_CHAT_API_BASE_URL
ENV REACT_APP_USE_REAL_TREE_API=$REACT_APP_USE_REAL_TREE_API
ENV REACT_APP_TREE_IMAGES_BASE_URL=$REACT_APP_TREE_IMAGES_BASE_URL
ENV REACT_APP_ENABLE_API_LOGGING=$REACT_APP_ENABLE_API_LOGGING

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application (environment variables will be embedded)
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
