
let data = [];
let structure = {};

Promise.all([
  fetch("tube_data_multilang.json").then(res => res.json()),
  fetch("techsheet_structure.json").then(res => res.json())
]).then(([jsonData, jsonStruct]) => {
  data = jsonData;
  structure = jsonStruct;
  initSelectors();
  document.getElementById("findBtn").disabled = false;
});

function initSelectors() {
  fillSelect("standard", [...new Set(data.map(d => d["Standard"]))]);
}

function fillSelect(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = '<option disabled selected hidden>Выберите...</option>';
  options.forEach(opt => {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    select.appendChild(o);
  });
}

function stepShow(step) {
  const steps = ["standard", "thread", "od", "wall", "pipegrade", "couplinggrade", "coupling", "drift"];
  const selected = {};
  for (let i = 0; i < step; i++) {
    const val = document.getElementById(steps[i]).value;
    if (!val) return;
    selected[steps[i]] = val;
  }

  const map = {
    standard: "Standard",
    thread: "Thread type",
    od: "Outside diameter, (mm)",
    wall: "Wall Thickness, (mm)",
    pipegrade: "Pipe grade",
    couplinggrade: "Coupling grade",
    coupling: "Coupling type",
    drift: "Drift Option"
  };

  const filtered = data.filter(d =>
    Object.entries(selected).every(([k, v]) => d[map[k]] == v)
  );

  const nextKey = steps[step];
  if (!nextKey) return;

  const nextField = map[nextKey];
  const options = [...new Set(filtered.map(d => d[nextField]))];
  document.getElementById(nextKey).disabled = false;
  fillSelect(nextKey, options);
}

function findPipe() {
  if (!structure || !structure.sections || !structure.sections.common) {
    alert("Данные структуры не загружены. Пожалуйста, подождите и попробуйте снова.");
    return;
  }

  const map = {
    standard: "Standard",
    thread: "Thread type",
    od: "Outside diameter, (mm)",
    wall: "Wall Thickness, (mm)",
    pipegrade: "Pipe grade",
    couplinggrade: "Coupling grade",
    coupling: "Coupling type",
    drift: "Drift Option"
  };

  const selected = {};
  for (const k in map) {
    const val = document.getElementById(k).value;
    if (!val) return alert("Заполните все поля.");
    selected[map[k]] = isNaN(val) ? val : parseFloat(val);
  }

  const result = data.find(d => Object.entries(selected).every(([k, v]) => d[k] == v));
  if (!result) {
    document.getElementById("result").innerHTML = "<p style='color:red;'>Труба не найдена.</p>";
    return;
  }

  let html = `<h2 style="text-align:center">${structure.title
    .replace("{OD}", result["Outside diameter, (mm)"])
    .replace("{Wall}", result["Wall Thickness, (mm)"])
    .replace("{PipeGrade}", result["Pipe grade"])
    .replace("{ThreadType}", result["Thread type"])
    .replace("{Standard}", result["Standard"])
    .replace("{Type}", result["Type"])}</h2>`;

  html += `<h3>${structure.sections.common}</h3>`;
  for (const key of structure.sections_order.common) {
    if (result[key]) html += `- ${structure.fields[key]} - ${result[key]}<br>`;
  }

  html += `<h3>${structure.sections.pipe}</h3>`;
  for (const key of structure.sections_order.pipe) {
    if (result[key]) html += `- ${structure.fields[key]} - ${result[key]}<br>`;
  }

  html += `<h3>${structure.sections.connection}</h3>`;
  for (const key of structure.sections_order.connection) {
    if (result[key]) html += `- ${structure.fields[key]} - ${result[key]}<br>`;
  }

  document.getElementById("result").innerHTML = html;
}
