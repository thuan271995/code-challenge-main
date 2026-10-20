# Ghi chú trình bày bài làm

Chạy và thử thay đổi code trước khi nộp. Giải thích quyết định bằng hành vi thực tế, không bằng số lượng thư viện/hook.

## Luồng demo mới

Vào `problem2`, chạy `npm ci`, `npm run dev`. Chọn cặp và nhập amount: ô nhận vẫn là “—”. **Calculate swap** hoặc Enter mới hiện số nhận, tỷ giá và USD tương ứng. Đổi amount, cặp token hoặc refresh giá sẽ xóa kết quả; cần tính lại. Không còn confirm/mô phỏng giao dịch hay delay giả.

Mở selector, tìm từ khóa không tồn tại, thử khác hoa thường và Escape. Thu nhỏ màn hình, kiểm tra số dài/focus. Mở một test và giải thích lỗi nó ngăn chặn.

## Kiến trúc

Mỗi problem độc lập. Problem1 chỉ cần Node.js; problem2 có tooling web riêng; problem3 chỉ có README phân tích và code refactor minh họa bên dưới, không có source hay tooling riêng.

Trong web, `app` ghép page/providers và `app/layout` chứa header, footer, hero, hướng dẫn. Feature swap có API adapter, model/hooks và UI. Shared không được import ngược app/feature; ESLint kiểm tra hướng này.

`useTokenPrices` sở hữu query key/cache policy. `useSwapForm` sở hữu input, validation và snapshot kết quả sau submit. `AmountField` dùng discriminated union để tách mode input/output. Finter gợi ý SCSS Modules và UI/usecase; IMS gợi ý hook/convention. Không mang business code, Relay/Recoil, Server Actions hay auth vào bài nhỏ.

Mỗi component sở hữu SCSS Module và responsive của mình. Global chỉ giữ reset. Palette/spacing/breakpoint có nguồn chung; sai tên key sẽ lỗi build. Tọa độ artwork có thể giữ số riêng vì đó không phải spacing chức năng.

## Hooks và performance

- `useState`: input và kết quả đã tính. Phép quy đổi chỉ nằm trong submit handler, không nằm trong render hay effect theo dõi input.
- `useEffect`: vòng đời dialog và cleanup timer. `useRef`: DOM dialog/input.
- Debounce 250ms chỉ cho tìm token, có cleanup. Nó không phải cache; hiện lọc local nên không tiết kiệm network request.
- `useMemo` giữ kết quả lọc khi dependencies không đổi. Với 32 token lợi ích nhỏ, không nên phóng đại.
- `memo` icon nhận props primitive. Không thêm `useCallback`, `useTransition`, `useDeferredValue` hay `useActionState` chỉ để trình diễn. React 19 không tự bật React Compiler.
- Selector tải bằng lazy/Suspense; form chính tải ngay. Icon có kích thước cố định và native lazy loading.

## Dữ liệu, precision và lỗi

Query fresh 60s, giữ cache 5 phút, retry một lần, timeout 12s, truyền AbortSignal. Freshness là policy client, không bảo đảm nguồn cung cấp giá mới; ngày tham chiếu hiển thị rõ. Không lưu giá localStorage.

Công thức: amount × priceFrom / priceTo. Decimal.js dùng precision riêng với guard digits cho miền amount/giá được chấp nhận, tránh mặc định 20 chữ số làm mất phần lẻ trước khi làm tròn. Đầu ra làm tròn xuống 8 số lẻ; USD làm tròn hiển thị riêng. Test hồi quy dùng phép toán BigInt độc lập. Precision 8 là policy demo, không phải mọi blockchain.

Kết quả giữ snapshot amount/cặp/giá/ngày giá. Khi dữ liệu đổi, kết quả cũ mất hiệu lực mà không tự tính lại.

Phân biệt input error, request error và render/module error. Query có Retry. Selector có ErrorBoundary riêng để chunk lỗi không làm mất form. Suspense không tự xử lý fetch thông thường. Chunk import lỗi có thể bị browser/React cache, nên yêu cầu reload để tải lại thay vì nút Retry giả.

## Problem1 và Problem3

Problem1: loop O(n), công thức O(1), đệ quy chia đôi O(log n). Chia trước khi nhân để intermediate không vượt miền integer an toàn. n <= 0 được công bố là empty sum.

Problem3: biến chưa khai báo, thiếu blockchain trong type và formatted data không được dùng là lỗi chắc chắn. amount > 0 là giả định nghiệp vụ. filter().sort() không mutate mảng gốc vì filter tạo mảng mới. Key chain/currency chỉ đúng cho vị thế tổng hợp; nhiều account cần ID thật.

Trong problem2, chạy `npm run check`. Tự tạo tình huống amount lớn, cache đổi giá, icon lỗi hoặc chunk lỗi để hiểu test. Nếu được hỏi về AI, mô tả trung thực phần được hỗ trợ và phần bạn đã kiểm chứng/điều chỉnh.
