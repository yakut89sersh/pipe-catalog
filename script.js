
let data = [];

fetch("tube_data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    fillOptions();
  });

function fillOptions() {
  const standards = [...new Set(data.map(d => d.Standard))];
  const ods = [...new Set(data.map(d => d.OD))];
  const walls = [...new Set(data.map(d => d.Wall))];
  const grades = [...new Set(data.map(d => d.PipeGrade))];
  const threads = [...new Set(data.map(d => d.ThreadType))];
  const couplings = [...new Set(data.map(d => d.CouplingType))];

  fill("standard", standards);
  fill("od", ods);
  fill("wall", walls);
  fill("grade", grades);
  fill("thread", threads);
  fill("coupling", couplings);
}

function fill(id, items) {
  const select = document.getElementById(id);
  items.sort().forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

function findPipe() {
  const s = document.getElementById("standard").value;
  const od = parseFloat(document.getElementById("od").value);
  const wall = parseFloat(document.getElementById("wall").value);
  const grade = document.getElementById("grade").value;
  const thread = document.getElementById("thread").value;
  const coupling = document.getElementById("coupling").value;

  const result = data.find(d =>
    d.Standard === s &&
    d.OD === od &&
    d.Wall === wall &&
    d.PipeGrade === grade &&
    d.ThreadType === thread &&
    d.CouplingType === coupling
  );

  const container = document.getElementById("result");
  if (result) {
    container.innerHTML = "<h3>Технические характеристики:</h3><pre>" +
      Object.entries(result).map(([k, v]) => `${k}: ${v}`).join("\n") +
      "</pre>";
    window.currentResult = result;
  } else {
    container.innerHTML = "<p style='color:red;'>Труба не найдена.</p>";
    window.currentResult = null;
  }
}

function generatePDF() {
  if (!window.currentResult) {
    alert("Сначала найдите трубу.");
    return;
  }
  alert("Функция генерации PDF подключается отдельно 😉");
}
