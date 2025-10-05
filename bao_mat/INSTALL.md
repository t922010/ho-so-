# Hướng dẫn Cài đặt Hệ thống Bảo mật

## Yêu cầu hệ thống

### 1. Phần mềm cần thiết
- **Node.js** (v14 hoặc cao hơn) - [Tải tại đây](https://nodejs.org/)
- **PostgreSQL** (v12 hoặc cao hơn) - [Tải tại đây](https://www.postgresql.org/download/)
- **Git** (tùy chọn) - [Tải tại đây](https://git-scm.com/)

### 2. Kiểm tra cài đặt
```bash
node --version    # Phải >= v14.0.0
npm --version     # Phải >= v6.0.0
psql --version    # Phải >= v12.0.0
```

## Cài đặt từng bước

### Bước 1: Chuẩn bị Database

1. **Khởi động PostgreSQL**
   ```bash
   # Windows (nếu cài đặt bằng installer)
   # PostgreSQL sẽ tự động khởi động như service
   
   # Linux/Mac
   sudo systemctl start postgresql
   ```

2. **Tạo database**
   ```sql
   -- Kết nối PostgreSQL với user postgres
   psql -U postgres
   
   -- Tạo database
   CREATE DATABASE bao_mat;
   
   -- Thoát psql
   \q
   ```

### Bước 2: Cài đặt Backend

1. **Mở Command Prompt/Terminal và chuyển đến thư mục backend**
   ```bash
   cd "D:\NAM.lt\html.beta\ho_so_beta\bao_mat\backend"
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Cấu hình file .env** (đã được tạo tự động)
   - File `.env` đã được tạo với cấu hình mặc định
   - Bạn có thể chỉnh sửa nếu cần

4. **Thiết lập database**
   ```bash
   npm run setup
   ```

### Bước 3: Khởi động Server

#### Cách 1: Sử dụng script tự động (Khuyến nghị)
```bash
# Windows
start_server.bat

# Linux/Mac
chmod +x start_server.sh
./start_server.sh
```

#### Cách 2: Chạy thủ công
```bash
npm start
```

### Bước 4: Kiểm tra cài đặt

1. **Mở trình duyệt và truy cập:**
   ```
   http://localhost:3000
   ```

2. **Test đăng nhập với tài khoản mẫu:**
   - Email: `admin@example.com`
   - Password: `Admin123!`

## Cấu trúc thư mục sau khi cài đặt

```
bao_mat/
├── backend/
│   ├── node_modules/          # Dependencies
│   ├── .env                   # Cấu hình môi trường
│   ├── package.json           # Thông tin project
│   ├── congvao_baomat_server.js  # Server chính
│   ├── setup_database.js      # Script setup DB
│   ├── setup_database.sql     # SQL script
│   ├── start_server.bat       # Script khởi động (Windows)
│   └── chuc_nang_reuotes/     # API routes
├── frontend/
│   ├── bao_mat.html           # Trang đăng nhập
│   ├── bao_mat.css            # Stylesheet
│   └── bao_mat.js             # JavaScript
├── SECURITY.md                # Tài liệu bảo mật
└── INSTALL.md                 # Hướng dẫn cài đặt
```

## Xử lý sự cố

### Lỗi "Cannot connect to database"
1. Kiểm tra PostgreSQL có đang chạy không
2. Kiểm tra thông tin kết nối trong file `.env`
3. Kiểm tra firewall có chặn port 5432 không

### Lỗi "Port 3000 is already in use"
1. Thay đổi port trong file `.env`:
   ```env
   PORT=3001
   ```
2. Hoặc dừng process đang sử dụng port 3000

### Lỗi "Module not found"
1. Chạy lại:
   ```bash
   npm install
   ```

### Lỗi "Permission denied"
1. Chạy Command Prompt với quyền Administrator
2. Hoặc sử dụng:
   ```bash
   npm install --force
   ```

## Cấu hình Production

### 1. Thay đổi file .env cho production:
```env
NODE_ENV=production
JWT_SECRET=your_super_strong_secret_key_here
DB_PASS=your_strong_database_password
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
```

### 2. Sử dụng HTTPS:
- Cài đặt SSL certificate
- Cấu hình reverse proxy (Nginx/Apache)
- Redirect HTTP sang HTTPS

### 3. Backup database:
```bash
pg_dump -U postgres bao_mat > backup.sql
```

## Liên hệ hỗ trợ

Nếu gặp vấn đề trong quá trình cài đặt, vui lòng:
1. Kiểm tra log trong console
2. Xem file SECURITY.md để biết thêm chi tiết
3. Đảm bảo đã cài đặt đầy đủ các yêu cầu hệ thống

---
**Lưu ý**: Đây là hệ thống bảo mật, vui lòng thay đổi mật khẩu mặc định trước khi sử dụng trong môi trường production!
