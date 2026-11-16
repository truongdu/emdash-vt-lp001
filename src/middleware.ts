import { defineMiddleware } from "astro:middleware";

// Default destination after signing in via the emdash-better-auth username+
// password door. The plugin itself defaults a bare /login (no ?redirect=) to
// "/", since a fresh sign-up is subscriber-role and sending them to the admin
// would just bounce. We want the opposite default for sign-IN: land on the
// admin dashboard, unless something already set an explicit ?redirect=
// (e.g. EmDash bouncing an unauthenticated deep link to /_emdash/admin/...).
const DEFAULT_SIGN_IN_REDIRECT = "/_emdash/admin";

export const onRequest = defineMiddleware((context, next) => {
	const pathname = context.url.pathname.replace(/\/$/, "") || "/";
	const isLoginAlias = pathname === "/login";
	const isSignInView = pathname === "/auth/sign-in";

	if ((isLoginAlias || isSignInView) && !context.url.searchParams.has("redirect")) {
		const url = new URL(context.url);
		url.searchParams.set("redirect", DEFAULT_SIGN_IN_REDIRECT);
		return context.redirect(url.pathname + url.search);
	}

	return next();
});
