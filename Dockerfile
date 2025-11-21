# Use official Node image
FROM node:24-alpine

# Install PM2 globally
RUN npm install -g pm2

# Create app directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build TypeScript project
RUN npm run build

# Expose application port
EXPOSE 3004

# Start the application using pm2-runtime
CMD ["pm2-runtime", "start", "build/server.js", "--name", "app"]
