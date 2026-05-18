# ────────────────────────────────────────────────
# Backend Dockerfile (Node.js / Express)
# ────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
