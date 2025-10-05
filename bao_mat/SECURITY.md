# Hướng dẫn Bảo mật Hệ thống

## Tổng quan
Hệ thống bảo mật này được thiết kế với các biện pháp bảo mật tiêu chuẩn để bảo vệ dữ liệu người dùng và ngăn chặn các cuộc tấn công phổ biến.

## Các tính năng bảo mật đã triển khai

### 1. Xác thực và Ủy quyền
- **JWT Token**: Sử dụng JSON Web Token với thời gian hết hạn
- **HttpOnly Cookies**: Token được lưu trong cookie HttpOnly để tránh XSS
- **Bcrypt Hashing**: Mật khẩu được hash với bcrypt (12 rounds)
- **Input Validation**: Validation nghiêm ngặt cho email và mật khẩu
- **Rate Limiting**: Giới hạn số lần đăng nhập thất bại

### 2. Bảo vệ chống tấn công
- **Helmet.js**: Bảo vệ khỏi các lỗ hổng HTTP headers
- **CSP (Content Security Policy)**: Ngăn chặn XSS attacks
- **SQL Injection Protection**: Sử dụng parameterized queries
- **CSRF Protection**: SameSite cookie attributes
- **Brute Force Protection**: Rate limiting cho auth endpoints

### 3. Cấu hình bảo mật
- **Environment Variables**: Tách biệt config nhạy cảm
- **Secure Headers**: Các header bảo mật được cấu hình
- **Error Handling**: Không leak thông tin lỗi trong production
- **Input Sanitization**: Làm sạch và validate input

## Cài đặt và Triển khai

### 1. Cài đặt Dependencies
```bash
cd backend
npm install
```

### 2. Cấu hình Environment
Tạo file `.env` với nội dung:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bao_mat
DB_USER=postgres
DB_PASS=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=1h

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
```

### 3. Thiết lập Database
```sql
CREATE DATABASE bao_mat;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Chạy Server
```bash
npm start
```

## Quy tắc Mật khẩu
- Tối thiểu 8 ký tự
- Phải có ít nhất 1 chữ hoa
- Phải có ít nhất 1 chữ thường  
- Phải có ít nhất 1 số
- Phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)

## API Endpoints

### POST /api/auth/register
Đăng ký tài khoản mới
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### POST /api/auth/login
Đăng nhập
```json
{
  "email": "user@example.com", 
  "password": "SecurePass123!",
  "rememberMe": true
}
```

### POST /api/auth/logout
Đăng xuất

### POST /api/auth/refresh
Làm mới token

### GET /api/secure
Truy cập route bảo mật (cần token)

## Bảo mật Production

### 1. HTTPS
- Sử dụng SSL/TLS certificate
- Redirect HTTP sang HTTPS
- HSTS headers

### 2. Environment
```env
NODE_ENV=production
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
```

### 3. Database
- Sử dụng connection pooling
- Encrypt sensitive data
- Regular backups
- Access controls

### 4. Monitoring
- Log security events
- Monitor failed login attempts
- Alert on suspicious activity

## Kiểm tra Bảo mật

### 1. Penetration Testing
- SQL Injection tests
- XSS vulnerability scans
- CSRF protection tests
- Authentication bypass attempts

### 2. Code Review
- Input validation
- Error handling
- Token management
- Access controls

### 3. Security Headers
Sử dụng tools như:
- Security Headers Scanner
- Mozilla Observatory
- SSL Labs Test

## Xử lý Sự cố Bảo mật

### 1. Compromised Account
1. Immediately disable account
2. Force password reset
3. Review access logs
4. Notify affected users

### 2. Token Breach
1. Invalidate all tokens
2. Force re-authentication
3. Review token generation process
4. Update JWT secret

### 3. Database Breach
1. Isolate affected systems
2. Assess data exposure
3. Notify authorities if required
4. Implement additional monitoring

## Liên hệ
Nếu phát hiện lỗ hổng bảo mật, vui lòng báo cáo qua email bảo mật.

---
**Lưu ý**: Tài liệu này được cập nhật thường xuyên. Vui lòng kiểm tra phiên bản mới nhất.
