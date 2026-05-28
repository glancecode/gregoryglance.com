export interface Env {
  ASSETS: Fetcher;
}

const APP_BASE = "/tools/print-diagnostics";

function withCache(headers: Headers, value: string): Headers {
  const next = new Headers(headers);
  next.set("Cache-Control", value);
  next.set("X-Content-Type-Options", "nosniff");
  next.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  return next;
}

// Asset filenames here are not content-hashed (app.js, styles.css, rules.json),
// so they must always revalidate. ETag makes this a cheap 304. Marking them
// immutable previously pinned browsers to a stale, broken build for a year.
function cachePolicy(): string {
  return "public, max-age=0, must-revalidate";
}

async function assetResponse(request: Request, env: Env, assetPath: string): Promise<Response> {
  const url = new URL(request.url);
  const assetUrl = new URL(assetPath === "/index.html" ? "/" : assetPath, url);
  const response = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));
  return new Response(response.body, {
    status: response.status,
    headers: withCache(response.headers, cachePolicy())
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
