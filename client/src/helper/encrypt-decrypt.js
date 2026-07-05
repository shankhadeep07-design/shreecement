import CryptoJS from "crypto-js";

// Encrypt data using CryptoJS
export const encryptData = (data) => {
    const secretKey = "your-secret-key";
    const keyToEncrypt = data; // Replace with your key
    const encryptedKey = CryptoJS.AES.encrypt(keyToEncrypt, secretKey).toString();
    return encryptedKey
};

// Decrypt data using CryptoJS
export const decryptData = (encryptedData) => {
    const secretKey = "your-secret-key";
    const encryptedKey = encryptedData; // Retrieve the encrypted key
    const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, secretKey).toString(CryptoJS.enc.Utf8);
    return decryptedKey
};