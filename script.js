
let data = [];
let structure = {};
let language = "ru";

fetch("tube_data_multilang.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    initSelectors();
  });

fetch("techsheet_structure.json")
  .then(res => res.json())
  .then(json => structure = json);

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
  const steps = [
    "standard", "thread", "od", "wall", "pipegrade",
    "couplinggrade", "coupling", "drift"
  ];

  const filters = {};
  for (let i = 0; i < step; i++) {
    const val = document.getElementById(steps[i]).value;
    if (!val) return;
    filters[steps[i]] = val;
  }

  const filtered = data.filter(d => {
    return Object.entries(filters).every(([key, val]) => d[structure.map[key]] == val);
  });

  const nextKey = steps[step];
  if (!nextKey) return;

  const nextOptions = [...new Set(filtered.map(d => d[structure.map[nextKey]]))];
  document.getElementById(nextKey).disabled = false;
  fillSelect(nextKey, nextOptions);
}

function findPipe() {
  const keys = [
    "standard", "thread", "od", "wall", "pipegrade",
    "couplinggrade", "coupling", "drift"
  ];

  const selected = {};
  for (const key of keys) {
    const el = document.getElementById(key);
    if (!el || !el.value) return;
    selected[key] = el.value;
  }

  const result = data.find(d => {
    return Object.entries(selected).every(([key, val]) =>
      d[structure.map[key]] == val
    );
  });

  if (!result) {
    document.getElementById("result").innerHTML = "<p style='color:red;'>Труба не найдена.</p>";
    return;
  }

  showResult(result);
  window.currentResult = result;
}

function showResult(d) {
  const s = structure;
  const isTubing = d["Thread type"].toLowerCase().includes("нкт") || d["Outside diameter, (mm)"] < 100;

  let html = `<h2 style="text-align:center">
    Технический лист данных для ${isTubing ? "НКТ" : "обсадной трубы"} 
    ${d["Outside diameter, (mm)"]} x ${d["Wall Thickness, (mm)"]} мм, 
    гр. пр. ${d["Pipe grade"]}, ${d["Thread type"]} по ${d["Standard"]}
  </h2>`;

  html += "<h3>Общие сведения:</h3>";
  for (const key of s.sections.common) {
    if (d[key]) html += `- ${s.fields[key][0]} - ${d[key]}<br>`;
  }

  html += "<h3>Параметры тела трубы:</h3>";
  for (const key of s.sections.pipe) {
    if (d[key]) html += `- ${s.fields[key][0]} - ${d[key]}<br>`;
  }

  html += "<h3>Характеристики соединения:</h3>";
  for (const key of s.sections.connection) {
    if (d[key]) html += `- ${s.fields[key][0]} - ${d[key]}<br>`;
  }

  html += "<h3>Прочностные характеристики:</h3>";
  for (const key of s.sections.strength) {
    if (d[key]) html += `- ${s.fields[key][0]} - ${d[key]}<br>`;
  }

  document.getElementById("result").innerHTML = html;
}
