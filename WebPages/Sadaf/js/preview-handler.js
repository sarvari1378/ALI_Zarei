// js/preview-handler.js

/**
 * این ماژول عملکرد دکمه مخفی/نمایان کردن پیش‌نمایش را مدیریت می‌کند.
 * همچنین padding بالای صفحه را به صورت داینامیک تنظیم می‌کند تا محتوا زیر پیش‌نمایش قرار نگیرد.
 */

// ۱. گرفتن المان‌های DOM مورد نیاز
const previewContainer = document.getElementById('previewContainer');
const pageContainer = document.querySelector('.page-container');
const togglePreviewBtn = document.getElementById('togglePreviewBtn');

/**
 * تابعی برای تنظیم padding بالای صفحه بر اساس وضعیت (مخفی یا نمایان) پیش‌نمایش.
 */
function adjustPagePadding() {
  // اگر المان‌ها در صفحه وجود نداشته باشند، برای جلوگیری از خطا تابع را متوقف می‌کنیم
  if (!previewContainer || !pageContainer) {
    console.error("Preview handler could not find required elements: #previewContainer or .page-container");
    return;
  }

  if (previewContainer.classList.contains('hidden')) {
    // وقتی پیش‌نمایش مخفی است، یک فاصله کم برای تنفس و جای دکمه لازم است
    pageContainer.style.paddingTop = '50px';
  } else {
    // وقتی پیش‌نمایش نمایان است، ارتفاع آن را محاسبه و به عنوان padding تنظیم کن
    // ۲۰ پیکسل اضافه برای ایجاد فاصله بین پیش‌نمایش و محتوای اصلی
    const previewHeight = previewContainer.offsetHeight;
    pageContainer.style.paddingTop = `${previewHeight + 20}px`;
  }
}

/**
 * تابع اصلی برای مقداردهی اولیه که همه event listener ها را تنظیم می‌کند.
 * این تابع از ماژول export می‌شود تا در main.js فراخوانی شود.
 */
export function initializePreviewToggle() {
  // اگر دکمه کنترل پیش‌نمایش در صفحه وجود نداشت، هیچ کاری انجام نمی‌دهیم
  if (!togglePreviewBtn) return;

  // ۲. تنظیم Event Listener برای دکمه کلیک
  togglePreviewBtn.addEventListener('click', () => {
    previewContainer.classList.toggle('hidden');
    
    // تغییر متن دکمه بر اساس وضعیت جدید
    togglePreviewBtn.textContent = previewContainer.classList.contains('hidden') ? 'نمایش' : 'مخفی کردن';
    
    // بعد از اتمام انیمیشن CSS (که ۳۰۰ میلی‌ثانیه است)، padding را دوباره تنظیم کن
    setTimeout(adjustPagePadding, 300);
  });

  // ۳. تنظیم Event Listener برای تغییر سایز پنجره
  // این تضمین می‌کند که با چرخاندن گوشی یا تغییر سایز پنجره مرورگر، padding همچنان درست باشد
  window.addEventListener('resize', adjustPagePadding);

  // ۴. فراخوانی اولیه تابع برای تنظیم padding در هنگام بارگذاری اولیه صفحه
  // یک تاخیر کوچک می‌دهیم تا مطمئن شویم تمام المان‌ها به درستی رندر شده‌اند
  setTimeout(adjustPagePadding, 100);
}