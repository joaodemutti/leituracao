import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Range, Authorization, X-Target-Url",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Only allow GET and HEAD requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const targetUrl = req.headers.get("X-Target-Url")?.trim();

  if (!targetUrl) {
    return new Response("Missing X-Target-Url header", { status: 400 });
  }

  // Get token from Authorization header
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token) {
    return new Response("Unauthorized: Missing authentication token", {
      status: 401,
    });
  }

  // Validate token is a non-empty JWT-like string (basic validation)
  if (token.split(".").length !== 3) {
    console.error("Invalid token format");
    return new Response("Unauthorized: Invalid token format", { status: 401 });
  }

  // Validate URL is a proper URL
  let fetchUrl: URL;
  try {
    fetchUrl = new URL(targetUrl);
  } catch {
    return new Response("Invalid X-Target-Url header", { status: 400 });
  }

  // Only allow HTTP and HTTPS
  if (fetchUrl.protocol !== "http:" && fetchUrl.protocol !== "https:") {
    return new Response("Only HTTP and HTTPS URLs are allowed", {
      status: 400,
    });
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "User-Agent": "Supabase-CORS-Proxy",
      },
    });

    // Forward relevant headers
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Content-Type":
        response.headers.get("Content-Type") || "application/octet-stream",
    });

    // Forward Range header support for partial content
    if (response.headers.has("Content-Length")) {
      headers.set("Content-Length", response.headers.get("Content-Length")!);
    }
    if (response.headers.has("Accept-Ranges")) {
      headers.set("Accept-Ranges", response.headers.get("Accept-Ranges")!);
    }
    if (response.headers.has("Content-Range")) {
      headers.set("Content-Range", response.headers.get("Content-Range")!);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("Error fetching URL:", error);
    return new Response("Error fetching resource", { status: 502 });
  }
});
