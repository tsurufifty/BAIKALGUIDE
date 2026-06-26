# ---- Build stage ----
FROM node:20-alpine AS build
RUN apk add --no-cache build-base python3 vips-dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
RUN apk add --no-cache vips
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app ./
EXPOSE 1337
CMD ["npm", "run", "start"]
