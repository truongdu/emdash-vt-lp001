import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";
import { createHash, timingSafeEqual } from "node:crypto";

export { PluginBridge };

interface Env {
	SITE_BASIC_AUTH?: string;
}

function hash(value: string) {
	return createHash("sha256").update(value).digest();
}

export default {
	...handler,
	fetch(request, env, ctx) {
		const url = new URL(request.url);
		if (import.meta.env.PROD && url.protocol === "http:") {
			url.protocol = "https:";
			return Response.redirect(url, 308);
		}

		const credentials = env.SITE_BASIC_AUTH;
		if (!credentials) {
			if (import.meta.env.DEV) return handler.fetch(request, env, ctx);
			return new Response("Site authentication is unavailable.", {
				status: 503,
				headers: { "Cache-Control": "no-store" },
			});
		}

		const token = request.headers.get("Authorization")?.match(/^Basic +([A-Za-z0-9+/]+=*)$/i)?.[1];
		const expectedToken = Buffer.from(credentials, "utf8").toString("base64");
		if (!token || !timingSafeEqual(hash(token), hash(expectedToken))) {
			return new Response("Authentication required.", {
				status: 401,
				headers: {
					"WWW-Authenticate": 'Basic realm="VIETRY", charset="UTF-8"',
					"Cache-Control": "no-store",
				},
			});
		}

		return handler.fetch(request, env, ctx);
	},
	scheduled: createScheduledHandler(),
} satisfies ExportedHandler<Env>;
