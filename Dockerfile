# 1. Базовый образ
FROM node:24-alpine AS base

# 2. Установка зависимостей
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем package.json (если используешь npm)
COPY package.json package-lock.json* ./
# Если используешь yarn, раскомментируй строку ниже и закомментируй верхнюю
# COPY package.json yarn.lock* ./

# Устанавливаем зависимости
RUN npm ci
# RUN yarn install --frozen-lockfile

# 3. Сборка (Builder)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# !!! ВАЖНО: Передаем ключи Supabase, чтобы билд не падал !!!
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Собираем проект
RUN npm run build
# RUN yarn build

# 4. Запуск (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем только то, что нужно для запуска (Result of Standalone build)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Запускаем сервер Node.js (А НЕ NGINX!)
CMD ["node", "server.js"]