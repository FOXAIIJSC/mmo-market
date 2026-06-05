# QUY TRÌNH VẬN HÀNH CHUẨN — SÀN GIAO DỊCH MMO

> **Phiên bản áp dụng:** 1.0 — chuẩn hóa từ `MMO_Platform_Operations.docx` (v1.0, 06/2025) và ánh xạ vào codebase thực tế.
> **Nguyên tắc biên soạn:** Tài liệu nghiệp vụ là **chuẩn gốc**. Khi code hiện tại lệch chuẩn, tài liệu này mô tả trạng thái **mục tiêu** và đánh dấu phần cần chỉnh. Chi tiết khoảng cách & backlog kỹ thuật xem [GAP_ANALYSIS_VA_BACKLOG.md](GAP_ANALYSIS_VA_BACKLOG.md).
>
> **Stack thực tế:** Frontend Next.js 16 (App Router, static export) trong [src/](../src/) · Backend .NET 8 / EF Core 8 (Clean Architecture, SQLite) trong [backend/src/](../backend/src/). Stack này **khớp** với giả định của tài liệu gốc — không cần đổi nền tảng.

**Chú thích ô "Hiện trạng code" trong mỗi mục:**
`✅ ĐÃ CÓ` (khớp chuẩn) · `🟡 MỘT PHẦN` (có nhưng lệch chuẩn) · `🔴 THIẾU` (cần bổ sung).

---

## 1. Tổng quan & Nguyên tắc vàng

Sàn MMO là nền tảng trung gian (escrow) kết nối người mua và người bán sản phẩm số: tài khoản game, phần mềm/key, dịch vụ MMO, tài khoản mạng xã hội/email/SĐT ảo.

| Thực thể | Vai trò | Quyền hạn chính | Ánh xạ code |
|---|---|---|---|
| Người mua (Buyer) | Tìm & mua sản phẩm | Nạp tiền, mua, khiếu nại, đánh giá | `User` (Role=Buyer) |
| Người bán (Seller) | Đăng & bán | Đăng tin, nhận đơn, bàn giao, rút tiền | `User` (Role=Seller) + `Seller` |
| Quản trị (Admin) | Vận hành & kiểm soát | Duyệt sản phẩm, xử lý tranh chấp, báo cáo | `User` (Role=Admin/SuperAdmin) |
| Hệ thống (Escrow) | Giữ tiền trung gian | Lock/Unlock, tự động giải ngân | logic trong `OrderService` + `WalletTxn` |

**Bốn nguyên tắc vàng (bắt buộc tuân thủ):**
1. **Escrow trước** — tiền phải được sàn giữ trước khi thông tin bàn giao được mở cho buyer.
2. **Giải ngân có điều kiện** — chỉ giải ngân cho seller khi buyer xác nhận HOẶC hết thời hạn kiểm tra/bảo hành.
3. **Log bất biến** — mọi giao dịch tài chính đều có lịch sử, không được xóa/sửa (yêu cầu Audit Log — xem backlog P0).
4. **SLA tranh chấp 72h** — mọi tranh chấp phải được phán quyết trong 72 giờ làm việc.

**Hiện trạng code:** ✅ Escrow-first & giải ngân có điều kiện đã có trong [OrderService.cs](../backend/src/MmoMarket.Application/Orders/OrderService.cs). 🔴 Audit Log bất biến chưa có. ✅ SLA 72h đã có (`Dispute.SlaUntil`).

---

## 2. Vòng đời người dùng & KYC

| Bước | Hành động | Trạng thái chuẩn | Ghi chú |
|---|---|---|---|
| 1 | Đăng ký email/SĐT | `PENDING_VERIFY` | Gửi OTP xác nhận |
| 2 | Xác minh OTP | `ACTIVE_BASIC` | Được phép mua |
| 3 | Seller nộp KYC CCCD | `KYC_PENDING` | Upload ảnh CCCD 2 mặt |
| 4 | Admin duyệt KYC | `KYC_APPROVED` | Được phép đăng bán & rút tiền |
| 5 | Liên kết ngân hàng | `BANK_LINKED` | Bắt buộc để rút tiền |

