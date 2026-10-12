# 🌐 Google Translate Clone - Fullstack Project

Dự án mô phỏng hoàn chỉnh ứng dụng **Google Translate** với kiến trúc client-server chuẩn mực:
- **Backend:** Node.js, Express.js RESTful API, SQLite / Database Storage.
- **Frontend:** HTML5, Modern CSS (Glassmorphism & Google Material 3 Design), Vanilla JavaScript (tối ưu, nhẹ, không phụ thuộc nặng vào build tool, hỗ trợ chạy ngay lập tức).
- **Tính năng nổi bật:**
  - 🔄 Dịch thuật văn bản đa ngôn ngữ thời gian thực (Auto-detect & 50+ ngôn ngữ).
  - 🔁 Đảo chiều ngôn ngữ (Swap source & target).
  - 🎙️ Speech-to-Text: Nhập liệu giọng nói bằng micro qua Web Speech API.
  - 🔊 Text-to-Speech: Đọc phát âm văn bản nguồn và kết quả dịch chuẩn xác.
  - ⭐ Quản lý Lịch sử (History) & Từ yêu thích (Starred / Favorites).
  - 📋 Sao chép nhanh kết quả vào clipboard & đếm số lượng ký tự.
  - 📁 Hỗ trợ tải lên file văn bản (.txt) để dịch trực tiếp.

---

## 👥 Bảng Phân Công Nhiệm Vụ (Dự Án 7 Thành Viên)

| STT | Mã sinh viên | Họ và tên | Vai trò | Phụ trách chính | File đảm nhiệm |
|:---:|:---:|:---|:---|:---|:---|
| 1 | 23BA14120 | **Đặng Việt Hoàng** | **Team Leader & System Architect** | Quản lý repo, kiến trúc hệ thống, cấu hình server tổng & routing | `server.js`, `package.json`, `.gitignore` |
| 2 | 23BA14121 | **Nguyễn Đăng Hoàng** | **Backend Core (Translation API)** | Tích hợp engine dịch thuật, tự động nhận diện ngôn ngữ (Detect Language) | `routes/translate.routes.js` |
| 3 | 23BA14107 | **Đào Trung Hiếu** | **Backend Database (History & Starred)** | Thiết kế Schema DB, viết CRUD API cho lịch sử dịch & danh sách yêu thích | `database/db.js`, `routes/history.routes.js` |
| 4 | 23BA14059 | **Nguyễn Minh Đức** | **Backend Media & File Processing** | API xử lý file (.txt), hỗ trợ định dạng dữ liệu cho Audio/TTS | `routes/translate.routes.js`, xử lý upload |
| 5 | 2410761 | **Nguyễn Tú Oanh** | **Frontend Core UI & Layout** | Dựng giao diện chuẩn Google Translate (2 box văn bản, dropdown chọn ngôn ngữ, swap button) | `public/index.html`, `public/style.css` |
| 6 | 23BA14278 | **Nguyễn Quang Thuần** | **Frontend Interactive & Audio** | Xử lý sự kiện Micro (Web Speech STT), Loa (Speech Synthesis TTS), Copy clipboard | `public/app.js` |
| 7 | *(Điền MSV)* | **Đào Minh Nguyệt** | **Frontend History & QA/Deployment** | Dựng Sidebar lịch sử & yêu thích, test luồng chức năng, viết tài liệu | `public/app.js`, `README.md`, Test Suite |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu tiên quyết:
- Cài đặt [Node.js](https://nodejs.org/) (phiên bản `>= 16.x`).

### Các bước thực hiện:

1. **Giải nén thư mục dự án và mở terminal tại thư mục đó:**
   ```bash
   cd google-translate-clone
   ```

2. **Cài đặt các thư viện phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

3. **Khởi chạy ứng dụng:**
   - Chạy môi trường thông thường:
     ```bash
     npm start
     ```
   - Hoặc chạy môi trường phát triển (tự reload khi sửa code nếu cài nodemon):
     ```bash
     npm run dev
     ```

4. **Truy cập ứng dụng:**
   Mở trình duyệt web và truy cập địa chỉ:
   ```
   http://localhost:5000
   ```

---

## 📡 Danh Sách API Endpoints

| Method | Endpoint | Chức năng | Body / Query |
|:---|:---|:---|:---|
| `POST` | `/api/translate` | Dịch văn bản | `{ "text": "...", "sourceLang": "auto", "targetLang": "vi" }` |
| `POST` | `/api/detect` | Nhận diện ngôn ngữ | `{ "text": "..." }` |
| `GET` | `/api/history` | Lấy danh sách lịch sử dịch | Không có |
| `POST` | `/api/history` | Thêm bản dịch vào lịch sử | `{ "sourceText": "...", "translatedText": "...", "sourceLang": "...", "targetLang": "..." }` |
| `DELETE`| `/api/history/:id` | Xóa 1 bản ghi lịch sử | `:id` trong URL |
| `DELETE`| `/api/history` | Xóa toàn bộ lịch sử | Không có |
| `POST` | `/api/history/toggle-star/:id` | Đánh dấu/bỏ đánh dấu sao | `:id` trong URL |

---

## 🏗️ Cấu Trúc Thư Mục

```
google-translate-clone/
├── .env.example              # Mẫu biến môi trường
├── .gitignore                # Bỏ qua node_modules, database files
├── package.json              # Khai báo dependencies & scripts
├── server.js                 # Server chính (Express.js)
├── database/
│   └── db.js                 # Khởi tạo và quản lý lưu trữ CSDL
├── routes/
│   ├── translate.routes.js   # Xử lý logic dịch thuật
│   └── history.routes.js     # Xử lý CRUD lịch sử dịch
├── public/
│   ├── index.html            # Giao diện chính (Semantic HTML5)
│   ├── style.css             # Thiết kế phong cách Google Translate
│   └── app.js                # Logic frontend: gọi API, TTS, STT, DOM
└── README.md                 # Tài liệu hướng dẫn chi tiết
```
