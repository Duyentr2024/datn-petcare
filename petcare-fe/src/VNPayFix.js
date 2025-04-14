/**
 * VNPayFix.js
 * File này chứa các hàm sửa lỗi cho VNPay integration
 */

// Định nghĩa các biến và hàm toàn cục cần thiết cho VNPay
window.timer = null;
var timer = null;
window.updateTime = function() { return true; };
function updateTime() { return true; };

// Patch để chặn lỗi liên quan đến VNPay
const fixVNPayErrors = () => {
  console.log('[VNPayFix] Applying fixes for VNPay integration');
  
  // Đảm bảo timer và updateTime luôn tồn tại
  setInterval(() => {
    window.timer = window.timer || null;
    timer = timer || null;
    window.updateTime = window.updateTime || function() { return true; };
    updateTime = updateTime || function() { return true; };
  }, 50);
  
  // Chặn lỗi từ VNPay
  window.addEventListener('error', function(event) {
    if (event.message && (
        event.message.includes('timer is not defined') || 
        event.message.includes('updateTime is not defined')
    )) {
      console.log('[VNPayFix] Suppressing error:', event.message);
      event.preventDefault();
      return true;
    }
  }, true);
  
  // Ghi đè các lỗi console để bỏ qua lỗi VNPay
  const originalConsoleError = console.error;
  console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('timer is not defined')) {
      console.log('[VNPayFix] Suppressing console error about timer');
      return;
    }
    originalConsoleError.apply(console, args);
  };
};

// Thực thi fix
fixVNPayErrors();

export default fixVNPayErrors; 