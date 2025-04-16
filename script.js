
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
    document.getElementById("downloadBtn").style.display = "none";
    return;
  }

  // Определение наименования типа трубы
  const isTubing = result["Name"]?.toLowerCase().includes("нкт");
  const pipeType = isTubing ? "НКТ" : "обсадной трубы";

  // Формирование заголовка
  const title = `Технический лист данных для ${pipeType} ${result["Outside diameter, (mm)"]} x ${result["Wall Thickness, (mm)"]} мм, гр. пр. ${result["Pipe grade"]}, ${result["Thread type"]} по ${result["Standard"]}`;

  // Визуализация HTML
  const html = renderTechsheetHTML(result, structure, title);
  document.getElementById("result").innerHTML = html;

  // Показ кнопки PDF
  document.getElementById("downloadBtn").style.display = "block";
}

function downloadPDF() {
  if (!window.jspdf || !window.jsPDF || !structure) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const el = document.getElementById("result");
  doc.html(el, {
    callback: function (doc) {
      doc.save("techsheet.pdf");
    },
    x: 10,
    y: 10
  });
}
