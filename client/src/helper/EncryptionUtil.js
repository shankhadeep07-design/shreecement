import CryptoJS from 'crypto-js';

const EncryptionUtil = {
  encryptData: (data, secretKey) => {
    const encryptedData = CryptoJS.AES.encrypt(data, secretKey).toString();
    return encryptedData;
  },

  decryptData: (encryptedData, secretKey) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
  },
};

export default EncryptionUtil;
