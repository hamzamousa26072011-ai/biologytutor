/**
 * Cloudflare Worker Tunnel / Proxy with Service Binding (AI_STUDIO_APPLET -> biology-tutor)
 */
const DEFAULT_ORIGIN =
  "https://ais-pre-c6eeh5grwbdoesvavo3tvf-908807752043.europe-west2.run.app";

const worker = {
  async fetch(request, env) {
    if (
      env?.AI_STUDIO_APPLET &&
      typeof env.AI_STUDIO_APPLET.fetch === "function" &&
      !request.headers.get("X-Service-Bound")
    ) {
      const boundHeaders = new Headers(request.headers);
      boundHeaders.set("X-Service-Bound", "1");
      return env.AI_STUDIO_APPLET.fetch(
        new Request(request.url, {
          method: request.method,
          headers: boundHeaders,
          body:
            request.method !== "GET" && request.method !== "HEAD"
              ? request.body
              : undefined,
        })
      );
    }

    const url = new URL(request.url);
    const targetOrigin = env?.TARGET_ORIGIN || DEFAULT_ORIGIN;
    const targetUrl = new URL(url.pathname + url.search, targetOrigin);

    const headers = new Headers(request.headers);
    headers.set("Host", new URL(targetOrigin).host);
    headers.set("X-Forwarded-Host", url.host);
    headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

    const init = {
      method: request.method,
      headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
      redirect: "manual",
    };

    return fetch(targetUrl.toString(), init);
  },
};

export default worker;
