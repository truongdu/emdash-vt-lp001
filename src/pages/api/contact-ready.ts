import type { APIRoute } from "astro";
import { withEmDashRuntime } from "emdash/middleware";

export const prerender = false;
// Only expose readiness; SMTP credentials and plugin settings stay private.
export const GET: APIRoute = () => withEmDashRuntime(async runtime => {
  const ready = runtime.email?.isAvailable() ?? false;
  return new Response(JSON.stringify({ ready }), {
    status: ready ? 200 : 503,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
});
