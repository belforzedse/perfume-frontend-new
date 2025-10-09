This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx` and the components. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment configuration

The frontend makes authenticated requests to a Strapi backend. Provide the following environment variables whenever you run `npm run build`, `npm start`, or the Docker image so that both the static Next.js bundle and the runtime API calls point to the same backend:

```bash
NEXT_PUBLIC_STRAPI_URL=<https://your-strapi-host>
NEXT_PUBLIC_STRAPI_TOKEN=<public-api-token>
```

For local development you can create a `.env` file in the project root with these keys. The provided `docker-compose.yml` automatically loads `.env` values and passes them to the build so the generated bundle and runtime environment stay aligned.

When building the Docker image manually, pass the values as build arguments and runtime environment variables:

```bash
docker build \
  --build-arg NEXT_PUBLIC_STRAPI_URL="$NEXT_PUBLIC_STRAPI_URL" \
  --build-arg NEXT_PUBLIC_STRAPI_TOKEN="$NEXT_PUBLIC_STRAPI_TOKEN" \
  -t perfume-frontend .

docker run -p 3000:3000 \
  -e NEXT_PUBLIC_STRAPI_URL="$NEXT_PUBLIC_STRAPI_URL" \
  -e NEXT_PUBLIC_STRAPI_TOKEN="$NEXT_PUBLIC_STRAPI_TOKEN" \
  perfume-frontend
```

## Docker Compose

Create a `.env` file in the project root and set `NEXT_PUBLIC_STRAPI_URL` and `NEXT_PUBLIC_STRAPI_TOKEN` (you can copy from an existing example file if you maintain one). Then run:

```bash
docker compose up --build
```

The compose file forwards the same values to both the image build and the running container.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables

Copy `.env.example` to `.env.local` and provide your own values:

- `NEXT_PUBLIC_STRAPI_URL` – Public base URL of the Strapi instance. This value is safe to expose because it only contains the host.
- `STRAPI_TOKEN` – **Private** Strapi access token used by server-side code and API routes. Never prefix this variable with `NEXT_PUBLIC_` and avoid committing it to version control; otherwise, the token will be exposed to every browser bundle.

The application proxies authenticated requests through `/api/strapi` so the browser never sees the private token.
