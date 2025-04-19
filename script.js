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

  let result = data.find(d => Object.entries(selected).every(([k, v]) => d[k] == v));
  if (!result) {
    document.getElementById("result").innerHTML = "<p style='color:red;'>Труба не найдена.</p>";
    document.getElementById("downloadBtn").style.display = "none";
    return;
  }

  if ((result["Standard"] === "ГОСТ 632-80" || result["Standard"] === "ГОСТ 633-80") && !result["Production quality"]) {
    result["Production quality"] = "Исполнение А";
  }

  const isTubing = result["Thread type"] === "гладкая" && result["Outside diameter, (mm)"] < 114.3;
  const pipeType = isTubing ? "НКТ" : "обсадной трубы";

  const techsheetElement = renderTechsheetHTML(structure, result, pipeType);
  const container = document.getElementById("result");
  container.innerHTML = ""; // очищаем
  if (typeof techsheetElement === "string") {
    container.innerHTML = techsheetElement;
  } else {
    container.appendChild(techsheetElement);
  }
  document.getElementById("downloadBtn").style.display = "block";
}

function downloadPDF() {
  alert("Скачивание PDF будет доступно позже.");
}