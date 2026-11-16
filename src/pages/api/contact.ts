import type { APIRoute } from "astro";

export const prerender = false;
// Retired endpoint: submissions are now handled and stored by Contact Inbox.
export const POST: APIRoute = () => new Response(JSON.stringify({
  success: false,
  errors: ["Vui lòng tải lại trang và sử dụng form liên hệ mới."],
}), { status: 410, headers: { "Content-Type": "application/json" } });
