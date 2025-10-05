-- Script tạo database và bảng cho hệ thống bảo mật
-- Chạy script này trong PostgreSQL

-- Tạo database (nếu chưa có)
-- CREATE DATABASE bao_mat;

-- Kết nối đến database bao_mat và tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tạo index cho email để tăng tốc độ tìm kiếm
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tạo bảng sessions để quản lý phiên đăng nhập (tùy chọn)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tạo index cho session_token
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);

-- Tạo bảng audit_log để ghi lại các hoạt động bảo mật
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tạo index cho audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert user mẫu để test (mật khẩu: Admin123!)
-- Lưu ý: Mật khẩu này đã được hash bằng bcrypt với 12 rounds
INSERT INTO users (email, password, role) VALUES 
('admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeLq8d4fM4z7hJ5KO', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Hiển thị thông tin bảng đã tạo
SELECT 'Database setup completed successfully!' as status;
