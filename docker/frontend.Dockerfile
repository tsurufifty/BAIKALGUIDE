# ---- Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public build-time vars must be present at build (baked into the bundle)
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STRAPI_URL
ARG NEXT_PUBLIC_STRAPI_IMAGE_HOST
ARG NEXT_PUBLIC_YANDEX_MAPS_API_KEY
RUN npm run build

# ---- Runtime (standalone) ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
