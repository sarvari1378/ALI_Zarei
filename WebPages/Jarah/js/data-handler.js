// js/data-handler.js (نسخه اصلاح شده و ساده شده)

import { uploadFileToGitHub } from './github-api-helpers.js';
import { config } from './config.js';

function createProductJson(productData, botName) {
    const githubRawBaseUrl = `https://raw.githubusercontent.com/${config.github.username}/${config.github.repoName}/${config.github.branch}`;
    return {
      "title": productData.code,
      "englishDescription": productData.english_description,
      "persianDescription": productData.persian_description,
      "image": `${githubRawBaseUrl}/Images/${botName}/${productData.code}.jpg`
    };
}

/**
 * داده‌ها و تصویر را به صورت موازی آپلود می‌کند.
 * اگر هر کدام از آپلودها با شکست مواجه شود، این تابع یک خطا پرتاب می‌کند.
 * @param {string} botName
 * @param {object} productData
 * @param {string | null} ringImageBase64
 */
export async function saveDataAndImage(botName, productData, ringImageBase64) {
    const code = productData.code;
    
    // --- ۱. آماده‌سازی پرامیس برای آپلود JSON ---
    const jsonData = createProductJson(productData, botName);
    const jsonString = JSON.stringify(jsonData, null, 2);
    const jsonBase64 = btoa(unescape(encodeURIComponent(jsonString)));
    const jsonFilePath = `Data/${botName}/${code}.json`;
    const jsonCommitMessage = `feat(${botName}): Add/update data for product ${code}`;
    
    const jsonUploadPromise = uploadFileToGitHub(jsonFilePath, jsonBase64, jsonCommitMessage);

    // --- ۲. آماده‌سازی پرامیس برای آپلود تصویر ---
    const uploadPromises = [jsonUploadPromise]; // همیشه آپلود JSON را داریم

    if (ringImageBase64) {
        const imageFilePath = `Images/${botName}/${code}.jpg`;
        const imageCommitMessage = `feat(${botName}): Add/update ring image for product ${code}`;
        const imageUploadPromise = uploadFileToGitHub(imageFilePath, ringImageBase64, imageCommitMessage);
        uploadPromises.push(imageUploadPromise);
    }

    // --- ۳. اجرای همزمان و انتظار برای اتمام همه ---
    // Promise.all اگر یکی از پرامیس‌ها شکست بخورد، کل عملیات را با خطا متوقف می‌کند.
    // این دقیقاً همان چیزی است که ما می‌خواهیم تا در main.js آن را مدیریت کنیم.
    await Promise.all(uploadPromises);
}