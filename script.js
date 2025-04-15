
let data = [];
let structure = {};

Promise.all([
  fetch("tube_data_multilang.json").then(res => res.json()),
  fetch("techsheet_structure.json").then(res => res.json())
]).then(([jsonData, jsonStruct]) => {
  data = jsonData;
  structure = jsonStruct;
  initSelectors();
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
  if (!structure.map) return;

  const filters = {};
  for (let i = 0; i < step; i++) {
    const val = document.getElementById(steps[i]).value;
    if (!val) return;
    filters[steps[i]] = val;
  }

  const filtered = data.filter(d =>
    Object.entries(filters).every(([key, val]) => d[structure.map[key]] == val)
  );

  const nextKey = steps[step];
  if (!nextKey) return;

  const nextOptions = [...new Set(filtered.map(d => d[structure.map[nextKey]]))];
  document.getElementById(nextKey).disabled = false;
  fillSelect(nextKey, nextOptions);
}

function findPipe() {
  const fields = ["standard", "thread", "od", "wall", "pipegrade", "couplinggrade", "coupling", "drift"];
  const values = {};
  for (const f of fields) {
    const el = document.getElementById(f);
    if (!el || !el.value) return;
    values[f] = el.value;
  }

  const result = data.find(d =>
    Object.entries(values).every(([key, val]) => d[structure.map[key]] == val)
  );

  if (!result) {
    document.getElementById("result").innerHTML = "<p style='color:red;'>Труба не найдена.</p>";
    return;
  }

  window.currentResult = result;
  showResult(result);
}

function showResult(r) {
  const f = structure.fields;
  const s = structure.sections;

  const resultBlock = [];

  resultBlock.push("<h2 style='text-align:center'>Технический лист данных для " +
    (r["Outside diameter, (mm)"] <= 114.3 && !["ОТТМ", "ОТТГ"].includes(r["Thread type"]) ? "НКТ" : "обсадной трубы") +
    ` ${r["Outside diameter, (mm)"]} x ${r["Wall Thickness, (mm)"]} мм, гр. пр. ${r["Pipe grade"]}, ${r["Thread type"]} по ${r["Standard"]}</h2>`);

  resultBlock.push("<h3>Общие сведения:</h3>");
  for (const key of s.common)
    if (r[key]) resultBlock.push(`- ${f[key]} - ${r[key]}<br>`);

  resultBlock.push("<h3>Параметры тела трубы:</h3>");
  for (const key of s.pipe)
    if (r[key]) resultBlock.push(`- ${f[key]} - ${r[key]}<br>`);

  resultBlock.push("<h3>Характеристики соединения:</h3>");
  for (const key of s.connection)
    if (r[key]) resultBlock.push(`- ${f[key]} - ${r[key]}<br>`);

  resultBlock.push("<h3>Прочностные характеристики:</h3>");
  for (const key of s.strength)
    if (r[key]) resultBlock.push(`- ${f[key]} - ${r[key]}<br>`);

  document.getElementById("result").innerHTML = resultBlock.join("\n");
}
