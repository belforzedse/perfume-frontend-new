import { NextRequest, NextResponse } from "next/server";

import { API_URL, STRAPI_TOKEN as PUBLIC_STRAPI_TOKEN } from "@/lib/api";

const STRAPI_TOKEN = process.env.STRAPI_TOKEN?.trim() || PUBLIC_STRAPI_TOKEN;
const STRAPI_BASE_URL = API_URL.replace(/\/$/, "");

const FORWARDED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
] as const;

type ForwardedMethod = (typeof FORWARDED_METHODS)[number];

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const buildTargetUrl = (request: NextRequest, params: Awaited<RouteContext["params"]>): string => {
  const pathSegments = Array.isArray(params.path) ? params.path : [];
  const path = pathSegments.join("/");
  const search = request.nextUrl.search;
  const normalizedPath = path.length > 0 ? `/${path}` : "";
  return `${STRAPI_BASE_URL}${normalizedPath}${search}`;
};

const createHeaders = (request: NextRequest): HeadersInit => {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (["host", "connection", "content-length"].includes(key.toLowerCase())) {
      return;
    }
    headers.set(key, value);
  });

  if (STRAPI_TOKEN) {
    headers.set("Authorization", `Bearer ${STRAPI_TOKEN}`);
  } else {
    headers.delete("authorization");
  }

  return headers;
};

const proxyRequest = async (
  method: ForwardedMethod,
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> => {
  if (!FORWARDED_METHODS.includes(method)) {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (!STRAPI_BASE_URL) {
    return NextResponse.json({ error: "Strapi base URL is not configured" }, { status: 500 });
  }

  const params = await context.params;
  const targetUrl = buildTargetUrl(request, params);
  const headers = createHeaders(request);

  const init: RequestInit = {
    method,
    headers,
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD" && request.body) {
    init.body = request.body as BodyInit;
    // @ts-expect-error Node.js requires this when forwarding a readable stream
    init.duplex = "half";
  }

  const response = await fetch(targetUrl, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("transfer-encoding");
  responseHeaders.delete("content-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
};

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60 seconds for large uploads

export const GET = (request: NextRequest, context: RouteContext) =>
  proxyRequest("GET", request, context);
export const POST = (request: NextRequest, context: RouteContext) =>
  proxyRequest("POST", request, context);
export const PUT = (request: NextRequest, context: RouteContext) =>
  proxyRequest("PUT", request, context);
export const PATCH = (request: NextRequest, context: RouteContext) =>
  proxyRequest("PATCH", request, context);
export const DELETE = (request: NextRequest, context: RouteContext) =>
  proxyRequest("DELETE", request, context);
export const OPTIONS = (request: NextRequest, context: RouteContext) =>
  proxyRequest("OPTIONS", request, context);
export const HEAD = (request: NextRequest, context: RouteContext) =>
  proxyRequest("HEAD", request, context);
