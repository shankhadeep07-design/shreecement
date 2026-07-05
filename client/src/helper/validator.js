export const universalValidator = (data, fieldPrefix = "tplo_") => {
  const emptyFields = Object.keys(data).filter((key) => {
    if (key === `${fieldPrefix}plot_id`) {
      // Check for empty string, null, or undefined for "plot id" field
      return data[key] === null || data[key] === undefined || (typeof data[key] === "string" && !data[key].trim());
    } else if (typeof data[key] === "boolean") {
      // Treat boolean fields as filled if they are true
      return false;
    }
    return !data[key] && data[key] !== 0;
  });

  if (emptyFields.length > 0) {
    // Display toast error with a list of empty fields
    const emptyFieldNames = emptyFields.map((key) => key.replace(fieldPrefix, ""));
    const emptyFieldList = emptyFieldNames.join(", ");

    return { status: false, emptyFieldList };
  }

  return { status: true }; // Validation succeeded
};

  