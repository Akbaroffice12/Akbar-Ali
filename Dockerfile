# Base image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev tools needed for build)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Vite frontend targeting the /dist directory
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies required to run the server
RUN npm ci

# Copy server files and built frontend
COPY --from=builder /app/dist ./dist
COPY server.ts ./
COPY firebase-applet-config.json ./

# Expose port (your server.ts uses 3000)
EXPOSE 3000

# Set Node environment to production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
