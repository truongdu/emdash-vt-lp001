import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { d1, sandbox } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { betterAuthProvider, betterAuthSettingsPlugin } from "emdash-better-auth";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	// Match Astro's session cookie lifetime to Better Auth's own 7-day cookie,
	// otherwise the EmDash session silently drops shortly after sign-in and
	// bounces the user back to /login.
	session: { cookie: { maxAge: 60 * 60 * 24 * 7 }, ttl: 60 * 60 * 24 * 7 },
	vite: { plugins: [tailwindcss()] },
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			sandboxRunner: sandbox(),
			registry: "https://registry.emdashcms.com",
			authProviders: [betterAuthProvider()],
			plugins: [betterAuthSettingsPlugin()],
		}),
	],
	devToolbar: { enabled: false },
});
