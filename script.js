
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
  // Активируем только первый список "Тип трубы"
  fillSelect("name", [...new Set(data.map(d => d["Name"]))], true);
  
  // Все остальные селекты делаем неактивными и без подсказки
  const steps = ["standard", "thread", "od", "wall", "pipegrade", "couplinggrade", "coupling", "drift"];
  for (const id of steps) {
    const select = document.getElementById(id);
    select.innerHTML = "";
    select.disabled = true;
  }
}

function fillSelect(id, options, withPlaceholder = true) {
  const select = document.getElementById(id);
  select.innerHTML = "";

  if (withPlaceholder) {
    const placeholder = document.createElement("option");
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    placeholder.textContent = "Выберите...";
    select.appendChild(placeholder);
  }

  options.forEach(opt => {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    select.appendChild(o);
  });
}




const units = {
  "Outside diameter, (mm)": "мм",
  "Wall Thickness, (mm)": "мм",
  "Weight, (kg/m)": "кг/м",
  "Inside diameter, (mm)": "мм",
  "Drift diameter, (mm)": "мм",
  "Body tension (to yield), (kN)": "кН",
  "Internal yield pressure, (MPa)": "МПа",
  "Collapse pressure, (MPa)": "МПа",
  "Coupling OD, (mm)": "мм",
  "Coupling ID, (mm)": "мм",
  "Coupling length, (mm)": "мм",
  "Make-up loss, (mm)": "мм",
  "Connection tension (to failure, (kN)": "кН",
  "Yield Strength in Tension, (kN)": "кН",
  "Shear-out strength of the threaded connection, (kN)": "кН",
  "Min. Internal Yield Pressure Coupling, Mpa": "МПа"
};


let value = data[key];
if (units[key] && value !== "") {
  value += " " + units[key];
}














function stepShow(step) {
  const steps = ["name", "standard", "thread", "od", "wall", "pipegrade", "couplinggrade", "coupling", "drift"];
  const selected = {};
  for (let i = 0; i < step; i++) {
    const val = document.getElementById(steps[i]).value;
    if (!val) return;
    selected[steps[i]] = val;
  }

  const map = {
    name: "Name",
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
  
  const nextSelect = document.getElementById(nextKey);
  nextSelect.disabled = false;
  nextSelect.innerHTML = ""; // сначала очищаем

  // Добавляем подсказку только если есть опции
  if (options.length > 0) {
    const placeholder = document.createElement("option");
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    placeholder.textContent = "Выберите...";
    nextSelect.appendChild(placeholder);

    options.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      nextSelect.appendChild(o);
    });
  }
} // <-- Здесь обязательно закрыть скобку!









function findPipe() {
  if (!structure || !structure.sections || !structure.sections.common) {
    alert("Данные структуры не загружены. Пожалуйста, подождите и попробуйте снова.");
    return;
  }


  const map = {
    name: "Name",
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

  // Определение наименования трубы для заголовка
let name = result["Name"] || "";
let pipeType;
if (name.toLowerCase() === "нкт") {
  pipeType = "НКТ";
} else if (name.toLowerCase() === "обсадная труба") {
  pipeType = "обсадной трубы";
} else {
  pipeType = name; // на всякий случай вдруг будут еще типы
}

  let html = `<h2 style="text-align:center">${structure.title
    .replace("{PipeType}", pipeType)
    .replace("{OD}", result["Outside diameter, (mm)"])
    .replace("{Wall}", result["Wall Thickness, (mm)"])
    .replace("{PipeGrade}", result["Pipe grade"])
    .replace("{ThreadType}", result["Thread type"])
    .replace("{Standard}", result["Standard"])}</h2>`;

 html += `<h3>${structure.sections.common}</h3><table class="tech-table">`;
for (const key of structure.sections_order.common) {
  if (result[key]) {
    let value = result[key];
    if (units[key] && value !== "") {
      value += " " + units[key];
    }
    html += `<tr><td>${structure.fields[key]}</td><td>${value}</td></tr>`;
  }
}
html += `</table>`;

html += `<h3>${structure.sections.pipe}</h3><table class="tech-table">`;
for (const key of structure.sections_order.pipe) {
  if (result[key]) {
    let value = result[key];
    if (units[key] && value !== "") {
      value += " " + units[key];
    }
    html += `<tr><td>${structure.fields[key]}</td><td>${value}</td></tr>`;
  }
}
html += `</table>`;

html += `<h3>${structure.sections.connection}</h3><table class="tech-table">`;
for (const key of structure.sections_order.connection) {
  if (result[key]) {
    let value = result[key];
    if (units[key] && value !== "") {
      value += " " + units[key];
    }
    html += `<tr><td>${structure.fields[key]}</td><td>${value}</td></tr>`;
  }
}
html += `</table>`;


// Добавляем рекомендации по моменту свинчивания
const threadType = result["Thread type"];
if (recommendations[threadType]) {
  html += `<div class="page-break"></div>`;  // <<< Добавляем разрыв страницы

  html += `<h3>Рекомендации по моменту свинчивания согласно ГОСТ 34380-2017:</h3>`;
  html += `<div class="makeup-recommendation">${recommendations[threadType]}</div>`;
}




  document.getElementById("pdfContent").innerHTML = html;
  
  document.getElementById("downloadBtn").style.display = "block";
}

async function downloadPDF() {
  const element = document.getElementById("pdfContent");

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
      scale: 3,    // ВАЖНО: увеличиваем детализацию (не windowWidth!)
      scrollY: 0,
      useCORS: true
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } // юниты в mm для a4
  };

  const btn = document.getElementById("downloadBtn");
  btn.style.display = "none";

  await html2pdf().from(element).set(opt).save();

  btn.style.display = "block";
}
