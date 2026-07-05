// import addNotification from "react-push-notification";
import { moduleParentPermissionApi,modulePermissionApi } from "../Services/Permission-service";
import secureLocalStorage from "react-secure-storage";
export function pushNotification(message = null) {
  var url = `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_BASE_NAME}admin${message?.url}`
  // addNotification({
  //   title: message?.title || "Tata Power",
  //   subtitle: "This is a subtitle",
  //   message: message?.message || "No message available",
  //   theme: "darkblue",
  //   icon : "https://upload.wikimedia.org/wikipedia/commons/3/32/Tata_Power_Logo.png",
  //   onClick : () => window.location = url,
  //   native: true, // when using native, your OS will handle theming.
  // });
}

export const tableToExcel = (function () {
  // Define your style class template.
  var style = "<style>.green { background-color: green; }</style>";
  var uri = "data:application/vnd.ms-excel;base64,",
    template =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
      style +
      "</head><body><table>{table}</table></body></html>",
    base64 = function (s) {
      return window.btoa(unescape(encodeURIComponent(s)));
    },
    format = function (s, c) {
      return s.replace(/{(\w+)}/g, function (m, p) {
        return c[p];
      });
    };
  return function (table, name) {
    if (!table.nodeType) table = document.getElementById(table);
    var ctx = { worksheet: name || "Worksheet", table: table.innerHTML };
    //window.location.href = uri + base64(format(template, ctx))
    var a = document.createElement("a");
    a.href = uri + base64(format(template, ctx));
    a.download = name + ".xls";
    //triggering the function
    a.click();
  };
})();

export const getPlotCategories = () => {
  return [
    {
      label: "Plant area",
      value: "plant_area",
    },
    {
      label: "ML",
      value: "ml",
    },
    {
      label: "Safety",
      value: "safety",
    },
    {
      label: "Others",
      value: "others",
    },
    {
      label: "Railway",
      value: "railway",
    },
  ];
};

export const sluggify = (str) => {
  return str
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_/, "")
    .replace(/_$/, "");
};

export const getTableShimmer = (row, cols) => {
  var html = ``;
  for (var i = 0; i < row; i++) {
    html += `<div class="shimmer-table-row">`;
    for (var j = 0; j < cols; j++) {
      html += `<div class="shimmer shimmer-table-col"></div>`;
    }
    html += `</div>`;
  }

  return html;
};

export const readStream = async (reader, callback = null) => {
  const { done, value } = await reader.read();
  if (done) {
    return;
  }
  var textDecoder = new TextDecoder().decode(value);
  if (callback) callback(textDecoder);
  readStream(reader, callback);
};

export const toNumberFormat = (number) => {
  let x = number.toString();
  var lastThree = x.substring(x.length - 3);
  var otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers != "") lastThree = "," + lastThree;
  var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return res;
};

export const getDateDifference = function (startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Convert milliseconds to years, months, and days
  const years = end.getFullYear() - start.getFullYear();
  const startMonths = start.getMonth();
  const endMonths = end.getMonth();
  let months = endMonths - startMonths;
  if (months < 0 || (months === 0 && end.getDate() < start.getDate())) {
    months += 12;
  }
  const days =
    end.getDate() >= start.getDate()
      ? end.getDate() - start.getDate()
      : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() -
        start.getDate() +
        end.getDate();

  let diffString = years > 0 ? years + " year/s " : "";
  diffString += months > 0 ? months + " month/s " : "";
  diffString += days > 0 ? days + " days " : "";
  return diffString;
};

export const dateFormat = (dateStr) => {
  const date = new Date(dateStr);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDateWithOptions = date.toLocaleDateString("en-US", options);
  return formattedDateWithOptions;
};

export function loadCSS(url) {
  return new Promise((resolve, reject) => {
    var existElem = document.querySelector(`[href='${url}']`);
    if (existElem) document.head.removeChild(existElem);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;

    link.onload = () => resolve(link);
    link.onerror = () => reject(url);

    document.head.appendChild(link);
  });
}

export function loadJS(url) {
  return new Promise((resolve, reject) => {
    var existElem = document.querySelector(`[src='${url}']`);
    if (existElem) document.body.removeChild(existElem);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;

    script.onload = () => resolve(script);
    script.onerror = () => reject(url);

    document.body.appendChild(script);
  });
}

export function capitalizeAfterSpace(str) {
  if (!str) return str;
  str = str.toLowerCase();
  const words = str.split(" ");
  const capitalizedWords = words.map((word) => {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return capitalizedWords.join(" ");
}

export function slugToText(slug) {
  return slug
    .split("_") // Split the slug by underscores
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize the first letter and make the rest lowercase
    )
    .join(" "); // Join the words with spaces
}

export const convertInputTypeDate = (dateStr) => {
  const date = new Date(dateStr);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// yearHelper.js
export const generateYearRange = () => {
  const startYear = 2004;
  const currentYear = new Date().getFullYear();
  const yearRange = [];

  for (let year = startYear; year <= currentYear; year++) {
      yearRange.push({ value: year, label: `${year}-${year + 1}` });
  }

  // Move the current year to the top of the list
  yearRange.sort((a, b) => (b.value === currentYear ? 1 : -1));
  return yearRange;
};

export const getParentModulePermissionFun = async (module_name) => {
  try {
      const module = {
          module_slug: module_name
      };

      const permission = await moduleParentPermissionApi(module);

      return permission.data; // Return the data if the request is successful
  } catch (error) {

      return error; // Return the error if something goes wrong
  }
};

export const getMyModulePermissionFun = async (module_name) => {
  try {
      const module = {
          module_slug: module_name
      };

      const permission = await modulePermissionApi(module);

      return permission.data; // Return the data if the request is successful
  } catch (error) {

      return error; // Return the error if something goes wrong
  }
};

// Function to convert a timestamp to a specific timezone
export const convertToTimezone = (timestamp) => {

    if(!timestamp){
        return '';
    }

    try {
      // Parse the timestamp to create a Date object
      const date = new Date(timestamp);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Use Intl.DateTimeFormat to format the date based on the provided timezone
      const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Format the date and return the result
      return formatter.format(date);
    } catch (error) {
      console.error("Error converting timestamp:", error);
      return null;
    }
  };

  export const getAccessToken = () => {
    return JSON.parse(secureLocalStorage.getItem("accessToken"));
};
export function formatToIST(dateString) {
    const date = new Date(dateString);
    const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true // set to false if you want 24-hour format
    };

    return new Intl.DateTimeFormat('en-IN', options).format(date);
}

