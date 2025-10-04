// js/main.js (نسخه نهایی با جریان کاری کنترل‌شده و نمایش پیشرفت)

// --- 1. Import Modules & Config ---
import { config } from './config.js';
import { extractCode, applyConfigToDOM } from './utils.js';
import { saveDataAndImage } from './data-handler.js';
import { initializeCanvas, generateImage, downloadFinalImage } from './canvas-handler.js';
import { initializePreviewToggle } from './preview-handler.js';

// --- 2. DOM Elements ---
const codeInput = document.getElementById("number13");
const qrInput = document.getElementById("ringImageInput");
const allInputsAndSliders = document.querySelectorAll("input, textarea");

// المان‌های جدید برای مدیریت لودینگ و پیشرفت
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingStatus = document.getElementById("loadingStatus");
const jsonProgress = document.getElementById("jsonProgress");
const imageProgress = document.getElementById("imageProgress");
const submitBtn = document.getElementById("submitBtn");
const downloadOnlyBtn = document.getElementById("downloadOnlyBtn");

// --- 3. Core Functions ---

/**
 * محتوای textarea های توضیحات را به‌روز می‌کند. (بدون تغییر)
 */
function updateTextAreas() {
    const englishInputs = ["number1", "number2", "number3", "number4", "number5", "number6"];
    const arabicInputs = ["number8", "number9", "number10", "number11", "number12", "number19"];
    
    const getTextFromInputs = (ids) => {
        return ids.map(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with ID '${id}' not found in the DOM.`);
                return '';
            }
            return element.value;
        })
        .filter(Boolean)
        .join("\n");
    };

    document.getElementById("englishTextArea").value = getTextFromInputs(englishInputs);
    document.getElementById("arabicTextArea").value = getTextFromInputs(arabicInputs);
}

/**
 * آدرس QR Code را بر اساس کد محصول به‌روز می‌کند. (بدون تغییر)
 */
function handleCodeInputChange() {
    const codeValue = extractCode(this.value);
    qrInput.value = codeValue ? `https://mahdijarah.mhadijarah.workers.dev/${codeValue}` : "";
    qrInput.dispatchEvent(new Event("change"));
}

/**
 * تابع callback برای به‌روزرسانی UI پیشرفت آپلود.
 * @param {string} task - 'json' or 'image'
 * @param {string} status - 'in-progress', 'success', 'failure'
 */
function updateProgressUI(task, status) {
    const element = task === 'json' ? jsonProgress : imageProgress;
    element.classList.remove('in-progress', 'success', 'failure');
    element.classList.add(status);

    if (status === 'in-progress') {
        loadingStatus.textContent = `در حال آپلود ${task === 'json' ? 'اطلاعات متنی' : 'تصویر محصول'}...`;
    }
}

/**
 * UI پیشرفت را به حالت اولیه بازمی‌گرداند.
 */
function resetProgressUI() {
    loadingStatus.textContent = 'در حال شروع عملیات...';
    jsonProgress.classList.remove('in-progress', 'success', 'failure');
    imageProgress.classList.remove('in-progress', 'success', 'failure');
}

/**
 * فرآیند اصلی ارسال فرم با نمایش پیشرفت و کنترل جریان کاری.
 * @param {Event} event - رویداد کلیک دکمه.
 */
async function handleSubmit(event) {
    event.preventDefault();
    
    const extractedCode = extractCode(codeInput.value);
    if (!extractedCode) {
        alert('کد وارد شده معتبر نیست. لطفاً یک کد حاوی عدد وارد کنید.');
        return;
    }
    if (!window.uploadedRingImage) {
        alert('لطفاً ابتدا یک تصویر برای انگشتر انتخاب کنید.');
        return;
    }

    // --- شروع فرآیند ---
    submitBtn.disabled = true;
    downloadOnlyBtn.disabled = true;
    resetProgressUI();
    loadingOverlay.style.display = "flex";

    const productData = {
        code: extractedCode,
        title: `محصول شماره ${extractedCode}`,
        english_description: document.getElementById('englishTextArea').value,
        persian_description: document.getElementById('arabicTextArea').value,
    };
    const ringImageBase64 = window.uploadedRingImage.split(',')[1];

    try {
        await saveDataAndImage(config.botName, productData, ringImageBase64, updateProgressUI);
        
        loadingStatus.textContent = 'آپلود با موفقیت کامل شد! در حال آماده‌سازی دانلود...';
        
        setTimeout(() => {
            downloadFinalImage();
            loadingOverlay.style.display = "none";
            alert(`عملیات برای محصول '${extractedCode}' با موفقیت به پایان رسید.`);
        }, 1500); // تاخیر کوتاه برای نمایش پیام موفقیت

    } catch (error) {
        console.error("Submission failed:", error);
        loadingStatus.textContent = 'عملیات با خطا مواجه شد!';
        alert(`خطا در هنگام آپلود: ${error.message}`);
        
        setTimeout(() => {
            loadingOverlay.style.display = "none";
        }, 3000); // تاخیر برای نمایش پیام خطا
    } finally {
        // فعال‌سازی مجدد دکمه‌ها در هر صورت
        setTimeout(() => {
             submitBtn.disabled = false;
             downloadOnlyBtn.disabled = false;
        }, 1000);
    }
}

/**
 * تمام رویدادهای صفحه را تنظیم و مدیریت می‌کند.
 */
function setupEventListeners() {
    allInputsAndSliders.forEach(input => {
        if (input.id === 'number13') {
            input.addEventListener("input", handleCodeInputChange);
        }
        input.addEventListener("input", () => {
            if (input.type === 'text' || input.tagName.toLowerCase() === 'textarea') {
                updateTextAreas();
            }
            generateImage();
        });
    });

    submitBtn.addEventListener("click", handleSubmit);
    downloadOnlyBtn.addEventListener("click", downloadFinalImage);
}

// --- 4. App Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    applyConfigToDOM(config);
    initializePreviewToggle();
    initializeCanvas();
    setupEventListeners();
    updateTextAreas();
    generateImage();
});