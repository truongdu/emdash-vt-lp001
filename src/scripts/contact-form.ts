import { parseApiResponse } from "emdash/plugin-utils";

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
};
const endpoint = "/_emdash/api/plugins/contact-inbox";
let turnstilePromise: Promise<Turnstile> | undefined;
function loadTurnstile(): Promise<Turnstile> {
  return turnstilePromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => resolve((window as unknown as Window & { turnstile: Turnstile }).turnstile);
    script.onerror = () => reject(new Error("Không tải được xác minh chống spam. Vui lòng tải lại trang."));
    document.head.appendChild(script);
  });
}

async function setup(form: HTMLFormElement) {
  if (form.dataset.initialized) return;
  form.dataset.initialized = "true";
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const notice = form.querySelector<HTMLElement>(".form_message")!;
  const showError = (message: string) => {
    notice.textContent = message;
    notice.className = "form_message is-error";
    notice.hidden = false;
  };
  let token = "";
  let widget: string;
  let turnstile: Turnstile;
  button.disabled = true;
  try {
    const readiness = await fetch("/api/contact-ready");
    if (!readiness.ok) throw new Error("Email is not configured");
    const config = await parseApiResponse<{ siteKey: string }>(
      await fetch(`${endpoint}/turnstile`), "Form liên hệ chưa sẵn sàng.",
    );
    turnstile = await loadTurnstile();
    widget = turnstile.render(form.querySelector<HTMLElement>("[data-turnstile]")!, {
      sitekey: config.siteKey,
      callback: (value: string) => { token = value; button.disabled = false; notice.hidden = true; },
      "expired-callback": () => { token = ""; button.disabled = true; },
      "error-callback": () => { token = ""; button.disabled = true; showError("Không xác minh được chống spam. Vui lòng thử lại."); },
    });
  } catch {
    showError("Form liên hệ đang được cấu hình. Vui lòng thử lại sau.");
    return;
  }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!token || !form.reportValidity()) return;
    const data = new FormData(form);
    button.disabled = true;
    notice.hidden = true;
    const phone = String(data.get("phone") ?? "").trim();
    try {
      await parseApiResponse(await fetch(`${endpoint}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"), email: data.get("email"),
          subject: "Liên hệ website VIETRY",
          message: `${phone ? `Số điện thoại: ${phone}\n\n` : ""}${data.get("message") ?? ""}`,
          website_url: data.get("website") ?? "", turnstileToken: token,
          privacyConsent: data.get("accept_privacy") === "on",
        }),
      }), "Không gửi được tin nhắn. Vui lòng thử lại sau.");
      window.location.assign("/thanks/");
    } catch {
      showError("Chưa thể xác nhận gửi tin nhắn. Vui lòng thử lại sau.");
      token = "";
      turnstile.reset(widget);
    }
  });
}
for (const form of document.querySelectorAll<HTMLFormElement>("[data-contact-form]")) void setup(form);