**Chuẩn:** Tài khoản chưa KYC vẫn mua được nhưng **bị giới hạn hạn mức nạp/rút** (xem §7). Bắt buộc KYC khi giao dịch > 5 triệu/tháng (chống rửa tiền).

**Ánh xạ code:** `User` ([Entities/User.cs](../backend/src/MmoMarket.Domain/Entities/)), `KycSubmission`, enum `KycStatus { None, Pending, Approved, Rejected }`. Service: [KycService.cs](../backend/src/MmoMarket.Application/Sellers/KycService.cs).

**Hiện trạng code:** 🟡 KYC có đủ luồng nộp/duyệt nhưng `KycSubmission` **chỉ lưu text** (họ tên, số CCCD, địa chỉ, SĐT) — **chưa có trường ảnh CCCD 2 mặt**. 2FA/Google OAuth đã có trên `User`.

---

## 3. Vòng đời sản phẩm (Listing)

Seller đăng tin → chọn danh mục → điền thông tin (tên, mô tả, ảnh chứng minh, giá, bảo hành) → chọn hình thức bàn giao (Tự động key/file · Thủ công) → (đặt cọc phí nếu sàn yêu cầu) → tạo listing `PENDING_REVIEW` → Admin/Bot duyệt trong 2–24h → `ACTIVE`.

**Bộ trạng thái chuẩn (thống nhất tên với code):**

| Trạng thái (code `ProductStatus`) | Tài liệu gốc | Ý nghĩa |
|---|---|---|
| `Draft` | (mới) | Nháp, seller chưa gửi duyệt |
| `Pending` | `PENDING_REVIEW` | Chờ admin duyệt |
| `Active` | `ACTIVE` | Đang hiển thị, có thể mua |
| `OutOfStock` | `SOLD` | Hết hàng / đã bán hết |
| `Hidden` | `PAUSED` | Seller tạm ẩn |
| `Rejected` | `REJECTED` | Admin từ chối, cần chỉnh sửa |
| *(cần bổ sung)* `Banned` | `BANNED` | Vi phạm, khóa vĩnh viễn |

**Ánh xạ code:** `Product`, `Category`, enum `ProductStatus { Draft, Pending, Active, Rejected, Hidden, OutOfStock }`. Bàn giao tự động dùng `InventoryItem` (payload mã hóa, content hash chống trùng).

**Hiện trạng code:** ✅ Vòng đời & duyệt sản phẩm đầy đủ. 🟡 Thiếu trạng thái `Banned` (khóa vĩnh viễn). 🔴 Thiếu **cọc đăng tin** của seller.

---

## 4. Quy trình mua hàng — ESCROW MODEL (luồng cốt lõi)

Đây là state machine **chuẩn mục tiêu** theo tài liệu gốc:

```
PendingPayment → EscrowLocked → Delivering → Checking → Completed
                                                  │
                                                  ├─(timeout T+48h)→ Completed (auto-release)
                                                  └─(khiếu nại)─────→ Disputed
   bất kỳ lúc nào trước giao hàng / seller trễ → Cancelled / Refunded
```

| Bước | Ai | Hành động | Trạng thái chuẩn |
|---|---|---|---|
| 1 | Buyer | Chọn sản phẩm, "Mua ngay" | `PendingPayment` |
| 2 | Buyer | Thanh toán (ví nội bộ hoặc cổng ngoài) | *(đang xử lý)* |
| 3 | Hệ thống | Lock tiền vào Escrow | `EscrowLocked` |
| 4 | Seller | Bàn giao thông tin **trong T+2h** | `Delivering` |
| 5 | Buyer | Nhận & kiểm tra **trong 24–48h** | `Checking` |
| 6a | Buyer | Xác nhận OK → giải ngân | `Completed` |
| 6b | Hệ thống | Hết T+48h không phản hồi → **auto giải ngân** | `Completed` |
| 6c | Buyer | Khiếu nại trong hạn bảo hành | `Disputed` |

