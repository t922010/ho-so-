//Thanh điều hướng với menu thả xuống: nhấp để bật/tắt, nhấp ra ngoài để đóng, nhấn ESC để đóng.
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  //Nhấp để bật/tắt
  navbar.querySelectorAll('li > a').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const parentLi = anchor.parentElement;
      const hasDropdown = parentLi && parentLi.querySelector('.dropdown');
      //Nếu liên kết là một toggle (có menu thả xuống và href là '#'), ngăn không cho điều hướng
      if (hasDropdown && (anchor.getAttribute('href') === '#' || anchor.getAttribute('href') === '')) {
        e.preventDefault();
        //Đóng các mục khác
        navbar.querySelectorAll('li.open').forEach(li => { if (li !== parentLi) li.classList.remove('open'); });
        parentLi.classList.toggle('open');
      }
    });
  });

  //Nhấp ra ngoài
  document.addEventListener('click', (e) => {
    const isInside = e.target.closest('.navbar');
    if (!isInside) {
      navbar.querySelectorAll('li.open').forEach(li => li.classList.remove('open'));
    }
  });

  //Nhấp để thoát
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navbar.querySelectorAll('li.open').forEach(li => li.classList.remove('open'));
    }
  });
});