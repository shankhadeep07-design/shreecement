import secureLocalStorage from "react-secure-storage";

const TOKEN_KEY = "auth_token";

const authUtils = {
  saveToken: (token) => {
    secureLocalStorage.setItem(TOKEN_KEY, token);
  },

  getToken: () => {
    const token = secureLocalStorage.getItem(TOKEN_KEY);
    return token ? token : null;
  },

  removeToken: () => {
    secureLocalStorage.removeItem(TOKEN_KEY);
  }
};

export default authUtils;
