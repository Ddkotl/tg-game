FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace/root configuration files
COPY pnpm-lock.yaml pnpm-workspace.yaml turbo.json package.json ./

# Copy all app files
COPY apps ./apps

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd apps/back && pnpm prisma generate

# Build the backend app
WORKDIR /app/apps/back
RUN pnpm build

# Prune production dependencies
WORKDIR /app
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/back

EXPOSE 3000

CMD ["node", "dist/main"]
