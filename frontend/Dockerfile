FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY . .
FROM base AS build
RUN npm run build
FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.next .next
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/public public
COPY --from=build /app/package.json ./
EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED 1
CMD ["npm", "start"]
