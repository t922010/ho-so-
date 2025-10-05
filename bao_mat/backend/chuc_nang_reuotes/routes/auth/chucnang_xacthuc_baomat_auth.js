const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../../../cauhinh_baomat_db');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
];

// Đăng ký
router.post('/register', registerValidation, async (req, res) => {
  // Kiểm tra validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Dữ liệu không hợp lệ', 
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const result = await pool.query(
      'INSERT INTO users(email, password, created_at) VALUES($1, $2, NOW()) RETURNING id, email',
      [email, hashed]
    );
    
    res.status(201).json({ 
      message: 'Đăng ký thành công', 
      user: { id: result.rows[0].id, email: result.rows[0].email }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
});

// Đăng nhập
router.post('/login', loginValidation, async (req, res) => {
  // Kiểm tra validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Dữ liệu không hợp lệ', 
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Cấu hình cookie bảo mật
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 60 * 60 * 1000 // 1 hour
    };

    res.cookie('token', token, cookieOptions);
    res.json({ 
      message: 'Đăng nhập thành công',
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
});

// Đăng xuất
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
  res.json({ message: 'Đã đăng xuất' });
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Không có token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Tạo token mới
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email }, 
      JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 60 * 60 * 1000
    };

    res.cookie('token', newToken, cookieOptions);
    res.json({ message: 'Token đã được làm mới' });
  } catch (err) {
    res.clearCookie('token');
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
});

module.exports = router;
