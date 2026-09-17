FROM node:18-alpine

WORKDIR /app

# Install OpenSSL agar Prisma Client kompatibel dengan Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

# Salin seluruh file project termasuk folder prisma
COPY . .

# Generate Prisma Client secara otomatis saat build Docker
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "dev"]