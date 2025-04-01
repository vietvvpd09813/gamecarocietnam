# Caro Vietnam - Game Cờ Caro Online

Game cờ caro trực tuyến đa người chơi được phát triển với Node.js, Express, Socket.io và Tailwind CSS.

## Mô tả

Caro Vietnam là game cờ caro trực tuyến cho phép người chơi tạo phòng và chơi với bạn bè. Trò chơi có giao diện đẹp, hiệu ứng mượt mà và dễ sử dụng.

### Tính năng

- Tạo và tham gia các phòng chơi riêng
- Giao diện người dùng thẩm mỹ với hiệu ứng hoạt ảnh
- Cập nhật trạng thái game và lượt chơi theo thời gian thực
- Hiển thị kết quả trận đấu
- Tính năng chơi lại sau khi trận đấu kết thúc
- Đáp ứng cho nhiều thiết bị và kích thước màn hình

## Cài đặt

### Yêu cầu

- Node.js 12.x trở lên
- npm (Node Package Manager)

### Các bước cài đặt

1. Clone repository này:
   ```
   git clone <repository-url>
   cd gamecarocietnam
   ```

2. Cài đặt các phụ thuộc:
   ```
   npm install
   ```

3. Chạy server:
   ```
   npm start
   ```

4. Mở trình duyệt và truy cập:
   ```
   http://localhost:3000
   ```

## Cách chơi

1. Tạo phòng mới hoặc tham gia phòng có sẵn bằng mã phòng
2. Chia sẻ mã phòng với bạn bè để họ có thể tham gia
3. Khi có đủ 2 người chơi, trò chơi sẽ bắt đầu
4. Người chơi lần lượt đặt X hoặc O vào các ô trên bàn cờ
5. Người chơi đầu tiên tạo được 5 ký hiệu liên tiếp (ngang, dọc hoặc chéo) sẽ thắng
6. Sau khi trận đấu kết thúc, người chơi có thể chọn chơi lại

## Công nghệ sử dụng

- **Backend:** Node.js, Express, Socket.io
- **Frontend:** HTML5, CSS3, JavaScript
- **Styling:** Tailwind CSS
- **Icons:** Font Awesome
- **Fonts:** Google Fonts (Poppins)

## Tùy chỉnh

### Kích thước bàn cờ

Mặc định bàn cờ có kích thước 15x15. Bạn có thể thay đổi trong các file:

- `server.js`: Thay đổi giá trị trong `Array(15).fill().map(() => Array(15).fill(null))`
- `public/js/main.js`: Cập nhật vòng lặp trong hàm `renderBoard()`
- `public/css/style.css`: Thêm hoặc sửa lớp `.grid-cols-15`

## Giấy phép

[MIT License](LICENSE)

## Liên hệ

Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với tôi qua email: [email@example.com](mailto:email@example.com) 