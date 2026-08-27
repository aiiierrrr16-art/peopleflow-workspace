declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}

interface D1Database {}
interface Fetcher {
  fetch(request: Request): Promise<Response>;
}
