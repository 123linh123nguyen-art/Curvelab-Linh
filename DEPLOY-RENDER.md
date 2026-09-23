# Triển khai CurveLab lên Render

CurveLab ưu tiên triển khai dưới dạng **Static Site**. Dự án cũng có sẵn `package.json` và `server.js` để tương thích với một Render **Web Service** đã được tạo trước đó và đang tự chạy `yarn start`.

## Sửa dịch vụ đang báo lỗi `Couldn't find a package.json`

Push phiên bản mới của folder này lên đúng repository/branch mà Render đang dùng, sau đó chọn **Manual Deploy → Deploy latest commit**. Render sẽ tìm thấy `package.json` và `yarn start` sẽ chạy `node server.js` trên cổng do Render cấp.

Nếu Render yêu cầu nhập thủ công:

- Runtime: `Node`
- Build Command: để trống hoặc `yarn install --frozen-lockfile`
- Start Command: `yarn start`
- Root Directory: thư mục chứa `package.json`, `server.js` và `dist`

Không đặt Root Directory là `dist`, vì `package.json` nằm ở folder cha.

## Chuẩn bị repository Git

Render triển khai từ repository Git. Đưa toàn bộ thư mục chứa `render.yaml` và thư mục `dist` lên GitHub, GitLab hoặc Bitbucket. Đừng chỉ tải riêng các tệp trong `dist` lên Render Dashboard.

Nếu repository của bạn có cấu trúc:

```text
repository/
└─ curvelab-site/
   ├─ render.yaml
   └─ dist/
```

thì chọn `curvelab-site` làm **Root Directory**. Nếu `render.yaml` và `dist` nằm ngay ở gốc repository, để Root Directory trống.

## Cách 1 — tạo Static Site bằng Dashboard

1. Vào https://dashboard.render.com/ và chọn **New → Static Site**.
2. Kết nối repository chứa CurveLab.
3. Điền các trường:
   - Name: `curvelab` hoặc một tên còn khả dụng.
   - Branch: nhánh bạn muốn công khai, thường là `main`.
   - Root Directory: theo cấu trúc repository ở trên.
   - Build Command: `echo "CurveLab is ready"`
   - Publish Directory: `dist`
4. Bấm **Create Static Site**.

Trang chính nằm tại `/`. Bàn làm việc hình học nằm tại `/studio.html#surface`; đường dẫn ngắn `/studio` cũng chuyển đến trang này.

## Cách 2 — Render Blueprint

Trong Dashboard, chọn **New → Blueprint**, kết nối repository rồi chọn tệp `render.yaml`. Blueprint sẽ tự tạo một Static Site với:

- Runtime: `static`
- Build Command: một lệnh thông báo, không cài đặt hay biên dịch
- Publish Directory: `./dist`
- Pull request previews: bật

Nếu Render báo tên `curvelab` đã được sử dụng trong workspace, đổi trường `name` trong `render.yaml`, ví dụ `curvelab-linh`, rồi push lại.

## Cập nhật website

Sau lần đầu kết nối, mỗi lần push vào branch đã chọn, Render sẽ tự triển khai lại. Nếu chưa thấy bản mới, mở trang dịch vụ → **Manual Deploy → Deploy latest commit**.

## Lỗi thường gặp

- **Not Found hoặc trang trắng:** Publish Directory phải là `dist`, tính từ Root Directory.
- **Không thấy `index.html`:** repository phải chứa `dist/index.html`.
- **Render hỏi Start Command hoặc Port:** bạn đã chọn Web Service; quay lại và chọn Static Site.
- **Blueprint không thấy `render.yaml`:** tệp phải ở gốc repository, hoặc chọn đúng Blueprint Path/Root Directory.
- **Chỉ có file ZIP:** giải nén, đưa nội dung lên một repository Git rồi kết nối repository đó với Render.
- **Deploy thành công nhưng trang báo `404 - Không tìm thấy trang`:** kiểm tra log khởi động. Bản mới sẽ in `Thu muc web: ...` và `Trang chu: da tim thay`. Nếu log ghi `KHONG TIM THAY index.html`, lần upload đó thiếu thư mục `dist` hoặc đã làm thay đổi cấu trúc. Upload cả folder `CurveLab-Render`, không chọn riêng `package.json` và `server.js`.

Tài liệu chính thức: https://render.com/docs/static-sites và https://render.com/docs/blueprint-spec
