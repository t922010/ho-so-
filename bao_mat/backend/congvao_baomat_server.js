// server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { WebSocketServer } = require('ws');

// Import routes và middleware
const authRoutes = require('./chuc_nang_reuotes/routes/auth/chucnang_xacthuc_baomat_auth');
const { verifyToken } = require('./trung_gian_middleware/routes/auth/trunggian_xacthuc_baomat_auth');

const app = express();

// Cấu hình helmet với CSP tùy chỉnh
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Middleware cơ bản
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Giới hạn request chung (chống brute-force)
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Quá nhiều requests từ IP này, vui lòng thử lại sau',
  standardHeaders: true,
  legacyHeaders: false,
});

// Giới hạn request cho auth endpoints (chặt chẽ hơn)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5,
  message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// Routes với rate limiting riêng cho auth
app.use('/api/auth', authLimiter, authRoutes);

// Route bảo mật mẫu
app.get('/api/secure', verifyToken, (req, res) => {
  res.json({ 
    message: `Xin chào user ${req.user.id}, bạn đã vào được route bảo mật!`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Không leak thông tin lỗi trong production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    message: isDevelopment ? err.message : 'Có lỗi xảy ra trên server',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route không tồn tại' });
});

// Start HTTP server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// WebSocket server kết hợp với HTTP server
const wss = new WebSocketServer({ server });
wss.on('connection', ws => {
  console.log('Client đã kết nối WS');
  ws.send('Chào mừng tới WebSocket server!');

  ws.on('message', message => {
    console.log('Nhận message từ client:', message.toString());
    // Có thể broadcast hoặc xử lý message tùy ý
  });
});

module.exports = { app, wss }; // nếu muốn import ở file khác
 
