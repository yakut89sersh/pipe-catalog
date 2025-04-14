
let data = [];
let language = "ru";

fetch("tube_data_multilang.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    fillFilteredOptions();
  });

fetch("techsheet_structure.json")
  .then(res => res.json())
  .then(json => {
    window.structure = json;
  });

function fillFilteredOptions() {
  fill("standard", [...new Set(data.map(d => d["Standard"]))]);
}

function stepShow(step) {
  const ids = [
    "standard", "thread", "od", "wall",
    "pipegrade", "couplinggrade", "coupling", "drift"
  ];

  const fieldMap = {
    "standard": "Standard",
    "thread": "Thread type",
    "od": "Outside diameter, (mm)",
    "wall": "Wall Thickness, (mm)",
    "pipegrade": "Pipe grade",
    "couplinggrade": "Coupling grade",
    "coupling": "Coupling type"
  };

  let filters = {};
  for (let i = 0; i < step; i++) {
    const val = document.getElementById(ids[i]).value;
    if (!val) return;
    filters[fieldMap[ids[i]]] = val;
  }

  const nextId = ids[step];
  const nextField = fieldMap[nextId];
  if (!nextField) {
    document.getElementById(nextId).disabled = false;
    return;
  }

  const filtered = data.filter(d => {
    return Object.keys(filters).every(k => d[k] == filters[k]);
  });

  const uniqueValues = [...new Set(filtered.map(d => d[nextField]))];
  fill(nextId, uniqueValues);
  document.getElementById(nextId).disabled = false;
}

function fill(id, items) {
  const select = document.getElementById(id);
  select.innerHTML = "<option disabled selected hidden>Выберите...</option>";
  items.sort((a, b) => (a > b ? 1 : -1)).forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

function findPipe() {
  const result = data.find(d =>
    d["Standard"] === document.getElementById("standard").value &&
    d["Thread type"] === document.getElementById("thread").value &&
    d["Outside diameter, (mm)"] == document.getElementById("od").value &&
    d["Wall Thickness, (mm)"] == document.getElementById("wall").value &&
    d["Pipe grade"] === document.getElementById("pipegrade").value &&
    d["Coupling grade"] === document.getElementById("couplinggrade").value &&
    d["Coupling type"] === document.getElementById("coupling").value
  );

  const driftType = document.getElementById("drift").value;

  const container = document.getElementById("result");
  if (!result || !window.structure) {
    container.innerHTML = "<p style='color:red;'>Труба не найдена или данные не загружены.</p>";
    window.currentResult = null;
    return;
  }

  window.currentResult = result;
  const struct = window.structure;

  let html = `<h3>${struct.header[language]}</h3>`;
  html += `<h4 style="text-align:center">${struct.title[language]
    .replace("{OD}", result["Outside diameter, (mm)"])
    .replace("{Wall}", result["Wall Thickness, (mm)"])
    .replace("{PipeGrade}", result["Pipe grade"])
    .replace("{ThreadType}", result["Thread type"])
    .replace("{Standard}", result["Standard"])
  }</h4>`;

  html += `<h4>${struct.sections.common[language]}</h4>`;
  html += `- ${struct.fields["Standard"][0]}: ${result["Standard"]}<br>`;
  html += `- ${struct.fields["Manufacture"][0]}: ${result["Manufacture"]}<br>`;
  html += `- ${struct.fields["Execution type"][0]}: ${result["Execution type"]}<br>`;

  html += `<h4>${struct.sections.pipe[language]}</h4>`;
  for (const key of [
    "Outside diameter, (mm)", "Wall Thickness, (mm)", "Inside diameter, (mm)",
    "Drift diameter, (mm)", "Weight, (kN/m)", "Pipe grade",
    "Minimum yield strength, (MPa)", "Minimum tensile strength, (MPa)"
  ]) {
    if (result[key] !== undefined && result[key] !== null)
      html += `- ${struct.fields[key][0].replace("{}", result[key])}<br>`;
  }

  html += `<h4>${struct.sections.connection[language]}</h4>`;
  for (const key of [
    "Thread type", "Coupling type", "Coupling OD, (mm)", "Coupling ID, (mm)",
    "Coupling length, (mm)", "Make-up loss, (mm)", "Coupling grade"
  ]) {
    if (result[key] !== undefined && result[key] !== null)
      html += `- ${struct.fields[key][0].replace("{}", result[key])}<br>`;
  }

  html += `<h4>${struct.sections.strength[language]}</h4>`;
  for (const key of [
    "Internal yield pressure, (MPa)", "Collapse pressure, (MPa)",
    "Body tension (to yield), (kN)", "Connection tension (to failure), (kN)"
  ]) {
    if (result[key] !== undefined && result[key] !== null)
      html += `- ${struct.fields[key][0].replace("{}", result[key])}<br>`;
  }

  html += `<br><strong>Тип шаблона:</strong> ${driftType}`;
  container.innerHTML = html;
}
