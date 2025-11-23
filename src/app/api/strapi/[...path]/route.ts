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
  // Remove "api" from the beginning if it exists
  // The frontend calls /api/strapi/api/perfumes, but we need to build /api/perfumes for Strapi
  const filteredSegments = pathSegments[0] === "api" ? pathSegments.slice(1) : pathSegments;
  const path = filteredSegments.join("/");
  const search = request.nextUrl.search;
  
  // Ensure we have /api prefix (Strapi always uses /api prefix)
  const apiPath = path.length > 0 ? `/api/${path}` : "/api";
  
  // Check if base URL already ends with /api to avoid double /api/api
  const baseUrl = STRAPI_BASE_URL.endsWith("/api") 
    ? STRAPI_BASE_URL.replace(/\/api$/, "") 
    : STRAPI_BASE_URL;
  
  return `${baseUrl}${apiPath}${search}`;
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

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    init.signal = controller.signal;

    const response = await fetch(targetUrl, init);
    clearTimeout(timeoutId);

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("content-encoding");

    // If Strapi returns an error, log it but still return the response
    if (!response.ok) {
      // Clone the response to read the body without consuming it
      const clonedResponse = response.clone();
      let errorBody = "";
      try {
        errorBody = await clonedResponse.text();
      } catch {
        // Ignore if we can't read the body
      }
      console.error(`[Proxy] Strapi error (${response.status}):`, {
        url: targetUrl,
        status: response.status,
        statusText: response.statusText,
        body: errorBody.substring(0, 500), // Limit body size in logs
      });
    }

    // Return the original response body
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isTimeout = errorMessage.includes("aborted") || errorMessage.includes("timeout");
    const isNetworkError = 
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("getaddrinfo") ||
      errorMessage.includes("fetch failed");

    console.error("[Proxy] Fetch error:", {
      url: targetUrl,
      error: errorMessage,
      isTimeout,
      isNetworkError,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return appropriate error based on the issue
    if (isTimeout) {
      return NextResponse.json(
        {
          error: "Request timeout",
          message: "The Strapi backend did not respond in time",
          url: targetUrl,
        },
        { status: 504 } // Gateway Timeout
      );
    }

    if (isNetworkError) {
      return NextResponse.json(
        {
          error: "Connection failed",
          message: "Unable to connect to Strapi backend. Please check if the backend is running.",
          url: targetUrl,
          details: errorMessage,
        },
        { status: 502 } // Bad Gateway
      );
    }

    return NextResponse.json(
      {
        error: "Proxy error",
        message: errorMessage,
        url: targetUrl,
      },
      { status: 502 }
    );
  }
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
