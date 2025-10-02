// js/data-handler.js

import { uploadFileToGitHub } from './github-api-helpers.js';

/**
 * یک آبجکت JSON با فرمت دلخواه کاربر ایجاد می‌کند.
 * @param {object} productData - داده‌های جمع‌آوری شده از فرم.
 * @param {string} botName - نام ربات برای ساخت URL تصویر.
 * @returns {object} - آبجکت JSON آماده برای ذخیره‌سازی.
 */
function createProductJson(productData, botName) {
    // آدرس پایه برای فایل‌های خام در ریپازیتوری شما
    const githubRawBaseUrl = "https://raw.githubusercontent.com/sarvari1378/SHOP_Creator/main";

    return {
      // ۱. کلید title فقط شامل کد محصول است
      "title": productData.code,

      // ۲. توضیحات به صورت دو کلید جداگانه و مسطح
      "englishDescription": productData.english_description,
      "persianDescription": productData.persian_description,

      // ۳. آدرس کامل و قابل دسترسی به تصویر
      "image": `${githubRawBaseUrl}/Images/${botName}/${productData.code}.jpg`
    };
}

/**
 * داده‌های محصول و تصویر آن را به ریپازیتوری گیت‌هاب در پوشه مخصوص ربات آپلود می‌کند.
 * @param {string} botName - نام ربات (e.g., 'Jarah').
 *  @param {object} productData - داده‌های محصول از فرم.
 * @param {string | null} ringImageBase64 - تصویر انگشتر به صورت Base64.
 */
export async function saveDataAndImage(botName, productData, ringImageBase64) {
    const code = productData.code;

    // --- ۱. آپلود فایل JSON ---
    // تابع createProductJson را با پارامترهای جدید فراخوانی می‌کنیم
    const jsonData = createProductJson(productData, botName);
    const jsonString = JSON.stringify(jsonData, null, 2); // فرمت‌دهی زیبا
    const jsonBase64 = btoa(unescape(encodeURIComponent(jsonString)));
    
    const jsonFilePath = `Data/${botName}/${code}.json`;
    const jsonCommitMessage = `feat(${botName}): Add/update data for product ${code}`;
    
    try {
        console.log(`Uploading JSON data for product ${code} with new format...`);
        await uploadFileToGitHub(jsonFilePath, jsonBase64, jsonCommitMessage);
        console.log("JSON data uploaded successfully.");
    } catch (error) {
        throw new Error(`Failed to upload JSON file: ${error.message}`);
    }

    // --- ۲. آپلود تصویر انگشتر (بدون تغییر) ---
    if (ringImageBase64) {
        const imageFilePath = `Images/${botName}/${code}.jpg`;
        const imageCommitMessage = `feat(${botName}): Add/update ring image for product ${code}`;
        try {
            console.log(`Uploading ring image for product ${code}...`);
            await uploadFileToGitHub(imageFilePath, ringImageBase64, imageCommitMessage);
            console.log("Ring image uploaded successfully.");
        } catch (error) {
            console.warn(`Could not upload ring image. Error: ${error.message}`);
        }
    }
}