**Mốc thời gian bắt buộc:**
- Seller phải bàn giao trong **2 giờ**. Quá hạn → buyer có quyền hủy + hoàn tiền **100%** (auto-cancel).
- Buyer có **24–48h** để kiểm tra. Hết hạn không phản hồi → tự động giải ngân cho seller.

**Công thức giải ngân:** `Tiền seller nhận = Giá bán × (1 − tỷ lệ phí)`. Phần phí chuyển vào ví Platform.

**Ánh xạ code & khác biệt (cần sửa theo chuẩn):**

| Chuẩn | Enum `OrderStatus` hiện tại | Khác biệt |
|---|---|---|
| `PendingPayment` | `PendingPayment` | ✅ khớp |
| `EscrowLocked` | `Paid` | tên lệch |
| `Delivering` | `Processing` / `Delivered` | tên lệch |
| **`Checking`** | *(không có)* | 🔴 **thiếu cửa sổ kiểm tra của buyer** |
| `Completed` | `Completed` | ✅ |
| `Disputed` | `Dispute` | ✅ (khác chính tả) |
| `Refunded` / `Cancelled` | `Refunded` / `Cancelled` | ✅ |

**Hiện trạng code:** 🟡 Luồng escrow có thật trong [OrderService.cs](../backend/src/MmoMarket.Application/Orders/OrderService.cs); `EscrowReleaseAt` được set (mặc định +3 ngày). 🔴 **Không có background job** xử lý auto-release (T+48h) hay auto-cancel khi seller trễ bàn giao (T+2h) — hiện chỉ giải ngân khi buyer bấm xác nhận hoặc admin can thiệp. 🔴 Thiếu trạng thái `Checking`. ➡️ Backlog **P0**.

---

## 5. Quy trình xử lý tranh chấp (Dispute)

| Giai đoạn | Thời hạn | Hành động |
|---|---|---|
| Buyer mở tranh chấp | Trong hạn bảo hành | Upload bằng chứng: ảnh, video, log |
| Seller phản hồi | T+24h | Giải trình + bằng chứng phản bác |
| Admin xem xét | T+48h | Xem xét toàn bộ bằng chứng 2 bên |
| Phán quyết | T+72h | Hoàn tiền / Giải ngân / Chia phần |
| Kháng cáo (nếu có) | T+24h sau phán quyết | Escalate lên Senior Admin |

**Kết quả & xử lý:**

| Kết quả | Xử lý |
|---|---|
| Lỗi hoàn toàn do Seller | Hoàn 100% cho Buyer, cảnh cáo Seller |
| Lỗi một phần do Seller | Hoàn theo **% thỏa thuận**, trừ điểm uy tín |
| Buyer khiếu nại sai | Giải ngân cho Seller, trừ điểm Buyer |
| Lạm dụng tranh chấp | Khóa tài khoản 7–30 ngày |

**Ánh xạ code:** `Dispute` (code `DSP-xxxxx`, `SlaUntil` = +72h), `DisputeMessage` (kiêm bằng chứng), enum `DisputeStatus { Open, Investigating, Resolved, Closed }`. Service: [DisputeService.cs](../backend/src/MmoMarket.Application/Disputes/DisputeService.cs).

**Hiện trạng code:** ✅ Luồng mở → điều tra → phán quyết + SLA 72h đầy đủ; 3 hành động xử lý (`refund_buyer`, `release_seller`, `partial_refund`). 🟡 `partial_refund` **hardcode 50%** thay vì theo % thỏa thuận. 🔴 Chưa giới hạn lạm dụng (3 tranh chấp/tháng). Bằng chứng lưu chung trong `DisputeMessage` (chấp nhận được, không cần bảng `DisputeEvidence` riêng).

