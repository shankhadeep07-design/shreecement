import axios from "axios";
import { getToken } from "../auth/auth";
import secureLocalStorage from "react-secure-storage";
import { Navigate } from "react-router-dom";
//export const BASE_URL =  'http://192.168.1.7:5000/api/v1/';
//export const BASE_URL =  'http://182.74.36.11:5000/api/v1/';
export const BASE_URL = import.meta.env.VITE_API_URL;
export const PUBLIC_API_URL = import.meta.env.VITE_PUBLIC_API_URL;

// PUBLIC AXIOS (No Token)
export const publicAxios = axios.create({
  baseURL: PUBLIC_API_URL,
});

export const myAxios = axios.create({
  baseURL: BASE_URL,
});

export const privateAxios = axios.create({
  baseURL: BASE_URL,
});

// Function to handle logout
const logout = () => {
  secureLocalStorage.removeItem("token"); // Remove token
  window.location.href = import.meta.env.VITE_HOME_PAGE; // Redirect to login page
};


privateAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    // console.log("axioossss", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;  
  },
  (error) => Promise.reject(error)
);

privateAxios.interceptors.response.use(
  (response) => response, // Return the response as-is if successful
  (error) => {
    if (error.response && error.response.data.status === 401) {
      // Call your logout function here
      logout();
    }
    return Promise.reject(error); // Reject the error for further handling
  }
);

export const getAuthToken = () => {
  var localStorageData = JSON.parse(secureLocalStorage.getItem("token"));
  return localStorageData;
};

export const tableToExcel = (function () {
  // Define your style class template.
  var style = "<style>.green { background-color: green; }</style>";
  var uri = 'data:application/vnd.ms-excel;base64,'
      , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' + style + '</head><body><table>{table}</table></body></html>'
      , base64 = function (s) {
          return window.btoa(unescape(encodeURIComponent(s)))
      }
      , format = function (s, c) {
          return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; })
      }
  return function (table, name) {
      if (!table.nodeType) table = document.getElementById(table)
      var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
      //window.location.href = uri + base64(format(template, ctx))
      var a = document.createElement('a');
      a.href = uri + base64(format(template, ctx))
      a.download = name+'.xls';
      //triggering the function
      a.click();
  }
})();
