import { ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

export const metadata = { title: "Cơ chế Escrow | MMO Market" };

export default function EscrowPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ShieldCheck className="size-10 text-success" />
        <h1 className="mt-4 text-3xl font-extrabold text-text md:text-4xl">
          Cơ chế Escrow — Trung gian giữ tiền
        </h1>
        <p className="mt-3 text-sm leading-7 text-text-muted">
          Toàn bộ giao dịch trên MMO Market đều áp dụng cơ chế escrow:
          tiền của buyer được hệ thống giữ lại trong một khoảng thời gian xác định
          trước khi giải phóng cho seller.
        </p>

        <div className="prose prose-invert mt-8 max-w-none text-sm leading-7 text-text-muted">
          <h2 className="text-text">1. Khi đặt hàng</h2>
          <p>
            Tiền được trừ ngay khỏi ví / cổng thanh toán của buyer và lưu trong
            tài khoản trung gian của sàn. Seller chưa nhận được tiền tại thời điểm này.
          </p>

          <h2 className="text-text">2. Khi giao hàng</h2>
          <p>
            Đối với sản phẩm auto-delivery, hệ thống lập tức giao trong vòng 5 giây.
            Đối với sản phẩm manual, seller có 24 giờ để giao. Trong cả 2 trường hợp,
            tiền vẫn nằm trong tài khoản trung gian.
          </p>

          <h2 className="text-text">3. Cửa sổ kiểm tra 72 giờ</h2>
          <p>
            Sau khi đơn được giao, buyer có 72 giờ để kiểm tra. Trong thời gian này có
            thể xác nhận đã nhận, đánh giá hoặc khiếu nại.
          </p>

          <h2 className="text-text">4. Giải phóng tiền</h2>
          <p>
            Sau 72 giờ không có khiếu nại, hoặc khi buyer xác nhận đã nhận, tiền sẽ
            được giải phóng cho seller (đã trừ phí sàn 4-6%). Tiền được chuyển vào ví
            seller, sẵn sàng để rút.
          </p>

          <h2 className="text-text">5. Khi có khiếu nại</h2>
          <p>
            Tiền sẽ bị giữ thêm cho đến khi tranh chấp được giải quyết. Đội ngũ
            Compliance sẽ điều tra trong 48-72 giờ và đưa ra quyết định cuối cùng.
            Nếu buyer thắng, tiền hoàn 100% (sàn không thu phí); nếu seller thắng,
            tiền được giải phóng bình thường.
          </p>

          <h2 className="text-text">Lợi ích của Escrow</h2>
          <ul className="list-disc pl-5">
            <li>Buyer được bảo vệ 100% trong cửa sổ 72h</li>
            <li>Seller không sợ bị &ldquo;bùng&rdquo; khi giao hàng</li>
            <li>Sàn có lịch sử giao dịch minh bạch — không có &ldquo;khoản tiền ẩn&rdquo;</li>
            <li>Mọi quyết định đều có log audit, có thể truy vết</li>
          </ul>
        </div>
      </div>
    </SiteShell>
  );
}
