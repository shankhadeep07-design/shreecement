function prepareFormData(arrayOfObjects) {
  const formData = new FormData();

  // Iterate over each object in the array
  arrayOfObjects.forEach((obj, index) => {
    // Iterate over each key in the object
    Object.keys(obj).forEach((key) => {
      // Special handling for files (tplp_documents)
      if (key === "tplp_documents") {
        // Iterate over each file in the array and append it to formData
        obj[key].forEach((file, fileIndex) => {
          formData.append(`${key}[${index}][${fileIndex}]`, file);
        });
      } else {
        // Append the value to formData
        formData.append(`${key}[${index}]`, obj[key]);
      }
    });
  });
  return formData;
}

export default prepareFormData;


