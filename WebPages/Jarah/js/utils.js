// js/utils.js

/**
 * Encodes a token using a simple character shift cipher.
 * @param {string} token - The token to encode.
 * @returns {string} The encoded token.
 */
export function encodeToken(token) {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let encoded = "";
    for (let i = 0; i < token.length; i++) {
        const char = token[i];
        const index = alphabet.indexOf(char);
        if (index !== -1) {
            const newIndex = (index + 5) % alphabet.length;
            encoded += alphabet[newIndex];
        } else {
            encoded += char;
        }
    }
    return encoded;
}

/**
 * Decodes a token using a simple character shift cipher.
 * @param {string} encoded - The encoded token.
 * @returns {string} The decoded token.
 */
export function decodeToken(encoded) {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let decoded = "";
    for (let i = 0; i < encoded.length; i++) {
        const char = encoded[i];
        const index = alphabet.indexOf(char);
        if (index !== -1) {
            const newIndex = (index - 5 + alphabet.length) % alphabet.length;
            decoded += alphabet[newIndex];
        } else {
            decoded += char;
        }
    }
    return decoded;
}

/**
 * Extracts the first sequence of digits from a string.
 * @param {string} input - The string to search.
 * @returns {string} The extracted number as a string, or an empty string if not found.
 */
export function extractCode(input) {
    const match = input.match(/(\d+)/);
    return match ? match[1] : '';
}

/**
 * Calculates CRC32 checksum for a Uint8Array. This is needed for PNG DPI injection.
 * @param {Uint8Array} buf - The buffer to process.
 * @returns {number} The CRC32 checksum.
 */
export function crc32(buf) {
    let table = crc32.table;
    if (!table) {
        table = crc32.table = [];
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let k = 0; k < 8; k++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table[i] = c;
        }
    }
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
}

/**
 * Converts a Uint8Array to a Base64 string.
 * @param {Uint8Array} u8Arr - The Uint8Array to convert.
 * @returns {string} The Base64 encoded string.
 */
export function uint8ToBase64(u8Arr) {
    const CHUNK_SIZE = 0x8000;
    let index = 0;
    let result = '';
    while (index < u8Arr.length) {
        let slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, u8Arr.length));
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
    }
    return btoa(result);
}