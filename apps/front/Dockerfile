# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy front app
COPY apps/front ./apps/front

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
RUN cd apps/front && pnpm build

# Use nginx to serve static files
FROM nginx:alpine

# Copy built files to nginx
COPY --from=0 /app/apps/front/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD nginx -g 'daemon off;'
