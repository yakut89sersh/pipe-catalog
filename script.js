
let data = [];
let language = "ru";

fetch("tube_data_multilang.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    fillInitialOptions();
  });

fetch("techsheet_structure.json")
  .then(res => res.json())
  .then(json => {
    window.structure = json;
  });

function fillInitialOptions() {
  const standards = [...new Set(data.map(d => d["Standard"]))];
  const ods = [...new Set(data.map(d => d["Outside diameter, (mm)"]))];
  const grades = [...new Set(data.map(d => d["Pipe grade"]))];
  const threads = [...new Set(data.map(d => d["Thread type"]))];
  const couplings = [...new Set(data.map(d => d["Coupling type"]))];

  fill("standard", standards);
  fill("od", ods);
  fill("grade", grades);
  fill("thread", threads);
  fill("coupling", couplings);

  document.getElementById("od").addEventListener("change", updateWallOptions);
  document.getElementById("language").addEventListener("change", () => {
    language = document.getElementById("language").value;
    findPipe();
  });
}

function fill(id, items) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  items.sort((a, b) => a - b).forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

function updateWallOptions() {
  const od = parseFloat(document.getElementById("od").value);
  const filtered = data.filter(d => d["Outside diameter, (mm)"] === od);
  const wallSet = [...new Set(filtered.map(d => d["Wall Thickness, (mm)"]))];
  fill("wall", wallSet);
}

function findPipe() {
  const s = document.getElementById("standard").value;
  const od = parseFloat(document.getElementById("od").value);
  const wall = parseFloat(document.getElementById("wall").value);
  const grade = document.getElementById("grade").value;
  const thread = document.getElementById("thread").value;
  const coupling = document.getElementById("coupling").value;

  const result = data.find(d =>
    d["Standard"] === s &&
    d["Outside diameter, (mm)"] === od &&
    d["Wall Thickness, (mm)"] === wall &&
    d["Pipe grade"] === grade &&
    d["Thread type"] === thread &&
    d["Coupling type"] === coupling
  );

  const container = document.getElementById("result");
  if (!result || !window.structure) {
    container.innerHTML = "<p style='color:red;'>Труба не найдена или данные не загружены.</p>";
    window.currentResult = null;
    return;
  }

  window.currentResult = result;

  const s = window.structure;
  const lang = language;

  let html = `<h3>${s.header[lang]}</h3>`;
  html += `<h4 style="text-align:center">${s.title[lang]
    .replace("{OD}", result["Outside diameter, (mm)"])
    .replace("{Wall}", result["Wall Thickness, (mm)"])
    .replace("{PipeGrade}", result["Pipe grade"])
    .replace("{ThreadType}", result["Thread type"])
    .replace("{Standard}", result["Standard"])
  }</h4>`;

  html += `<h4>${s.sections.common[lang]}</h4>`;
  html += `- ${s.fields["Standard"][lang === "ru" ? 0 : 1]}: ${result["Standard"]}<br>`;
  html += `- ${s.fields["Manufacture"][lang === "ru" ? 0 : 1]}: ${result["Manufacture"]}<br>`;
  html += `- ${s.fields["Execution type"][lang === "ru" ? 0 : 1]}: ${result["Execution type"]}<br>`;

  html += `<h4>${s.sections.pipe[lang]}</h4>`;
  for (const key of [
    "Outside diameter, (mm)", "Wall Thickness, (mm)", "Inside diameter, (mm)",
    "Drift diameter, (mm)", "Weight, (kN/m)", "Pipe grade",
    "Minimum yield strength, (MPa)", "Minimum tensile strength, (MPa)"
  ]) {
    if (result[key] !== undefined && result[key] !== null)
      html += `- ${s.fields[key][lang === "ru" ? 0 : 1].replace("{}", result[key])}<br>`;
  }

  html += `<h4>${s.sections.connection[lang]}</h4>`;
  for (const key of [
    "Thread type", "Coupling type", "Coupling OD, (mm)", "Coupling ID, (mm)",
    "Coupling length, (mm)", "Make-up loss, (mm)", "Coupling grade"
  ]) {
    if (result[key] !== undefined && result[key] !== null)
      html += `- ${s.fields[key][lang === "ru" ? 0 : 1].replace("{}", result[key])}<br>`;
  }

  html += `<h4>${s.sections.strength[lang]}</h4>`;
  for (const key of [
    "Internal yield pressure, (MPa)", "Collapse pressure, (MPa)",
    "Body tension (to yield), (kN)", "Connection tension (to failure), (kN)"
  ]) {
    if (result[key] !== undefined && result[key] !== null)
      html += `- ${s.fields[key][lang === "ru" ? 0 : 1].replace("{}", result[key])}<br>`;
  }

  container.innerHTML = html;
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

  let y = 10;
  doc.setFontSize(14);
  doc.text(s.header[lang], 105, y, null, null, "center");
  y += 10;
  doc.setFontSize(11);
  doc.text(
    s.title[lang]
      .replace("{OD}", r["Outside diameter, (mm)"])
      .replace("{Wall}", r["Wall Thickness, (mm)"])
      .replace("{PipeGrade}", r["Pipe grade"])
      .replace("{ThreadType}", r["Thread type"])
      .replace("{Standard}", r["Standard"]),
    105, y, null, null, "center"
  );
  y += 10;

  const sections = ["common", "pipe", "connection", "strength"];
  const fields = {
    common: ["Standard", "Manufacture", "Execution type"],
    pipe: [
      "Outside diameter, (mm)", "Wall Thickness, (mm)", "Inside diameter, (mm)",
      "Drift diameter, (mm)", "Weight, (kN/m)", "Pipe grade",
      "Minimum yield strength, (MPa)", "Minimum tensile strength, (MPa)"
    ],
    connection: [
      "Thread type", "Coupling type", "Coupling OD, (mm)", "Coupling ID, (mm)",
      "Coupling length, (mm)", "Make-up loss, (mm)", "Coupling grade"
    ],
    strength: [
      "Internal yield pressure, (MPa)", "Collapse pressure, (MPa)",
      "Body tension (to yield), (kN)", "Connection tension (to failure), (kN)"
    ]
  };

  for (const sec of sections) {
    doc.text(s.sections[sec][lang], 10, y); y += 7;
    for (const key of fields[sec]) {
      if (r[key] !== undefined && r[key] !== null) {
        const line = s.fields[key][lang === "ru" ? 0 : 1].replace("{}", r[key]);
        doc.text(`- ${line}`, 10, y); y += 7;
      }
    }
    y += 3;
    if (y > 270) { doc.addPage(); y = 10; }
  }

  doc.save(`techsheet_${r["Outside diameter, (mm)"]}x${r["Wall Thickness, (mm)"]}_${r["Pipe grade"]}_${lang}.pdf`);
}
