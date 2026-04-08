# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy back app
COPY apps/back ./apps/back

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
RUN cd apps/back && pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD cd apps/back && pnpm start:prod
