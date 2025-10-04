// js/github-api-helpers.js (نسخه نهایی، بهینه و با دیکود توکن)

import { config } from './config.js';
import { decodeObfuscatedToken } from './utils.js'; 

function getToken() {
    return decodeObfuscatedToken(config.github.pat);
}

/**
 * یک فایل را در ریپازیتوری گیت‌هاب ایجاد یا به‌روزرسانی می‌کند (با رویکرد بهینه).
 * @param {string} filePath - مسیر کامل فایل در ریپازیتوری.
 * @param {string} base64Content - محتوای فایل به صورت Base64.
 * @param {string} commitMessage - پیام کامیت.
 * @returns {Promise<object>}
 * @throws {Error}
 */
export async function uploadFileToGitHub(filePath, base64Content, commitMessage) {
    const repoURL = `https://api.github.com/repos/${config.github.username}/${config.github.repoName}/contents/${filePath}`;
    
    // --- تابع داخلی برای ارسال درخواست PUT ---
    const makePutRequest = async (sha = null) => {
        const payload = {
            message: commitMessage,
            content: base64Content,
            branch: config.github.branch,
            ...(sha && { sha }) // فقط در صورتی که sha وجود داشته باشد، آن را اضافه کن
        };

        const response = await fetch(repoURL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${getToken()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(payload)
        });
        return response;
    };

    // --- ۱. رویکرد خوش‌بینانه: ابتدا سعی می‌کنیم فایل را به عنوان یک فایل جدید ایجاد کنیم ---
    let response = await makePutRequest();

    // --- ۲. بررسی پاسخ ---
    if (response.ok) {
        // موفقیت در تلاش اول! (فایل جدید بود)
        console.log(`File '${filePath}' created successfully.`);
        return response.json();
    }

    const errorData = await response.json();
    
    // ۳. اگر خطا به دلیل عدم وجود SHA بود (یعنی فایل وجود دارد)، آن را آپدیت می‌کنیم
    if (response.status === 422 && errorData.message.includes("sha")) {
        console.log(`File '${filePath}' already exists. Fetching SHA for update...`);
        
        try {
            // حالا درخواست GET را فقط در صورت نیاز ارسال می‌کنیم
            const getResponse = await fetch(repoURL, {
                method: 'GET',
                headers: { 'Authorization': `token ${getToken()}` }
            });
            if (!getResponse.ok) {
                throw new Error("Failed to fetch existing file's SHA.");
            }
            const fileData = await getResponse.json();
            const currentSha = fileData.sha;

            // تلاش دوم: درخواست PUT را با SHA ارسال می‌کنیم
            response = await makePutRequest(currentSha);
            
            if (response.ok) {
                console.log(`File '${filePath}' updated successfully.`);
                return response.json();
            } else {
                 const updateErrorData = await response.json();
                 throw new Error(`GitHub API Update Error (${response.status}): ${updateErrorData.message}`);
            }

        } catch (e) {
            throw new Error(`Failed during update process: ${e.message}`);
        }
    } else {
        // اگر خطا به دلیل دیگری بود، آن را گزارش می‌دهیم
        throw new Error(`GitHub API Error (${response.status}): ${errorData.message}`);
    }
}