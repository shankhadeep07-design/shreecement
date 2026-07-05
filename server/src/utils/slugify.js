function generateSlug(str = "") {
    console.log("Generating slug for:", str);
    
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

module.exports = { generateSlug };
