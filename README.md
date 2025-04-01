# Caro Vietnam - Game Cờ Caro với AI

Game cờ caro đơn người chơi với trí tuệ nhân tạo, phát triển bằng Node.js, Express và Tailwind CSS.

## Mô tả

Caro Vietnam là game cờ caro cho phép người chơi đấu với máy tính AI với các cấp độ khó khác nhau. Trò chơi có giao diện đẹp với chủ đề vũ trụ, hiệu ứng hoạt ảnh mượt mà và dễ sử dụng.

### Tính năng

- Ba cấp độ AI khác nhau: Dễ, Trung bình và Khó
- Giao diện người dùng thẩm mỹ với hiệu ứng vũ trụ và hoạt ảnh
- Hệ thống tính điểm theo dõi thành tích
- Hiển thị kết quả trận đấu với hiệu ứng đẹp mắt
- Tính năng chơi lại sau khi trận đấu kết thúc
- Đáp ứng cho nhiều thiết bị và kích thước màn hình
- Dùng thuật toán AI thông minh để phân tích nước đi

## Cài đặt

### Yêu cầu

- Node.js 14.x trở lên
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

1. Chọn độ khó (Dễ, Trung bình, Khó) và bắt đầu chơi
2. Bạn luôn đi trước với quân X, máy tính sẽ là quân O
3. Đặt quân cờ của bạn trên bàn cờ bằng cách nhấp vào các ô
4. Mục tiêu là tạo thành 5 quân liên tiếp theo hàng ngang, dọc hoặc chéo
5. Sau khi trận đấu kết thúc, bạn có thể chọn chơi lại

## Trí tuệ nhân tạo

Game sử dụng thuật toán AI với các cấp độ thông minh khác nhau:

- **Dễ**: AI chỉ đặt quân ngẫu nhiên, phù hợp cho người mới bắt đầu
- **Trung bình**: AI sử dụng kết hợp của nước đi ngẫu nhiên và nước đi thông minh
- **Khó**: AI sử dụng thuật toán đánh giá bàn cờ kết hợp với tìm kiếm nước đi tối ưu

## Công nghệ sử dụng

- **Backend:** Node.js, Express
- **Frontend:** HTML5, CSS3, JavaScript
- **Styling:** Tailwind CSS
- **Icons:** Font Awesome
- **Fonts:** Google Fonts (Poppins)

## Tùy chỉnh

### Kích thước bàn cờ

Mặc định bàn cờ có kích thước 15x15. Bạn có thể thay đổi trong các file:

- `public/js/main.js`: Thay đổi giá trị khởi tạo của `gameBoard` và các hàm liên quan
- `public/css/style.css`: Thay đổi lớp `.grid-cols-15` nếu cần thiết

### Độ khó AI

Bạn có thể điều chỉnh độ khó của AI bằng cách sửa đổi các hàm trong `public/js/main.js`:

- `findRandomMove()`: Tìm nước đi ngẫu nhiên
- `findBestMove()`: Tìm nước đi tốt nhất theo đánh giá
- `evaluateBoard()`: Đánh giá giá trị của bàn cờ

## Triển khai

Dự án này có thể được triển khai trên nhiều nền tảng như Vercel, Heroku, Railway, hoặc bất kỳ dịch vụ lưu trữ Node.js nào khác.

## Giấy phép

[MIT License](LICENSE)

## Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ với tôi qua email: [email@example.com](mailto:email@example.com) 