
let data = [];
let structure = {};
let language = "ru";

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
