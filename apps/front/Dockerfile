# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace/root configuration files
COPY pnpm-lock.yaml pnpm-workspace.yaml turbo.json package.json ./

# Copy frontend app files
COPY apps/front ./apps/front

# Install only frontend dependencies
RUN pnpm install --frozen-lockfile --filter front

# Build the frontend app
WORKDIR /app/apps/front
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/apps/front/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
