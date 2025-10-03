# Dockerfile for Node.js Express App (written by Deepika)
# Author: Deepika

# Use official Node.js 16 Alpine image for smaller size and security
FROM node:16-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy only package manifests first for better build cache
COPY package*.json ./

# Install only production dependencies for smaller image
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose the port the app will listen on
EXPOSE 4000

# Start the application
CMD ["node", "app.js"]
