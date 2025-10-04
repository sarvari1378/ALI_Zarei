// js/canvas-handler.js (نسخه نهایی و اصلاح شده)

import { crc32, uint8ToBase64 } from './utils.js';
import { config } from './config.js'; // <-- وارد کردن کانفیگ

// --- Module State (متغیرهای سراسری ماژول) ---
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const baseImage = new Image();
baseImage.crossOrigin = "anonymous";

// آدرس تصویر قالب را به صورت داینامیک از کانفیگ می‌سازیم
const rawBaseUrl = `https://raw.githubusercontent.com/${config.github.username}/${config.github.repoName}/${config.github.branch}`;
baseImage.src = `${rawBaseUrl}/${config.paths.templateImage}`;

let ringImg = new Image();
ringImg.crossOrigin = "anonymous";
let circleImg = new Image();
circleImg.crossOrigin = "anonymous";

// --- Private Drawing Functions (توابع داخلی برای رسم) ---

/**
 * یک تصویر را با حالت ترکیبی (composite mode) مشخص روی بوم رسم می‌کند (برای QR Code).
 */
function drawImageWithMode(imgElement, inputElement) {
    if (imgElement.src && imgElement.complete) {
        const x = parseInt(inputElement.dataset.x, 10) || 100;
        const y = parseInt(inputElement.dataset.y, 10) || 100;
        const width = parseInt(inputElement.dataset.width, 10) || 100;
        const height = parseInt(inputElement.dataset.height, 10) || 100;
        ctx.globalCompositeOperation = inputElement.dataset.mode || "source-over";
        ctx.drawImage(imgElement, x, y, width, height);
        ctx.globalCompositeOperation = "source-over"; // بازگرداندن به حالت پیش‌فرض
    }
}

/**
 * تصویر انگشتر را با استفاده از ماسک "مستطیل با گوشه‌های گرد" رسم می‌کند و کادر رنگی را روی آن قرار می‌دهد.
 */
function drawCircleImage(imgElement, inputElement) {
    if (!imgElement.src || !imgElement.complete) {
        return;
    }

    // --- بخش اول: کشیدن تصویر انگشتر با برش (Clip) ---
    const scale = parseFloat(document.getElementById('slider').value);
    const offsetX = parseFloat(document.getElementById('sliderx').value);
    const offsetY = parseFloat(document.getElementById('slidery').value);

    const clipX = parseInt(inputElement.dataset.x, 10);
    const clipY = parseInt(inputElement.dataset.y, 10);
    const clipWidth = parseInt(inputElement.dataset.width, 10);
    const clipHeight = parseInt(inputElement.dataset.height, 10);
    const roundness = parseInt(inputElement.dataset.roundness, 10);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(clipX + roundness, clipY);
    ctx.arcTo(clipX + clipWidth, clipY, clipX + clipWidth, clipY + clipHeight, roundness);
    ctx.arcTo(clipX + clipWidth, clipY + clipHeight, clipX, clipY + clipHeight, roundness);
    ctx.arcTo(clipX, clipY + clipHeight, clipX, clipY, roundness);
    ctx.arcTo(clipX, clipY, clipX + clipWidth, clipY, roundness);
    ctx.closePath();
    ctx.clip();

    const centerX = clipX + clipWidth / 2;
    const centerY = clipY + clipHeight / 2;
    const newImgWidth = imgElement.width * scale;
    const newImgHeight = imgElement.height * scale;
    const imgX = centerX - newImgWidth / 2 + offsetX;
    const imgY = centerY - newImgHeight / 2 + offsetY;

    ctx.drawImage(imgElement, imgX, imgY, newImgWidth, newImgHeight);
    ctx.restore();

    // --- بخش دوم: کشیدن مستطیل رنگی روی تصویر ---
    const rectX = 1937;
    const rectY = 888;
    const rectWidth = 503.59;
    const rectHeight = 149.86;
    const rectColor = "rgba(215, 166, 107, 1)";
    const rectRoundness = 50;

    ctx.fillStyle = rectColor;
    ctx.beginPath();
    ctx.moveTo(rectX + rectRoundness, rectY);
    ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectHeight, rectRoundness);
    ctx.arcTo(rectX + rectWidth, rectY + rectHeight, rectX, rectY + rectHeight, rectRoundness);
    ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY, rectRoundness);
    ctx.arcTo(rectX, rectY, rectX + rectWidth, rectY, rectRoundness);
    ctx.closePath();
    ctx.fill();
}

// --- Exported Functions (توابع اصلی که از ماژول خارج می‌شوند) ---

/**
 * کل محتوای بوم را از نو تولید می‌کند.
 */
