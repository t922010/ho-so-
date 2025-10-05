const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ 
      message: 'Bạn chưa đăng nhập',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Kiểm tra token có hết hạn không
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ 
        message: 'Token đã hết hạn',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Thêm thông tin user vào request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp
    };
    
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token đã hết hạn',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: 'Token không hợp lệ',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(500).json({ 
      message: 'Lỗi xác thực token',
      code: 'AUTH_ERROR'
    });
  }
}

// Middleware kiểm tra role (nếu cần)
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }
    
    // Giả sử có field role trong user
    if (req.user.role && req.user.role !== role) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    next();
  };
}

// Middleware kiểm tra admin
function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

module.exports = { 
  verifyToken, 
  requireRole, 
  requireAdmin 
};