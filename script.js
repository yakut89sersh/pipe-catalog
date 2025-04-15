
let data = [];
let structure = {};
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
    structure = json;
  });

function fillInitialOptions() {
  const standards = [...new Set(data.map(d => d["Standard"]))];
  fill("standard", standards);
}

function fill(id, items) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.textContent = "";
  select.appendChild(defaultOption);
  items.sort().forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

document.getElementById("standard").addEventListener("change", () => stepShow("thread", "Standard"));
document.getElementById("thread").addEventListener("change", () => stepShow("od", "Thread type"));
document.getElementById("od").addEventListener("change", () => stepShow("wall", "Outside diameter, (mm)"));
document.getElementById("wall").addEventListener("change", () => stepShow("grade", "Wall Thickness, (mm)"));
document.getElementById("grade").addEventListener("change", () => stepShow("coupling_grade", "Pipe grade"));
document.getElementById("coupling_grade").addEventListener("change", () => stepShow("coupling", "Coupling grade"));
document.getElementById("coupling").addEventListener("change", () => stepShow("drift", "Coupling type"));

function stepShow(nextId, filterKey) {
  const filters = {
    "standard": document.getElementById("standard").value,
    "thread": document.getElementById("thread").value,
    "od": document.getElementById("od").value,
    "wall": document.getElementById("wall").value,
    "grade": document.getElementById("grade").value,
    "coupling_grade": document.getElementById("coupling_grade").value,
    "coupling": document.getElementById("coupling").value
  };

  let filtered = data;
  Object.entries(filters).forEach(([key, val]) => {
    if (val) {
      const field = document.getElementById(key).getAttribute("data-field");
      filtered = filtered.filter(d => d[field] == val);
    }
  });

  const nextField = document.getElementById(nextId).getAttribute("data-field");
  const items = [...new Set(filtered.map(d => d[nextField]))];
  fill(nextId, items);
}

document.getElementById("findBtn").addEventListener("click", findPipe);

function findPipe() {
  const filters = {
    "Standard": document.getElementById("standard").value,
    "Thread type": document.getElementById("thread").value,
    "Outside diameter, (mm)": parseFloat(document.getElementById("od").value),
    "Wall Thickness, (mm)": parseFloat(document.getElementById("wall").value),
    "Pipe grade": document.getElementById("grade").value,
    "Coupling grade": document.getElementById("coupling_grade").value,
    "Coupling type": document.getElementById("coupling").value,
    "Drift Option": document.getElementById("drift").value
  };

  const result = data.find(d => Object.entries(filters).every(([k, v]) => d[k] == v));
  const resultContainer = document.getElementById("result");

  if (!result) {
    resultContainer.innerHTML = "<p style='color:red;'>Труба не найдена.</p>";
    return;
  }

  const s = structure;
  let html = `<h3 style="text-align:center; font-size: 18px;">${s.title.replace("{OD}", result["Outside diameter, (mm)"]).replace("{Wall}", result["Wall Thickness, (mm)"]).replace("{PipeGrade}", result["Pipe grade"]).replace("{ThreadType}", result["Thread type"]).replace("{Standard}", result["Standard"])}</h3>`;

  html += `<h4>${s.sections.common}</h4>`;
  for (const key of s.sections_order.common) {
    if (result[key] !== undefined) html += `- ${s.fields[key]} - ${result[key]}<br>`;
  }

  html += `<h4>${s.sections.pipe}</h4>`;
  for (const key of s.sections_order.pipe) {
    if (result[key] !== undefined) html += `- ${s.fields[key]} - ${result[key]}<br>`;
  }

  html += `<h4>${s.sections.connection}</h4>`;
  for (const key of s.sections_order.connection) {
    if (result[key] !== undefined) html += `- ${s.fields[key]} - ${result[key]}<br>`;
  }

  document.getElementById("result").innerHTML = html;
}
