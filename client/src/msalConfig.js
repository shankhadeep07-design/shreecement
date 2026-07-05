import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "8a04c35f-3257-4d48-968e-8cafd6dfa756",
    authority: "https://login.microsoftonline.com/c1d2e768-4a59-4122-8bba-91643841b807",
    redirectUri: "https://122.187.185.157/auth/callback",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false
  }
};

let msalInstance = null;

export function getMsalInstance() {
  if (!msalInstance && typeof window !== "undefined" && window.crypto) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  return msalInstance;
}


// Logout function
export function azureLogout() {
  const msalInstance = getMsalInstance();
  if (msalInstance) {
    msalInstance.logout({
      postLogoutRedirectUri: "https://172.21.96.150", // Redirect after logout
    }).then(() => {
      console.log("User logged out successfully.");
    }).catch((error) => {
      console.error("Error during logout:", error);
    });
  } else {
    console.warn("MSAL instance not found.");
  }
}
