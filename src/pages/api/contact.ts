import type { APIRoute } from "astro";

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
	name: string;
	email: string;
	phone?: string;
	message: string;
}

function validate(data: Record<string, FormDataEntryValue | null>) {
	const errors: string[] = [];
	const name = String(data.name ?? "").trim();
	const email = String(data.email ?? "").trim();
	const phone = String(data.phone ?? "").trim();
	const message = String(data.message ?? "").trim();
	const honeypot = String(data.website ?? "").trim();

	if (honeypot) errors.push("spam detected");
	if (!name) errors.push("Vui lòng nhập họ và tên");
	if (!email || !EMAIL_RE.test(email)) errors.push("Email không hợp lệ");
	if (!message) errors.push("Vui lòng nhập nội dung");

	return { errors, payload: { name, email, phone, message } as ContactPayload };
}

async function sendViaResend(payload: ContactPayload, apiKey: string, to: string) {
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: "VIETRY Website <onboarding@resend.dev>",
			to: [to],
			reply_to: payload.email,
			subject: `[Liên hệ website] ${payload.name}`,
			text: `Họ và tên: ${payload.name}\nEmail: ${payload.email}\nSố điện thoại: ${payload.phone || "-"}\n\nNội dung:\n${payload.message}`,
		}),
	});
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`Resend API lỗi ${res.status}: ${body}`);
	}
}

export const POST: APIRoute = async ({ request }) => {
	let data: Record<string, FormDataEntryValue | null>;
	const contentType = request.headers.get("content-type") || "";
	if (contentType.includes("application/json")) {
		data = await request.json();
	} else {
		data = Object.fromEntries(await request.formData());
	}

	const { errors, payload } = validate(data);
	if (errors.length > 0) {
		return new Response(JSON.stringify({ success: false, errors }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const apiKey = import.meta.env.RESEND_API_KEY;
	const to = import.meta.env.CONTACT_TO_EMAIL;

	if (apiKey && to) {
		try {
			await sendViaResend(payload, apiKey, to);
		} catch (err) {
			console.error("[contact] gửi email thất bại:", err);
			return new Response(
				JSON.stringify({ success: false, errors: ["Gửi email thất bại, vui lòng thử lại sau."] }),
				{ status: 502, headers: { "Content-Type": "application/json" } },
			);
		}
	} else {
		// Chưa cấu hình RESEND_API_KEY / CONTACT_TO_EMAIL — log để test local.
		console.log("[contact] (chưa cấu hình email, chỉ log) submission:", payload);
	}

	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
