
let data = [];
let structure = {};
let recommendations = {};

Promise.all([
  fetch("tube_data_multilang.json").then(res => res.json()),
  fetch("techsheet_structure.json").then(res => res.json()),
  fetch("makeup_recommendations.json").then(res => res.json())
]).then(([jsonData, jsonStruct, jsonRec]) => {
  data = jsonData;
  structure = jsonStruct;
  recommendations = jsonRec;
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

  // Определение наименования трубы в нужной форме
  const isTubing = result["Thread type"] === "гладкая" && result["Outside diameter, (mm)"] < 114.3;
  const pipeType = isTubing ? "НКТ" : "обсадной трубы";

  let html = `<h2 style="text-align:center">${structure.title
    .replace("{PipeType}", pipeType)
    .replace("{OD}", result["Outside diameter, (mm)"])
    .replace("{Wall}", result["Wall Thickness, (mm)"])
    .replace("{PipeGrade}", result["Pipe grade"])
    .replace("{ThreadType}", result["Thread type"])
    .replace("{Standard}", result["Standard"])}</h2>`;

  html += `<h3>${structure.sections.common}</h3><table class="tech-table">`;
for (const key of structure.sections_order.common) {
  if (result[key]) html += `<tr><td>${structure.fields[key]}</td><td>${result[key]}</td></tr>`;
}
html += `</table>`;

html += `<h3>${structure.sections.pipe}</h3><table class="tech-table">`;
for (const key of structure.sections_order.pipe) {
  if (result[key]) html += `<tr><td>${structure.fields[key]}</td><td>${result[key]}</td></tr>`;
}
html += `</table>`;

html += `<h3>${structure.sections.connection}</h3><table class="tech-table">`;
for (const key of structure.sections_order.connection) {
  if (result[key]) html += `<tr><td>${structure.fields[key]}</td><td>${result[key]}</td></tr>`;
}
html += `</table>`;


// Добавляем рекомендации по моменту свинчивания
const threadType = result["Thread type"];
if (recommendations[threadType]) {
  html += `<h3>Рекомендации по моменту свинчивания согласно ГОСТ 34380-2017:</h3>`;
  html += `<div class="makeup-recommendation">${recommendations[threadType]}</div>`;
}




  document.getElementById("result").innerHTML = html;
  
  document.getElementById("downloadBtn").style.display = "block";
}

async function downloadPDF() {
  const element = document.getElementById("result");
  const btn = document.getElementById("downloadBtn");

  btn.style.display = "none";

  // Сохраняем оригинальные стили
  const originalTransform = element.style.transform;
  const originalTransformOrigin = element.style.transformOrigin;
  const originalWidth = element.style.width;
  const originalMaxWidth = element.style.maxWidth;
  const originalMargin = element.style.margin;

  // Временно масштабируем содержимое
  element.style.transform = "scale(0.8)";         // Уменьшаем до 80%
  element.style.transformOrigin = "top left";     // Масштабируем от верхнего левого угла
  element.style.width = "1250px";                 // Реальная ширина блока перед масштабированием
  element.style.maxWidth = "none";
  element.style.margin = "0";

  const standard = document.getElementById("standard").value || "";
  const thread = document.getElementById("thread").value || "";
  const od = document.getElementById("od").value || "";
  const wall = document.getElementById("wall").value || "";

  const cleanStandard = standard.replace(/\s+/g, '');
  const cleanThread = thread.replace(/\s+/g, '');
  const cleanOD = od.toString().replace(",", ".").replace(/\s+/g, '');
  const cleanWall = wall.toString().replace(",", ".").replace(/\s+/g, '');

  const filename = `Techsheet_${cleanOD}x${cleanWall}_${cleanThread}_${cleanStandard}.pdf`;

  const opt = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: {
      scale: 2,              // Хорошее качество
      scrollY: 0,
      windowWidth: 1000,     // Приближаем к реальной ширине A4
      windowHeight: element.scrollHeight,
      useCORS: true
    },
    jsPDF: { unit: 'px', format: 'a4', orientation: 'portrait' }
  };

  setTimeout(() => {
    html2pdf().set(opt).from(element).save().then(() => {
      // Возвращаем стили обратно
      element.style.transform = originalTransform;
      element.style.transformOrigin = originalTransformOrigin;
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.margin = originalMargin;
      btn.style.display = "block";
    });
  }, 300);
}