const fs = require("fs");
const path = require("path");

module.exports = function renderTemplate(templateName, data) {
  const filePath = path.join(__dirname, "templates", `${templateName}.html`);
  let html = fs.readFileSync(filePath, "utf8");

  Object.keys(data).forEach((key) => {
    const value = String(data[key] ?? "");
    html = html.split(`{{${key}}}`).join(value);
  });

  return html;
};
