
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
  const filters = {
    1: ["Standard"],
    2: ["Standard", "Thread type"],
    3: ["Standard", "Thread type", "Outside diameter, (mm)"],
    4: ["Standard", "Thread type", "Outside diameter, (mm)", "Wall Thickness, (mm)"],
    5: ["Standard", "Thread type", "Outside diameter, (mm)", "Wall Thickness, (mm)", "Pipe grade"],
    6: ["Standard", "Thread type", "Outside diameter, (mm)", "Wall Thickness, (mm)", "Pipe grade", "Coupling grade"],
    7: ["Standard", "Thread type", "Outside diameter, (mm)", "Wall Thickness, (mm)", "Pipe grade", "Coupling grade", "Coupling type"],
    8: ["Standard", "Thread type", "Outside diameter, (mm)", "Wall Thickness, (mm)", "Pipe grade", "Coupling grade", "Coupling type", ]
  };

  const ids = [
    "standard", "thread", "od", "wall",
    "pipegrade", "couplinggrade", "coupling", "drift"
  ];

  const values = {};
  for (let i = 0; i < step; i++) {
    const val = document.getElementById(ids[i]).value;
    if (!val) return;
    values[ids[i]] = val;
  }

  const filtered = data.filter(d => {
    return filters[step].every(key => {
      const map = {
        "standard": "Standard",
        "thread": "Thread type",
        "od": "Outside diameter, (mm)",
        "wall": "Wall Thickness, (mm)",
        "pipegrade": "Pipe grade",
        "couplinggrade": "Coupling grade",
        "coupling": "Coupling type",
        "drift": 
      };
      const id = Object.keys(map).find(k => map[k] === key);
      return d[key] == document.getElementById(id).value;
    });
  });

  const nextId = ids[step];
  const fieldMap = {
    "standard": "Standard",
    "thread": "Thread type",
    "od": "Outside diameter, (mm)",
    "wall": "Wall Thickness, (mm)",
    "pipegrade": "Pipe grade",
    "couplinggrade": "Coupling grade",
    "coupling": "Coupling type",
    "drift": 
  };

  const nextField = fieldMap[nextId];
  const uniqueValues = [...new Set(filtered.map(d => d[nextField]))];
  fill(nextId, uniqueValues);

  if (ids[step] !== "drift") document.getElementById(ids[step]).disabled = false;
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
  const standard = document.getElementById("standard").value;
  const thread = document.getElementById("thread").value;
  const od = parseFloat(document.getElementById("od").value);
  const wall = parseFloat(document.getElementById("wall").value);
  const pipegrade = document.getElementById("pipegrade").value;
  const couplinggrade = document.getElementById("couplinggrade").value;
  const coupling = document.getElementById("coupling").value;
  const drift = document.getElementById("drift").value;

  const result = data.find(d =>
    d["Standard"] === standard &&
    d["Thread type"] === thread &&
    d["Outside diameter, (mm)"] === od &&
    d["Wall Thickness, (mm)"] === wall &&
    d["Pipe grade"] === pipegrade &&
    d["Coupling grade"] === couplinggrade &&
    d["Coupling type"] === coupling &&
    d[] === drift
  );

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
    "Weight, (kN/m)", "Pipe grade",
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

  container.innerHTML = html;
}
