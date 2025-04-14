
function findPipe() {
  const struct = window.structure;
  const result = window.currentResult;
  const language = "ru";

  const isTubing = (
    parseFloat(result["Outside diameter, (mm)"]) <= 114.3 &&
    !["ОТТМ", "ОТТГ"].includes(result["Thread type"])
  );
  const titleTemplate = struct.title[language][isTubing ? "tubing" : "casing"];

  let html = "";
  html += `<div style="text-align:center; font-size:18px; font-weight:bold; margin-bottom: 10px;">${titleTemplate
    .replace("{OD}", result["Outside diameter, (mm)"])
    .replace("{Wall}", result["Wall Thickness, (mm)"])
    .replace("{PipeGrade}", result["Pipe grade"])
    .replace("{ThreadType}", result["Thread type"])
    .replace("{Standard}", result["Standard"])}</div>`;

  document.getElementById("result").innerHTML = html;
}
