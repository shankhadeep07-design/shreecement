import secureLocalStorage from "react-secure-storage";

import { jwtDecode } from "jwt-decode";
import { myAxios, privateAxios } from "../services/Helper";



export const isTokenExpired = (token) => {
  try {
    const decodedToken = jwtDecode(token);
  
    // If the expiration time in the token is in seconds, convert it to milliseconds
    const expirationTime = decodedToken.exp * 1000; // Assuming exp is in seconds

    return expirationTime < Date.now();
  } catch (error) {
    return true; // Treat as expired if decoding fails
  }
};

export const userDetails = () => {
  let data = secureLocalStorage.getItem("token");
  if(data)
  {
    const token = JSON.parse(data);
    const decodedToken = jwtDecode(token);
    return decodedToken
  }
  else
    return false;
  
}

export const isLoggedIn = () => {
  let data = secureLocalStorage.getItem("token");
  const token = JSON.parse(data);
  try {
    if (
      (token == (null || undefined) && isTokenExpired(token)) ||
      (token !== (null || undefined) && isTokenExpired(token))
    ) {
      // Token is expired, perform logout or other actions
      secureLocalStorage.removeItem("token");
      return false;
    } else {
      // Token is still valid
      return true;
    }
  } catch (error) {
  }
};


export const isAsyncLoggedIn = function() {
  return new Promise((resolve, reject) => {
    let data = secureLocalStorage.getItem("token");
    const token = JSON.parse(data);
    try {
      if (
        (token == (null || undefined) && isTokenExpired(token)) ||
        (token !== (null || undefined) && isTokenExpired(token))
      ) {
        secureLocalStorage.removeItem("token");
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (error) {
      reject("Error decoding token:", error.message);
    }
  })
}

//Do Login localstorage

export const doLogin = (data) => {
  secureLocalStorage.setItem("token", JSON.stringify(data.accessToken));
  secureLocalStorage.setItem("id", data.userData.id);
  // secureLocalStorage.setItem("units",JSON.stringify(data.userData.unit_id_json));
};

//Do logout

// export const doLogout = (next) => {
//   secureLocalStorage.removeItem("data");
//   secureLocalStorage.removeItem("havePermission");
//   secureLocalStorage.removeItem("token");
//   next();
// };

//Do logout Method modification for Logout Audit
export const doLogout = async (next) => {
  try {
    await privateAxios.post("auth/web/logout"); // ✅ wait for backend to complete
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    secureLocalStorage.removeItem("data");
    secureLocalStorage.removeItem("havePermission");
    secureLocalStorage.removeItem("token"); // ✅ remove token AFTER backend is done
    next();
  }
};

//get Current user
export const getCurrentUserDetails = () => {
  if (isLoggedIn) {
    return JSON.parse(secureLocalStorage.getItem("id"));
  } else {
    return false;
  }
};

//get Current user
export const getToken = () => {
  if (isLoggedIn()) {
    return JSON.parse(secureLocalStorage.getItem("token"));
  } else {
    return null;
  }
};

//User data update
export const updateProfile = (updatedData) => {
  const profile = {
    ...JSON.parse(secureLocalStorage.getItem("data")),
    ...updatedData,
  };
  secureLocalStorage.setItem("data", JSON.stringify(profile));
};

//User data show
export const getProfile = () => {
  if (isLoggedIn) {
    return JSON.parse(secureLocalStorage.getItem("data"));
  } else {
    return false;
  }
};

export const mailDataSave = (data, next) => {
  secureLocalStorage.setItem("mail_data", JSON.stringify(data));
  next();
};

export const mailDetails = () => {
  if (isLoggedIn) {
    return JSON.parse(secureLocalStorage.getItem("mail_data"));
  } else {
    return false;
  }
};

export const hasRole = () => {
  return secureLocalStorage.getItem("havePermission");
};

export const isAdminAllowed = () => {
  const hasPermissions = secureLocalStorage.getItem("havePermission");
  if (!Array.isArray(hasPermissions)) {
    return false; // Return false if permissions are not in array format
  }

  const adminModuleID =
    "tmd0000000002,tmd0000000003,tmd0000000004,tmd0000000006";
  const moduleIdsToCheck = adminModuleID.split(",");
  const hasAccess = moduleIdsToCheck.every((moduleId) =>
    hasPermissions.includes(moduleId)
  );
  return hasAccess ? true : false;
};

export const isManagerAllowed = () => {
  const hasPermissions = secureLocalStorage.getItem("havePermission");
  if (!Array.isArray(hasPermissions)) {
    return false; // Return false if permissions are not in array format
  }

  const managerModuleID = "tmd0000000003,tmd0000000004,tmd0000000006";
  const moduleIdsToCheck = managerModuleID.split(",");
  const hasAccess = moduleIdsToCheck.every((moduleId) =>
    hasPermissions.includes(moduleId)
  );
  return hasAccess ? true : false;
};
export const isUserAllowed = () => {
  const hasPermissions = secureLocalStorage.getItem("havePermission");
  if (!Array.isArray(hasPermissions)) {
    return false; // Return false if permissions are not in array format
  }

  const managerModuleID = "tmd0000000004,tmd0000000006";
  const moduleIdsToCheck = managerModuleID.split(",");
  const hasAccess = moduleIdsToCheck.every((moduleId) =>
    hasPermissions.includes(moduleId)
  );
  return hasAccess ? true : false;
};
export const isGuestAllowed = () => {
  const hasPermissions = secureLocalStorage.getItem("havePermission");
  if (!Array.isArray(hasPermissions)) {
    return false; // Return false if permissions are not in array format
  }

  const managerModuleID = "tmd0000000006";
  const moduleIdsToCheck = managerModuleID.split(",");
  const hasAccess = moduleIdsToCheck.every((moduleId) =>
    hasPermissions.includes(moduleId)
  );
  return hasAccess ? true : false;
};

export const getAllUserUnits = () => {
  const allUnits = secureLocalStorage.getItem("units");
  return allUnits;
};
