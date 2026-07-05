// authConfig.js
const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
    authority: process.env.REACT_APP_AZURE_AUTHERITY,
    redirectUri: process.env.REACT_APP_AZURE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export default msalConfig;