---

## 6. Mô hình thu phí chuẩn

### 6.1 Phí giao dịch theo danh mục (thu khi order `Completed`, trước giải ngân)

| Danh mục | Phí Seller | Phí Buyer | Ghi chú |
|---|---|---|---|
| Acc game thường (< 500k) | 8–10% | 0% | |
| Acc game cao cấp (≥ 500k) | 5–7% | 0% | Khuyến khích hàng giá trị cao |
| Phần mềm / License Key | 8–12% | 0% | |
| Dịch vụ MMO / cày thuê | 10–15% | 0% | Rủi ro cao hơn |
| Social / Email / SĐT ảo | 10–20% | 0% | Tỷ lệ tranh chấp cao |
| Seller VIP (theo gói) | 3–5% | 0% | Giảm phí theo gói |

### 6.2 Phí nạp / rút ví

| Phương thức | Phí nạp | Phí rút |
|---|---|---|
| Ngân hàng nội địa | 0% | 1% (min 5k) |
| MoMo / ZaloPay | 0–1% | 1–2% |
| USDT (TRC20/ERC20) | 0% | 2% + gas |
| Thẻ cào điện thoại | 10–15% chiết khấu | N/A |
| Rút nhanh (< 1 giờ) | N/A | +0.5% phụ phí |

### 6.3 Gói thành viên Seller

| Gói | Giá/tháng | Phí giao dịch | Quyền lợi |
|---|---|---|---|
| Free | 0đ | 8–10% | Tối đa 10 tin, không boost |
| Basic | 99.000đ | 6–8% | 30 tin, 5 boost/tháng |
| Pro | 299.000đ | 4–6% | Không giới hạn tin, 20 boost, badge xanh |
| VIP | 599.000đ | 3–5% | Ưu tiên top, hỗ trợ riêng, badge vàng |

### 6.4 Phí dịch vụ phụ
Đẩy tin lên top (5k–50k/lần, hiệu lực 24h) · Badge Uy tín (200k/năm, sau ≥50 đánh giá ≥4.5★) · Quảng cáo banner (CPM/CPC) · Affiliate (30–50% phí giao dịch lần đầu).

**Ánh xạ code:** Hiện chỉ có **một `fee_rate` phẳng** (mặc định 5%) lưu trong `SiteConfig`; áp trong [SellerService.cs](../backend/src/MmoMarket.Application/Sellers/SellerService.cs). Có `WalletTxnType.Commission`.

**Hiện trạng code:** 🔴 Thiếu bảng `FeeConfig` theo danh mục + Fee Engine. 🔴 Thiếu gói thành viên Seller. ➡️ Backlog **P1**.

---

## 7. Quản lý ví & dòng tiền

### 7.1 Kiến trúc ví chuẩn

| Loại ví | Chủ sở hữu | Mục đích |
|---|---|---|
| Ví Buyer | Từng Buyer | Nạp tiền, thanh toán |
| Ví Escrow | Sàn (per order) | Giữ tiền trong giao dịch |
| Ví Seller | Từng Seller | Nhận tiền sau giải ngân, rút về bank |
| Ví Platform | Sàn | Doanh thu phí giao dịch |
| Ví Reserve | Sàn | Dự phòng hoàn tiền tranh chấp |

**Dòng tiền:** Buyer nạp → Ví Buyer → (mua) move sang Ví Escrow → (hoàn tất) `(Giá − Phí)` vào Ví Seller, `Phí` vào Ví Platform → Seller rút từ Ví Seller về bank.

### 7.2 Giới hạn giao dịch (Anti-fraud)

| Đối tượng | Nạp/ngày | Rút/ngày | Điều kiện |
|---|---|---|---|
| Chưa KYC | 2.000.000đ | 1.000.000đ | Chỉ email xác minh |
| KYC CCCD | 20.000.000đ | 10.000.000đ | |
| Seller Verified | 50.000.000đ | 30.000.000đ | KYC + 6 tháng hoạt động |
| Seller VIP | Không giới hạn | 50.000.000đ | Xét duyệt riêng |

