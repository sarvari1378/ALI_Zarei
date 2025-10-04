// js/main.js (نسخه نهایی و ماژولار)

// --- 1. Import Modules & Config ---
import { config } from './config.js';
import { extractCode, applyConfigToDOM } from './utils.js';
import { saveDataAndImage } from './data-handler.js';
import { initializeCanvas, generateImage, downloadFinalImage } from './canvas-handler.js';
import { initializePreviewToggle } from './preview-handler.js';
import { initializeSidebar, showToast, addQueueItemToUI, updateQueueItemInUI, showEmptyQueueMessage } from './ui-manager.js';

// --- 2. DOM Elements ---
const codeInput = document.getElementById("number13");
const submitBtn = document.getElementById("submitBtn");
const downloadOnlyBtn = document.getElementById("downloadOnlyBtn");

// --- 3. Upload Queue System ---
const uploadQueue = [];
let isProcessingQueue = false;

async function processQueue() {
    if (isProcessingQueue) return;
    isProcessingQueue = true;
    while (uploadQueue.length > 0) {
        const task = uploadQueue[0];
        try {
            task.status = 'uploading';
            updateQueueItemInUI(task);
            await saveDataAndImage(config.botName, task.data, task.imageBase64);
            task.status = 'success';
            updateQueueItemInUI(task);
        } catch (error) {
            console.error(`Failed to upload task ${task.id}:`, error);
            task.status = 'failure';
            updateQueueItemInUI(task);
        }
        uploadQueue.shift();
    }
    isProcessingQueue = false;
    showEmptyQueueMessage();
}

function addToQueue(productData, imageBase64) {
    const newTask = {
        id: Date.now(),
        data: productData,
        imageBase64: imageBase64,
        status: 'pending'
    };
    uploadQueue.push(newTask);
    addQueueItemToUI(newTask);
    if (!isProcessingQueue) {
        processQueue();
    }
}

// --- 4. Core Functions & Event Listeners ---
function updateTextAreas() {
    const englishInputs = ["number1", "number2", "number3", "number4", "number5", "number6"];
    const arabicInputs = ["number8", "number9", "number10", "number11", "number12", "number19"];
    const getTextFromInputs = (ids) => ids.map(id => document.getElementById(id)?.value || '').filter(Boolean).join("\n");
    document.getElementById("englishTextArea").value = getTextFromInputs(englishInputs);
    document.getElementById("arabicTextArea").value = getTextFromInputs(arabicInputs);
}

function handleCodeInputChange() {
    const codeValue = extractCode(this.value);
    const ringImageInput = document.getElementById("ringImageInput");
    ringImageInput.value = codeValue ? `https://secondone.alzareie7915.workers.dev/${codeValue}` : "";
    ringImageInput.dispatchEvent(new Event("change"));
}

function handleSubmit(event) {
    event.preventDefault();
    const extractedCode = extractCode(codeInput.value);
    if (!extractedCode) {
        showToast('کد وارد شده معتبر نیست.', 'error');
        return;
    }
    if (!window.uploadedRingImage) {
        showToast('لطفاً ابتدا یک تصویر برای انگشتر انتخاب کنید.', 'error');
        return;
    }
    downloadFinalImage();
    const productData = {
        code: extractedCode,
        title: `محصول شماره ${extractedCode}`,
        english_description: document.getElementById('englishTextArea').value,
        persian_description: document.getElementById('arabicTextArea').value,
    };
    const ringImageBase64 = window.uploadedRingImage.split(',')[1];
    addToQueue(productData, ringImageBase64);
    showToast(`محصول '${extractedCode}' به صف آپلود اضافه شد.`, 'success');
}

function setupEventListeners() {
    document.querySelectorAll("input, textarea").forEach(input => {
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
    downloadOnlyBtn.addEventListener("click", downloadOnlyBtn);
}

// --- 5. App Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    applyConfigToDOM(config);
    initializePreviewToggle();
    initializeCanvas();
    initializeSidebar(); // مقداردهی اولیه سایدبار
    setupEventListeners();
    updateTextAreas();
    generateImage();
    showEmptyQueueMessage(); // برای نمایش پیام اولیه
});
