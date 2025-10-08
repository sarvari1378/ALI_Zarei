// Jarah/js/config.js
// !! این فایل نباید در گیت‌هاب آپلود شود !!
// !! آن را در فایل .gitignore قرار دهید !!

export const config = {
  // --- اطلاعات ربات ---
  botName: 'Jarah',

  // --- تنظیمات ریپازیتوری گیت‌هاب ---
  github: {
    username: 'sarvari1378',       // نام کاربری گیت‌هاب شما
    repoName: 'ALI_Zarei', // نام ریپازیتوری جدید شما
    branch: 'main',                       // شاخه اصلی (معمولا main)
    
    // !! مهم: توکن دسترسی شخصی جدید خود را اینجا قرار دهید !!
    pat: '6lkSMBzawUTWXNkUUpFS30ET2lUV5tEZ3VDZ1gkWGBVOyZXVNNTT5oFcXRUU4NGZH9UaOp2YDJTUqR2XvVHUoVkQ2AVUmplNwk1RNt0VBJUMx8FdhB3XiVHa0l2Z' 
  },

  // --- مسیر فایل‌های پروژه در ریپازیتوری ---
  // آدرس فایل‌ها نسبت به ریشه ریپازیتوری شما
  paths: {
    templateImage: 'assets/images/Jarah_Template.png', // مسیر تصویر قالب
    englishFont: 'assets/fonts/Humnst777BTRoman.ttf',   // مسیر فونت انگلیسی
    arabicFont: 'assets/fonts/BBaran.ttf'            // مسیر فونت عربی
  }
};
