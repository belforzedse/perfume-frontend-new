# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

#  Define build-time envs (used by Next.js)
ARG NEXT_PUBLIC_STRAPI_URL
ARG NEXT_PUBLIC_STRAPI_TOKEN
ENV NEXT_PUBLIC_STRAPI_URL=${NEXT_PUBLIC_STRAPI_URL}
ENV NEXT_PUBLIC_STRAPI_TOKEN=${NEXT_PUBLIC_STRAPI_TOKEN}
ENV NODE_ENV=production

#  Build app (these envs are injected here)
RUN npm run build


# ---------- Stage 2: Run ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Copy the built app
COPY --from=builder /app ./

# Expose port 3000
EXPOSE 3000

#  Runtime environment 
ENV NODE_ENV=production

CMD ["npm", "start"]
