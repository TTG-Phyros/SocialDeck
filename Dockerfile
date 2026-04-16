FROM node:22-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

FROM base AS deps

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=builder /app/.next ./.next
RUN npm run prisma:generate

EXPOSE 3000

CMD ["npm", "run", "start"]
