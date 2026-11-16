# Hướng dẫn Deploy lên Cloudflare (uplive)

Project: `emdash-vt-lp001`
GitHub: https://github.com/truongdu/emdash-vt-lp001
Production: https://emdash-vt-lp001.truongdu-td88.workers.dev

## Quy trình mỗi lần cập nhật code

### Bước 1 — Push code lên GitHub

```powershell
cd D:\09.VTry\emdashcms\vt-lp001
git add -A
git commit -m "Mô tả thay đổi"
git push origin main
```

> Lần đầu push có thể cần đăng nhập GitHub — popup đăng nhập sẽ tự hiện ra vì đây là terminal tương tác thật.

### Bước 2 — Build + Deploy lên Cloudflare Workers

```powershell
npm run build
npx wrangler deploy
```

(hoặc gộp 2 lệnh: `npm run deploy`)

Lần đầu chạy `wrangler deploy` trên máy mới cần đăng nhập trước:
```powershell
npx wrangler login
```
→ Trình duyệt tự mở trang Cloudflare để xác nhận quyền truy cập.

### Bước 3 — Kiểm tra lại

Mở https://emdash-vt-lp001.truongdu-td88.workers.dev kiểm tra site đã cập nhật đúng.

---

## Khi nào cần chạy Database Migration? (chỉ 1 lần, không phải mỗi lần deploy)

Chỉ cần chạy lại nếu EmDash phát hành bản cập nhật có thêm migration mới (hiếm khi xảy ra với thay đổi code thông thường — **không cần chạy lại mỗi lần push code bình thường**).

Nếu gặp lỗi "Database migrations are required" trên production:

```powershell
npx emdash migrate --from-config --status `
  --account-id 34630148042027d9061112472bb8bf7a `
  --wrangler-config wrangler.jsonc `
  --d1 <d1-database-uuid>
```
(lấy UUID qua `npx wrangler d1 list`)

Xem đủ thông tin `Target fingerprint` rồi chạy áp dụng thật (bỏ `--status`):
```powershell
npx emdash migrate --from-config `
  --account-id 34630148042027d9061112472bb8bf7a `
  --wrangler-config wrangler.jsonc `
  --d1 <d1-database-uuid> `
  --expected-target-fingerprint <fingerprint-vừa-xem>
```

Lệnh này cần biến môi trường `CLOUDFLARE_API_TOKEN` (API Token thường — **không dùng được** OAuth token của `wrangler login`). Tạo token tại:
https://github.com/settings/tokens hoặc https://dash.cloudflare.com/profile/api-tokens → chọn quyền **D1 Edit** (Account scope).

```powershell
$env:CLOUDFLARE_API_TOKEN = "cfut_xxxxxxxx"
```

---

## Những thứ hiện đang **tắt/chưa cấu hình** trên production — cần làm khi sẵn sàng

| Hạng mục | Trạng thái | Cách bật lại |
|---|---|---|
| **R2 (lưu media/ảnh upload)** | Tắt — cần thêm thẻ thanh toán Cloudflare mới bật được R2 (free tier, không bị trừ tiền nếu không vượt 10GB/tháng) | 1) Vào https://dash.cloudflare.com/34630148042027d9061112472bb8bf7a/r2/checkout/payment thêm thẻ<br>2) Thêm lại `storage: r2({ binding: "MEDIA" })` vào `astro.config.mjs` + `r2_buckets` vào `wrangler.jsonc`<br>3) `npx wrangler r2 bucket create emdash-vt-lp001-media`<br>4) Build + deploy lại |
| **Plugin Registry / Marketplace** | Tắt — cần gói Cloudflare Workers trả phí (Worker Loader) | Thêm lại `sandboxRunner: sandbox()` + `registry: "https://registry.emdashcms.com"` vào `astro.config.mjs`, bật `worker_loaders` trong `wrangler.jsonc` — **chỉ làm khi đã nâng gói trả phí** |
| **Gửi email thật từ form liên hệ** | Chưa cấu hình — hiện chỉ log ra console, không gửi mail | Đăng ký [resend.com](https://resend.com), thêm vào `.env` (local) hoặc Cloudflare secret (production):<br>`RESEND_API_KEY=re_xxx`<br>`CONTACT_TO_EMAIL=email-nhan@vietry.com.vn`<br>Với production, set secret bằng: `npx wrangler secret put RESEND_API_KEY` |
| **Tài khoản Admin / Site Settings production** | Database production đang trống nội dung (title "My Site" mặc định) | Vào `https://emdash-vt-lp001.truongdu-td88.workers.dev/_emdash/admin` tạo tài khoản admin + cấu hình Site Settings (tên site, logo...) |

## Lưu ý bảo mật

- Personal Access Token (GitHub) và API Token (Cloudflare) dùng để push/migrate **nên tạo với thời hạn ngắn** (7-30 ngày) và **revoke sau khi dùng xong** nếu không cần nữa:
  - GitHub: https://github.com/settings/tokens
  - Cloudflare: https://dash.cloudflare.com/profile/api-tokens
