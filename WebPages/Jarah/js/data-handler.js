// js/data-handler.js (نسخه جدید با گزارش پیشرفت)

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
 * داده‌ها و تصویر را به صورت موازی آپلود می‌کند و وضعیت را از طریق یک callback گزارش می‌دهد.
 * @param {string} botName
 * @param {object} productData
 * @param {string | null} ringImageBase64
 * @param {function(string, string): void} onProgress - یک تابع callback برای گزارش پیشرفت. 
 *        آرگومان اول: 'json' یا 'image'. آرگومان دوم: 'in-progress', 'success', 'failure'.
 */
export async function saveDataAndImage(botName, productData, ringImageBase64, onProgress) {
    const code = productData.code;
    const uploadPromises = [];

    // --- ۱. آپلود JSON ---
    const jsonData = createProductJson(productData, botName);
    const jsonString = JSON.stringify(jsonData, null, 2);
    const jsonBase64 = btoa(unescape(encodeURIComponent(jsonString)));
    const jsonFilePath = `Data/${botName}/${code}.json`;
    const jsonCommitMessage = `feat(${botName}): Add/update data for product ${code}`;
    
    const jsonUploadPromise = (async () => {
        try {
            onProgress('json', 'in-progress');
            await uploadFileToGitHub(jsonFilePath, jsonBase64, jsonCommitMessage);
            onProgress('json', 'success');
        } catch (error) {
            onProgress('json', 'failure');
            throw new Error(`Failed to upload JSON file: ${error.message}`);
        }
    })();
    uploadPromises.push(jsonUploadPromise);

    // --- ۲. آپلود تصویر ---
    if (ringImageBase64) {
        const imageFilePath = `Images/${botName}/${code}.jpg`;
        const imageCommitMessage = `feat(${botName}): Add/update ring image for product ${code}`;

        const imageUploadPromise = (async () => {
            try {
                onProgress('image', 'in-progress');
                await uploadFileToGitHub(imageFilePath, ringImageBase64, imageCommitMessage);
                onProgress('image', 'success');
            } catch (error) {
                onProgress('image', 'failure');
                // اگر آپلود تصویر حیاتی است، خطا را پرتاب می‌کنیم تا Promise.all شکست بخورد
                throw new Error(`Could not upload ring image: ${error.message}`);
            }
        })();
        uploadPromises.push(imageUploadPromise);
    } else {
        // اگر تصویری برای آپلود وجود ندارد، باید این مرحله را هم موفق در نظر بگیریم
        onProgress('image', 'success'); // یا می‌توانید یک وضعیت 'skipped' تعریف کنید
    }

    // --- ۳. اجرای همزمان و انتظار برای اتمام همه ---
    await Promise.all(uploadPromises);
}