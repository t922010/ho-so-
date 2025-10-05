// DOM elements
const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const loginBtn = document.getElementById('loginBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeInput = document.getElementById('rememberMe');

// Utility functions
function showMessage(message, type = 'error') {
  msg.textContent = message;
  msg.className = type;
  msg.style.display = 'block';
}

function hideMessage() {
  msg.style.display = 'none';
  msg.textContent = '';
  msg.className = '';
}

function setLoading(loading) {
  loginBtn.disabled = loading;
  loginBtn.textContent = loading ? 'Đang đăng nhập...' : 'Đăng nhập';
}

// Input validation
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const rememberMe = rememberMeInput.checked;

  // Client-side validation
  if (!email || !password) {
    showMessage('Vui lòng điền đầy đủ thông tin', 'error');
    return;
  }

  if (!validateEmail(email)) {
    showMessage('Email không hợp lệ', 'error');
    return;
  }

  if (!validatePassword(password)) {
    showMessage('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt', 'error');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for HttpOnly token
      body: JSON.stringify({ email, password, rememberMe })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi đăng nhập');
    }

    showMessage('Đăng nhập thành công! Đang chuyển hướng...', 'success');
    
    // Chuyển hướng sau 1.5 giây
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);

  } catch (error) {
    console.error('Login error:', error);
    
    // Xử lý các loại lỗi khác nhau
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showMessage('Không thể kết nối đến server. Vui lòng thử lại sau.', 'error');
    } else {
      showMessage(error.message || 'Có lỗi xảy ra khi đăng nhập', 'error');
    }
  } finally {
    setLoading(false);
  }
});

// Real-time validation
emailInput.addEventListener('input', () => {
  const email = emailInput.value.trim();
  if (email && !validateEmail(email)) {
    emailInput.setCustomValidity('Email không hợp lệ');
  } else {
    emailInput.setCustomValidity('');
  }
});

passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  if (password && !validatePassword(password)) {
    passwordInput.setCustomValidity('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
  } else {
    passwordInput.setCustomValidity('');
  }
});

// Clear message when user starts typing
[emailInput, passwordInput].forEach(input => {
  input.addEventListener('input', () => {
    if (msg.style.display === 'block') {
      hideMessage();
    }
  });
});

// Prevent form submission if validation fails
form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    showMessage('Vui lòng kiểm tra lại thông tin đã nhập', 'error');
  }
});

// Security: Disable right-click context menu
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Security: Disable F12, Ctrl+Shift+I, Ctrl+U
document.addEventListener('keydown', (e) => {
  if (e.key === 'F12' || 
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.key === 'u')) {
    e.preventDefault();
  }
});
















