# Nhật ký Setup Local — EmDash CMS (vt-lp001)

Mục tiêu: Khởi tạo project EmDash CMS mới tại `d:\09.VTry\emdashcms\vt-lp001`, làm nền để chuyển đổi nội dung từ site cũ [vietry.com.vn/vn/](https://vietry.com.vn/vn/) sang. Layout/giao diện sẽ được tự xây lại theo site cũ (không phụ thuộc theme có sẵn của EmDash).

Ngày thực hiện: 2026-11-13

## 1. Khảo sát ban đầu

- Folder `vt-lp001` ban đầu **trống hoàn toàn**.
- EmDash là CMS mã nguồn mở xây trên **Astro + TypeScript**, phát triển bởi Cloudflare, chạy trên Cloudflare Workers (D1 + R2) hoặc Node (SQLite + file storage).
- Nguồn: https://emdashcms.com/ — docs: https://docs.emdashcms.com/

## 2. Kiểm tra môi trường

| Công cụ | Version lúc kiểm tra |
|---|---|
| Node.js | v22.18.0 (không đủ, Astro 7 yêu cầu `>=22.23.4`) |
| npm | 10.9.3 |
| Git | 2.37.1 |
| nvm-windows | 1.1.10 (đã cài nhưng không quản lý bản Node đang active) |
| winget | có sẵn |

## 3. Chọn template & platform

Dùng CLI chính thức: `npm create emdash@latest`.

Các lựa chọn: `--template blog|starter|marketing|portfolio`, `--platform node|cloudflare`.

- Thử lần đầu với `--yes` → mặc định ra `cloudflare:blog` (chỉ có post/category/tag, không hợp site doanh nghiệp).
- Quyết định cuối: **`cloudflare:starter`**
  - `starter`: tối giản (posts + static pages theo slug + category/tag + search + RSS), không áp giao diện/cấu trúc blog cố định → phù hợp để tự build lại layout/nội dung giống vietry.com.vn (giới thiệu, dịch vụ/sản phẩm, tin tức, liên hệ...).
  - `cloudflare`: theo yêu cầu, site sẽ deploy lên Cloudflare Workers (D1 cho database, R2 cho storage).

Lệnh đã chạy:
```bash
npm create emdash@latest . -- --template cloudflare:starter --yes --force
```

Kết quả scaffold (`src/`):
- `src/pages/index.astro` — trang chủ
- `src/pages/[slug].astro` — static page theo slug
- `src/pages/posts/`, `src/pages/category/[slug].astro`, `src/pages/tag/[slug].astro` — tin tức/Column
- `src/pages/search.astro`, `src/pages/rss.xml.ts`
- `src/layouts/Base.astro`, `src/styles/*.css` — base layout tối giản, sẽ thay bằng layout của vietry.com.vn
- `wrangler.jsonc` — cấu hình Cloudflare Workers/D1/R2
- `.env` — có `EMDASH_ENCRYPTION_KEY` tự sinh

## 4. Sự cố & cách xử lý: Node.js không đủ version

`npm run dev` lần đầu báo lỗi cứng:
```
Node.js v22.18.0 is not supported by Astro!
Please upgrade Node.js to a supported version: ">=22.23.4"
```

**Thử nvm-windows trước** (đã có sẵn trên máy, bản 1.1.10):
- `nvm install 24.22.3` → cài thành công.
- `nvm use 24.22.3` → báo "Now using node v24.22.3" nhưng **không có hiệu lực thật** (`node --version` vẫn ra v22.18.0).
- Điều tra: `C:\Program Files\nodejs` là Node **cài độc lập qua MSI** (từ 27/8/2025), không phải symlink/junction do nvm quản lý → nvm không swap được dù chạy với quyền Administrator (đã thử elevate qua UAC, vẫn không đổi).
- Thử tự tạo junction thủ công trỏ sang bản nvm (`C:\Users\Administrator\AppData\Roaming\nvm\v24.22.3`) → **node.exe chạy đúng version**, nhưng `npm` bị lỗi:
  ```
  Error: EPERM: operation not permitted, lstat 'C:\Users\Administrator\AppData'
  ```
  Nguyên nhân: nvm trên máy này được cài dưới profile user **Administrator**, còn user đang dùng là **DuPX** — Windows chặn truy cập `AppData` của user khác, nên npm không resolve được đường dẫn thật qua junction.
- **Rollback**: gỡ junction, đổi tên thư mục backup về lại `C:\Program Files\nodejs` (khôi phục đúng Node v22.18.0 ban đầu, không mất gì).

**Giải pháp cuối cùng — dùng winget**:
```powershell
winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
```
→ Cài Node.js **v26.13.1** (LTS) đè lên `C:\Program Files\nodejs` đúng chuẩn, quyền truy cập cho mọi user bình thường (không dính lỗi permission như nvm).

Kết quả xác nhận:
```
node --version   # v26.13.1
npm --version    # 11.20.0
```

> Lưu ý: việc nâng Node lên v26.13.1 là thay đổi **toàn máy** (không chỉ riêng project này), đã xác nhận với người dùng trước khi thực hiện.

## 5. Cài lại dependencies & approve install scripts

Sau khi đổi Node version, cần rebuild native bindings:
```bash
rm -rf node_modules package-lock.json
npm install
```

npm (bản mới, có cơ chế chặn install scripts theo mặc định) báo 2 package bị chặn script cài đặt:
- `workerd` (runtime Cloudflare Workers — **cần** để chạy Cloudflare dev local)
- `esbuild`

Đã approve:
```bash
npm install-scripts approve workerd esbuild
```

## 6. Kết quả chạy local

```bash
npm run dev
```

- Astro v7.4.11 sẵn sàng sau ~7.8s.
- **Site:** http://localhost:4321/ → HTTP 200
- **Admin UI (setup wizard):** http://localhost:4321/_emdash/admin → HTTP 302 (redirect vào wizard, bình thường cho lần chạy đầu)
- **MCP server:** http://localhost:4321/_emdash/api/mcp
- **Dev bypass** (bỏ qua passkey, đăng nhập thẳng dev admin): http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin

EmDash sẽ tự chạy migration database + seed dữ liệu mẫu khi hoàn tất setup wizard lần đầu.

## 7. Clone giao diện từ theme WordPress cũ

Nguồn tham khảo: `D:\09.VTry\emdashcms\vietry.com.vn_vn_old\vtry` (theme WordPress gốc của vietry.com.vn/vn/).

Site cũ thực chất là **one-page landing** (hero, 3 điểm mạnh, why, dịch vụ, quy trình, khách hàng tiêu biểu, FAQ, preview tin tức, liên hệ) + mục tin tức "**Column**" (custom post type `column`, route `/column/`).

Đã thực hiện:
- Copy nguyên `css/`, `js/`, `images/`, `json/` (lottie animation), `favicon*` từ theme cũ vào `public/assets/` và `public/favicon/` của EmDash — giữ nguyên tên file để không phải sửa lại markup.
- Viết lại `src/layouts/Base.astro`: dựng lại đúng cấu trúc header/nav/footer của theme cũ (giữ nguyên class CSS), link đủ 7 file CSS theo đúng thứ tự enqueue gốc (`slick-theme, slick, aos, base, fonts, styles, responsive`), nạp JS theo đúng thứ tự gốc (`jquery, sweetlink, common, aos, slick, lottie-player`) bằng `<script is:inline>` để chạy như classic script (không qua Vite bundling, vì đây là jQuery plugin toàn cục). Vẫn giữ `EmDashHead`/`EmDashBodyStart`/`EmDashBodyEnd` để không mất các tính năng CMS (SEO, live-edit overlay...).
- Viết lại `src/pages/index.astro`: dựng đầy đủ các section y hệt bản gốc (text, lottie-player, ảnh), phần "Column thông tin mới nhất" nối vào collection `posts` có sẵn của EmDash (đóng vai trò `column`).
- Đổi route tin tức từ `/posts` → `/column` (gồm `src/pages/column/index.astro`, `src/pages/column/[slug].astro`) để khớp URL gốc, style theo `archive-column.php` / `single-column.php`. Cập nhật lại các link liên quan trong `category/[slug].astro`, `tag/[slug].astro`, `search.astro`, `rss.xml.ts`, `components/PostCard.astro`.
- Tiện thể fix 1 bug có sẵn trong scaffold starter: `rss.xml.ts` import `resolveBlogSiteIdentity` (không tồn tại) → sửa thành `resolveStarterSiteIdentity`.
- `src/pages/[slug].astro` (trang tĩnh, vd. chính sách bảo mật sau này): style theo `page.php` gốc (`bodyClass="under"`, heading `#under_topinfo`).

**Đã lược bớt so với bản gốc** (có thể làm tiếp sau nếu cần):
- Ngôn ngữ: bỏ nút chuyển JP/VI ở header (site mới chỉ có tiếng Việt).
- Section "Website khác của chúng tôi" (banner quảng cáo sang site LP riêng `vietry.com.vn/lp/001/vi/`) — không thuộc phạm vi site chính nên tạm bỏ.
- Form liên hệ: bản gốc dùng plugin WordPress Contact Form 7 + Google reCAPTCHA. Bản EmDash hiện tại chỉ là **form tĩnh placeholder** (chưa nối API gửi mail) — cần làm riêng sau.
- Sidebar tìm kiếm theo năm ở trang `/column/` (lọc bài viết theo năm) — EmDash collection API hiện dùng cursor pagination, chưa dựng lại phần lọc theo năm.

Đã verify: `npm run dev` build không lỗi, trang chủ (`/`) trả về đủ 14 class section gốc (`sec_strength`, `sec_service`, `sec_process`, `sec_faq`, `sec_contact`...), cả 7 file CSS load HTTP 200, route `/column/` trả về 200.

## 7b. Chuyển trang chủ sang quản lý qua CMS (Block Editor)

Sau khi clone xong giao diện (mục 7), ban đầu mình tách nội dung dạng danh sách (Điểm mạnh, FAQ, Quy trình, Khách hàng) thành 4 **collection riêng** (`strengths`, `faq`, `process_steps`, `customers`). Người dùng phản hồi: muốn quản lý kiểu **WordPress** — mỗi trang là 1 entry duy nhất, nội dung nhập hết trong **1 visual editor** của trang đó, không tách collection riêng cho từng phần nhỏ. Đã xoá 4 collection trên và làm lại theo đúng mô hình sau:

**Kiến trúc mới — dùng Block Type của EmDash (giống Gutenberg/WordPress):**
- Tạo 9 **block type** qua API `/_emdash/api/schema/block-types` (tương ứng từng section của trang chủ): `hero`, `strength_list`, `why_us`, `service_intro`, `process_list`, `customer_logos` (dùng field `repeater` cho danh sách, subfield `image` cho logo), `faq_list`, `column_preview`, `contact_cta`.
- Thêm field `blocks` (type `blocks`, `allowedTypes` = 9 slug trên) vào collection **`pages`** có sẵn — field này cho phép 1 page entry chứa 1 dãy block, thêm/sửa/sắp xếp ngay trong admin.
- Tạo 1 page entry duy nhất: slug **`top`**, chứa đủ 9 block với nội dung gốc từ theme cũ (kể cả 3 logo khách hàng, upload qua `/_emdash/api/media`).
- Viết lại [src/pages/index.astro](src/pages/index.astro): fetch `getEmDashEntry("pages", "top")`, render bằng `<Blocks>` (từ `emdash/ui`) + map `components` theo `_type` sang các Astro component tương ứng trong [src/components/blocks/](src/components/blocks/) (`Hero.astro`, `StrengthList.astro`, `WhyUs.astro`, `ServiceIntro.astro`, `ProcessList.astro`, `CustomerLogos.astro`, `FaqList.astro`, `ColumnPreview.astro`, `ContactCta.astro`) — mỗi component giữ nguyên HTML/class CSS gốc, chỉ thay nội dung cứng bằng data từ block.
- `ColumnPreview.astro` tự fetch 6 bài mới nhất từ collection `posts` (không phải block field) — luôn hiển thị bài mới nhất, không cần sửa trang TOP khi có bài viết mới.

**Cách chỉnh sửa trang chủ từ giờ:** vào `/_emdash/admin` → Pages → mở entry **"Trang chủ"** (slug `top`) → sửa trực tiếp trong visual editor (thêm/sửa/xoá/sắp xếp block) → Publish. Không cần sửa code trừ khi muốn đổi *loại* block mới hoàn toàn.

**Lưu ý kỹ thuật khi thao tác qua API (ghi lại để lần sau khỏi mất công debug):**
- Route update collection dùng method **PUT**, không phải PATCH (PATCH trả về `NOT_AUTHENTICATED` gây hiểu lầm là lỗi session).
- Mọi request state-changing (POST/PUT/DELETE) cần header `X-EmDash-Request: 1` (CSRF check), nếu không sẽ bị `CSRF_REJECTED`.
- Trên Windows, `curl -d '<json có dấu tiếng Việt>'` qua Git Bash bị lỗi encoding (ký tự có dấu thành `?`) — phải ghi JSON ra file UTF-8 rồi gửi bằng `--data-binary @file`.
- Field ảnh (`image`) lưu giá trị dạng `{"id": "<mediaId>"}`, không phải `{"mediaId": ...}`.
- Slug field/block không được chứa chữ hoa (vd. `yearsDescription` bị từ chối, phải đổi thành `years_description`).

## 8. Việc còn lại / bước tiếp theo — giai đoạn 2 (nội dung động)

- [ ] Mở `http://localhost:4321/_emdash/admin` và hoàn tất setup wizard (tạo tài khoản admin).
- [ ] Khảo sát chi tiết cấu trúc nội dung thực tế của vietry.com.vn/vn/ (trang chủ, giới thiệu, dịch vụ/sản phẩm, tin tức, liên hệ...) để thiết kế lại content collections/schema trong EmDash cho khớp.
- [ ] Xây lại layout (`src/layouts/Base.astro`, `src/styles/`) và components theo đúng giao diện site cũ.
- [ ] Viết script/kế hoạch import nội dung (text, hình ảnh, SEO metadata) từ site cũ sang EmDash.
- [ ] Cấu hình `wrangler.jsonc` (tên D1 database, R2 bucket) khi chuẩn bị deploy lên Cloudflare Workers thật (`npx wrangler login` trước khi deploy).
- [ ] Cân nhắc disable Astro telemetry nếu cần: `astro telemetry disable`.

## Ghi chú môi trường máy

- Node.js hệ thống đã nâng từ v22.18.0 → **v26.13.1** (qua winget, 2026-11-13). Nếu các project Node khác trên máy này yêu cầu đúng v22.18.0, cần kiểm tra lại tương thích.
- nvm-windows trên máy này bị cài dưới profile `Administrator` trong khi user chính là `DuPX` → nvm **không dùng được bình thường** do lỗi quyền truy cập `AppData` chéo user. Nếu cần quản lý nhiều version Node sau này, nên gỡ và cài lại nvm-windows dưới đúng profile `DuPX`, hoặc dùng `fnm`/`volta` thay thế.
