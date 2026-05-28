export interface Env {
  ASSETS: Fetcher;
}

const APP_BASE = "/tools/print-diagnostics";
const LONG_CACHE_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".json",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".ico",
  ".woff",
  ".woff2"
]);

function withCache(headers: Headers, value: string): Headers {
  const next = new Headers(headers);
  next.set("Cache-Control", value);
  next.set("X-Content-Type-Options", "nosniff");
  next.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  return next;
}

function cachePolicy(pathname: string, contentType: string | null): string {
  if (contentType?.includes("text/html")) {
    return "public, max-age=0, must-revalidate";
  }

  const extension = pathname.includes(".")
    ? pathname.slice(pathname.lastIndexOf(".")).toLowerCase()
    : "";

  if (LONG_CACHE_EXTENSIONS.has(extension)) {
    return "public, max-age=31536000, immutable";
  }

  return "public, max-age=3600, stale-while-revalidate=86400";
}

async function assetResponse(request: Request, env: Env, assetPath: string): Promise<Response> {
  const url = new URL(request.url);
  const assetUrl = new URL(assetPath, url);
  const response = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));
  return new Response(response.body, {
    status: response.status,
    headers: withCache(response.headers, cachePolicy(assetPath, response.headers.get("content-type")))
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!["GET", "HEAD"].includes(request.method)) {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (!path.startsWith(APP_BASE)) {
      return new Response("Not Found", { status: 404 });
    }

    if (path === APP_BASE) {
      return Response.redirect(`${url.origin}${APP_BASE}/`, 301);
    }

    if (path === `${APP_BASE}/`) {
      return assetResponse(request, env, "/index.html");
    }

    const assetPath = path.slice(APP_BASE.length);
    const response = await assetResponse(request, env, assetPath);
    if (response.ok) return response;

    return assetResponse(request, env, "/index.html");
  }
};