export function generateImage() {
    if (!baseImage.complete) return;
    canvas.width = baseImage.width;
    canvas.height = baseImage.height; // <-- اصلاح شد: base به baseImage تغییر کرد
    ctx.drawImage(baseImage, 0, 0);

    drawImageWithMode(ringImg, document.getElementById("ringImageInput"));
    drawCircleImage(circleImg, document.getElementById("circleImageInput"));

    document.querySelectorAll("input[type='text']:not(#ringImageInput), textarea").forEach(input => {
        if (input.id.includes("TextArea") || !input.value) return;
        const text = input.value;
        const x = parseInt(input.dataset.x, 10),
            y = parseInt(input.dataset.y, 10);
        const align = input.dataset.align || "left";
        const font = input.dataset.font || "EnglishFont",
            color = input.dataset.color || "#ffffffff";
        const fontSize = input.dataset.fontsize || "65";

        ctx.font = `${fontSize}px ${font}`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.direction = align === "right" ? "rtl" : "ltr";
        ctx.fillText(text, x, y);
    });
}

/**
 * یک تصویر را از ورودی فایل یا URL بارگذاری می‌کند.
 */
export function loadImage(event, imgElement) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imgElement.src = e.target.result;
            if (input.id === "circleImageInput") {
                window.uploadedRingImage = e.target.result;
            }
        };
        reader.readAsDataURL(input.files[0]);
    } else if (input.value) { // For QR code URL
        const url = input.value;
        const width = input.dataset.width || 400,
            height = input.dataset.height || 400;
        imgElement.src = `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=${width}x${height}`;
    }
}

/**
 * تصویر نهایی را با متادیتای 300 DPI دانلود می‌کند.
 */
export function downloadFinalImage() {
    const widthCm = 8.5,
        heightCm = 5.6,
        dpi = 300;
    const widthPx = Math.round(widthCm * (dpi / 2.54));
    const heightPx = Math.round(heightCm * (dpi / 2.54));

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = widthPx;
    tempCanvas.height = heightPx;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0, widthPx, heightPx);

    const pngDataUrl = tempCanvas.toDataURL('image/png');
    let binary = atob(pngDataUrl.split(',')[1]);
    let array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }

    const pixelsPerMeter = Math.round(dpi / 0.0254);
    const pHYsData = new Uint8Array(9);
    for (let i = 0; i < 4; i++) {
        pHYsData[i] = (pixelsPerMeter >>> ((3 - i) * 8)) & 0xFF;
        pHYsData[i + 4] = (pixelsPerMeter >>> ((3 - i) * 8)) & 0xFF;
    }
    pHYsData[8] = 1; // Unit: meters

    const chunkType = new Uint8Array([0x70, 0x48, 0x59, 0x73]); // "pHYs"
    const lengthBytes = new Uint8Array([0, 0, 0, 9]);

    const crcData = new Uint8Array(chunkType.length + pHYsData.length);
    crcData.set(chunkType, 0);
    crcData.set(pHYsData, chunkType.length);
    const crcVal = crc32(crcData);
    const crcBytes = new Uint8Array([(crcVal >>> 24) & 0xFF, (crcVal >>> 16) & 0xFF, (crcVal >>> 8) & 0xFF, crcVal & 0xFF]);

    const pHYsChunk = new Uint8Array(4 + 4 + 9 + 4);
    pHYsChunk.set(lengthBytes, 0);
    pHYsChunk.set(chunkType, 4);
    pHYsChunk.set(pHYsData, 8);
    pHYsChunk.set(crcBytes, 17);

    const insertPos = 8 + 25; // PNG signature (8) + IHDR chunk (25)
    let newPng = new Uint8Array(array.length + pHYsChunk.length);
    newPng.set(array.slice(0, insertPos), 0);
    newPng.set(pHYsChunk, insertPos);
    newPng.set(array.slice(insertPos), insertPos + pHYsChunk.length);

    const newDataUrl = "data:image/png;base64," + uint8ToBase64(newPng);
    const codeInput = document.getElementById('number13').value.trim();
    const fileName = codeInput ? `${codeInput}.png` : "final-image.png";

    const link = document.createElement('a');
    link.href = newDataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * رویدادهای مربوط به بوم و بارگذاری تصاویر را مقداردهی اولیه می‌کند.
 */
export function initializeCanvas() {
    document.getElementById("ringImageInput").addEventListener("change", (e) => loadImage(e, ringImg));
    document.getElementById("circleImageInput").addEventListener("change", (e) => loadImage(e, circleImg));

    baseImage.onload = generateImage;
    ringImg.onload = generateImage;
    circleImg.onload = generateImage;
}