**Ánh xạ code:** Hiện dùng **ví đơn** — `User.WalletBalance` + "held balance" (tiền đang khóa trong order) tính động; ledger `WalletTxn`; rút qua `WithdrawRequest`.

**Hiện trạng code:** 🟡 Ví đơn + held balance hoạt động đúng về mặt số dư, nhưng **chưa tách ví Platform/Reserve** và **chưa có đối soát**. 🔴 Chưa có giới hạn nạp/rút theo cấp KYC. ➡️ Backlog **P1**. *Khuyến nghị:* giữ ledger đơn (đơn giản hơn), bổ sung ví Platform/Reserve dạng tài khoản logic + báo cáo đối soát thay vì refactor sang 5 ví vật lý.

---

## 8. Trust Score (Điểm uy tín Seller, 0–100)

Ảnh hưởng trực tiếp tới: thứ tự hiển thị tìm kiếm · tỷ lệ phí áp dụng · hạn mức giao dịch.

| Hành động | Thay đổi điểm |
|---|---|
| Hoàn thành giao dịch + buyer đánh giá 5★ | +2 |
| Hoàn thành không có đánh giá | +1 |
| Buyer đánh giá 1–2★ | −3 |
| Thua tranh chấp | −10 |
| Không bàn giao đúng hạn | −5 |
| Bị report vi phạm (đã xác minh) | −15 |
| Hoạt động liên tục 30 ngày không vi phạm | +5 bonus |

**Ánh xạ code:** Hiện `Seller` chỉ có `Rating` (từ review), `Badge` (verified/top/new) gán thủ công, `ReviewCount`, `TotalSold`.

**Hiện trạng code:** 🔴 Thiếu Trust Score tự động 0–100. ➡️ Backlog **P2**.

---

## 9. Bảng SLA & mốc thời gian tổng hợp

| Sự kiện | Mốc | Hệ quả nếu quá hạn |
|---|---|---|
| Seller bàn giao | T+2h | Buyer hủy + hoàn 100%, Trust −5 |
| Buyer kiểm tra | 24–48h | Auto giải ngân cho seller |
| Duyệt sản phẩm | 2–24h | — |
| Duyệt KYC | (theo admin) | — |
| Seller phản hồi tranh chấp | T+24h | Admin xử lý theo bằng chứng buyer |
| Admin phán quyết tranh chấp | T+72h | Escalate Senior Admin |
| Kháng cáo | T+24h sau phán quyết | Đóng vĩnh viễn |

---

## Phụ lục — Module & API (tham chiếu nhanh)

Module backend hiện có (Clean Architecture): Auth & Identity (JWT/2FA/Google OAuth), KYC, Product/Catalog, Order + Escrow, Wallet, Payment (MoMo/VNPay/ZaloPay/VietQR/USDT — [Payments/](../backend/src/MmoMarket.Application/Payments/)), Dispute, Notification, Admin. Enum chuẩn xem [Enums.cs](../backend/src/MmoMarket.Domain/Enums/Enums.cs).

API chính: `/api/auth/*`, `/api/kyc/submit`, `/api/products`, `/api/orders` (+ `/{id}/deliver`, `/{id}/confirm`, `/{id}/dispute`), `/api/wallet/*` (balance/deposit/withdraw/transactions). Controllers: [backend/src/MmoMarket.Api/Controllers/](../backend/src/MmoMarket.Api/Controllers/).

> Các hạng mục đánh dấu 🔴/🟡 ở trên là phần code cần điều chỉnh để khớp chuẩn. Lộ trình triển khai chi tiết & ưu tiên: xem [GAP_ANALYSIS_VA_BACKLOG.md](GAP_ANALYSIS_VA_BACKLOG.md).
