
function findPipe() {
  const struct = window.structure;
  const result = window.currentResult;
  const language = "ru";

  if (!result) {
    document.getElementById("result").innerHTML = "<p style='color:red;'>Труба не найдена или данные не загружены.</p>";
    window.currentResult = null;
    return;
  }

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


function generatePDF() {
  if (!window.currentResult || !window.structure) {
    alert("Данные не загружены.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("DejaVuSans");

  const r = window.currentResult;
  const s = window.structure;
  const lang = language;

  const isTubing = (
    parseFloat(r["Outside diameter, (mm)"]) <= 114.3 &&
    !["ОТТМ", "ОТТГ"].includes(r["Thread type"])
  );
  const titleTemplate = s.title[lang][isTubing ? "tubing" : "casing"];

  let y = 10;
  doc.setFontSize(14);
  doc.text(titleTemplate
    .replace("{OD}", r["Outside diameter, (mm)"])
    .replace("{Wall}", r["Wall Thickness, (mm)"])
    .replace("{PipeGrade}", r["Pipe grade"])
    .replace("{ThreadType}", r["Thread type"])
    .replace("{Standard}", r["Standard"]),
    105, y, null, null, "center");
  y += 10;

  const sections = ["common", "pipe", "connection"];
  const fields = {
    common: ["Standard", "Manufacture", "Execution type", "Drift type"],
    pipe: [
      "Outside diameter, (mm)", "Wall Thickness, (mm)", "Inside diameter, (mm)",
      "Drift diameter, (mm)", "Weight, (kN/m)", "Pipe grade",
      "Minimum yield strength, (MPa)", "Minimum tensile strength, (MPa)",
      "Internal yield pressure, (MPa)", "Collapse pressure, (MPa)"
    ],
    connection: [
      "Coupling type", "Coupling OD, (mm)", "Coupling ID, (mm)",
      "Coupling length, (mm)", "Make-up loss, (mm)",
      "Connection tension (to failure), (kN)", "Connection tension (to yield), (kN)",
      "Connection torsion (kN)", "Internal pressure coupling, (MPa)", "Coupling grade"
    ]
  };

  for (const sec of sections) {
    doc.setFontSize(12);
    doc.text(s.sections[sec][lang], 10, y); y += 6;
    const keys = fields[sec];
    for (const key of keys) {
      let value = key === "Drift type"
        ? document.getElementById("drift").value
        : r[key];
      if (value !== undefined && s.fields[key]) {
        const line = s.fields[key][lang === "ru" ? 0 : 1].replace("{}", value);
        doc.setFontSize(10);
        doc.text(`- ${line}`, 10, y); y += 6;
        if (y > 270) { doc.addPage(); y = 10; }
      }
    }
    y += 4;
  }

  doc.save(`techsheet_${r["Outside diameter, (mm)"]}x${r["Wall Thickness, (mm)"]}_${r["Pipe grade"]}_${lang}.pdf`);
}
