FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build-time environment variables for Next.js
ARG NEXT_PUBLIC_STRAPI_URL
ARG NEXT_PUBLIC_STRAPI_TOKEN
ENV NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL
ENV NEXT_PUBLIC_STRAPI_TOKEN=$NEXT_PUBLIC_STRAPI_TOKEN
ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
