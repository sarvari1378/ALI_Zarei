// js/main.js

// --- 1. Configuration (تنظیمات اصلی) ---
// برای استفاده از این صفحه برای یک ربات دیگر، فقط این مقدار را تغییر دهید.
const BOT_NAME = 'Jarah';

// --- 2. Import Modules (وارد کردن ماژول‌ها) ---
import { extractCode } from './utils.js';
import { saveDataAndImage } from './data-handler.js';
import { initializeCanvas, generateImage, downloadFinalImage } from './canvas-handler.js';
import { initializePreviewToggle } from './preview-handler.js';

// --- 3. DOM Elements (انتخاب المان‌های مورد نیاز) ---
const codeInput = document.getElementById("number13");
const qrInput = document.getElementById("ringImageInput");
const allInputsAndSliders = document.querySelectorAll("input, textarea");
const loadingOverlay = document.getElementById("loadingOverlay");

// --- 4. Core Functions (توابع اصلی برنامه) ---

/**
 * محتوای textarea های توضیحات (انگلیسی و عربی) را بر اساس ورودی‌های فرم به‌روز می‌کند.
 */
function updateTextAreas() {
    const englishInputs = ["number1", "number2", "number3", "number4", "number5", "number6"];
    const arabicInputs = ["number8", "number9", "number10", "number11", "number12", "number19"];
    
    // تابع کمکی داخلی برای جلوگیری از تکرار کد و مدیریت خطای احتمالی
    const getTextFromInputs = (ids) => {
        return ids.map(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with ID '${id}' not found in the DOM.`);
                return ''; // اگر المان پیدا نشد، یک رشته خالی برگردان
            }
            return element.value;
        })
        .filter(Boolean) // حذف مقادیر خالی از آرایه
        .join("\n");
    };

    document.getElementById("englishTextArea").value = getTextFromInputs(englishInputs);
    document.getElementById("arabicTextArea").value = getTextFromInputs(arabicInputs);
}

/**
 * با تغییر ورودی کد محصول، آدرس QR Code را ساخته و فیلد مربوطه را به‌روز می‌کند.
 */
function handleCodeInputChange() {
    const codeValue = extractCode(this.value);
    qrInput.value = codeValue ? `https://mahdijarah.mhadijarah.workers.dev/${codeValue}` : "";
    // رویداد 'change' را به صورت دستی فعال می‌کنیم تا ماژول canvas تصویر QR جدید را بارگذاری کند.
    qrInput.dispatchEvent(new Event("change"));
}

/**
 * فرآیند اصلی ارسال فرم: داده‌ها را جمع‌آوری کرده و به data-handler برای آپلود می‌سپارد.
 * @param {Event} event - رویداد کلیک دکمه.
 */
async function handleSubmit(event) {
    event.preventDefault(); // جلوگیری از رفتار پیش‌فرض فرم
    loadingOverlay.style.display = "flex";

    const extractedCode = extractCode(codeInput.value);
    if (!extractedCode) {
        alert('کد وارد شده معتبر نیست. لطفاً یک کد حاوی عدد وارد کنید.');
        loadingOverlay.style.display = "none";
        return;
    }

    const productData = {
        code: extractedCode,
        title: `محصول شماره ${extractedCode}`, // می‌توانید این را پویا کنید
        english_description: document.getElementById('englishTextArea').value,
        persian_description: document.getElementById('arabicTextArea').value,
    };

    // تصویر انگشتر را از متغیر گلوبال (که در canvas-handler ست شده) می‌خوانیم
    const ringImageBase64 = window.uploadedRingImage ? window.uploadedRingImage.split(',')[1] : null;

    try {
        await saveDataAndImage(BOT_NAME, productData, ringImageBase64);
        alert(`داده‌های ربات '${BOT_NAME}' با موفقیت در ریپازیتوری ذخیره شدند.`);
        downloadFinalImage(); // در صورت موفقیت، طرح نهایی را برای کاربر دانلود کن
    } catch (error) {
        console.error("Submission failed:", error);
        alert(`عملیات با خطا مواجه شد: ${error.message}`);
    } finally {
        loadingOverlay.style.display = "none"; // در هر صورت (موفقیت یا شکست) لودینگ را مخفی کن
    }
}

/**
 * تمام رویدادهای صفحه را تنظیم و مدیریت می‌کند.
 */
function setupEventListeners() {
    // یک رویداد کلی برای تمام ورودی‌ها و اسلایدرها
    allInputsAndSliders.forEach(input => {
        // برای فیلد کد، رویداد جداگانه‌ای داریم
        if (input.id === 'number13') {
            input.addEventListener("input", handleCodeInputChange);
        }
        // بقیه input ها، textarea ها و range ها تصویر را بازسازی می‌کنند
        input.addEventListener("input", () => {
             // فقط در صورتی که فیلد متنی باشد، توضیحات را آپدیت کن
            if (input.type === 'text' || input.tagName.toLowerCase() === 'textarea') {
                updateTextAreas();
            }
            generateImage();
        });
    });

    // رویدادهای کلیک برای دکمه‌های اصلی
    document.getElementById("submitBtn").addEventListener("click", handleSubmit);
    document.getElementById("downloadOnlyBtn").addEventListener("click", downloadFinalImage);
}

// --- 5. App Initialization (نقطه شروع برنامه) ---
/**
 * این تابع پس از بارگذاری کامل ساختار HTML صفحه (DOM) اجرا می‌شود.
 */
document.addEventListener("DOMContentLoaded", () => {
    // ۱. مقداردهی اولیه ماژول‌های مستقل
    initializePreviewToggle(); // کنترل پیش‌نمایش را فعال می‌کند.
    initializeCanvas();       // رویدادهای مربوط به canvas را تنظیم می‌کند.

    // ۲. تنظیم رویدادهای اصلی این فایل
    setupEventListeners();

    // ۳. فراخوانی اولیه توابع برای نمایش وضعیت اولیه صحیح در هنگام بارگذاری صفحه
    updateTextAreas();
    generateImage();
});
