
let data = [];

fetch("tube_data_with_coupling_id.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    fillInitialOptions();
  });

function fillInitialOptions() {
  const standards = [...new Set(data.map(d => d.Standard))];
  const ods = [...new Set(data.map(d => d.OD))];
  const grades = [...new Set(data.map(d => d.PipeGrade))];
  const threads = [...new Set(data.map(d => d.ThreadType))];
  const couplings = [...new Set(data.map(d => d.CouplingType))];

  fill("standard", standards);
  fill("od", ods);
  fill("grade", grades);
  fill("thread", threads);
  fill("coupling", couplings);

  document.getElementById("od").addEventListener("change", updateWallOptions);
}

function fill(id, items) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  items.sort((a, b) => a - b).forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

function updateWallOptions() {
  const od = parseFloat(document.getElementById("od").value);
  const filtered = data.filter(d => d.OD === od);
  const wallSet = [...new Set(filtered.map(d => d.Wall))];
  fill("wall", wallSet);
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
    let html = "<h3>Технические характеристики:</h3><pre>";
    const displayMap = {
      "Name": "Наименование",
      "Manufacture": "Способ производства",
      "ThreadType": "Тип резьбы",
      "OD": "Наружный диаметр, мм",
      "Wall": "Толщина стенки, мм",
      "ID": "Внутренний диаметр трубы, мм",
      "Drift": "Диаметр шаблона, мм",
      "Quality": "Тип исполнения",
      "CouplingType": "Тип муфты",
      "CouplingOD": "Наружный диаметр муфты, мм",
      "CouplingID": "Внутренний диаметр муфты, мм",
      "CouplingLength": "Длина муфты, мм",
      "MakeUpLoss": "Потеря длины при свинчивании, мм",
      "Weight": "Вес 1 м колонны, кН/м",
      "PipeGrade": "Группа прочности трубы",
      "CouplingGrade": "Группа прочности муфты",
      "YieldStrength": "Минимальный предел текучести, МПа",
      "TensileStrength": "Минимальный предел прочности, МПа",
      "InternalPressure": "Мин. внутр. давление, МПа",
      "CollapsePressure": "Сминающее давление, МПа",
      "BodyTension": "Растяжение тела трубы, кН",
      "ConnectionTension": "Растяжение соединения, кН",
      "Standard": "Нормативный документ"
    };

    for (const [key, label] of Object.entries(displayMap)) {
      if (result[key] !== undefined && result[key] !== null && result[key] !== "") {
        html += `${label}: ${result[key]}\n`;
      }
    }
    html += "</pre>";
    container.innerHTML = html;
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
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const r = window.currentResult;
  let y = 10;
  doc.setFontSize(14);
  doc.text("Технический лист данных", 105, y, null, null, "center");
  y += 10;
  doc.setFontSize(11);
  doc.text(`Обсадная труба ${r.OD} x ${r.Wall} мм, гр. пр. ${r.PipeGrade}, ${r.ThreadType} по ${r.Standard}`, 105, y, null, null, "center");
  y += 10;

  const lines = [
    `Нормативный документ - ${r.Standard}`,
    `Способ производства - ${r.Manufacture}`,
    `Тип исполнения - ${r.Quality}`,
    "",
    "Характеристики тела трубы:",
    `- Наружный диаметр трубы - ${r.OD} мм`,
    `- Толщина стенки - ${r.Wall} мм`,
    `- Внутренний диаметр трубы - ${r.ID} мм`,
    `- Диаметр шаблона - ${r.Drift} мм`,
    `- Теоретический вес 1 м колонны - ${r.Weight} кН/м`,
    `- Группа прочности трубы - ${r.PipeGrade}`,
    `- Минимальный предел текучести - ${r.YieldStrength} МПа`,
    `- Минимальный предел прочности - ${r.TensileStrength} МПа`,
    "",
    "Характеристики резьбового соединения:",
    `- Тип резьбы - ${r.ThreadType}`,
    `- Тип муфты - ${r.CouplingType}`,
    `- Наружный диаметр муфты - ${r.CouplingOD} мм`,
    ...(r.CouplingID ? [`- Внутренний диаметр муфты - ${r.CouplingID} мм`] : []),
    `- Длина муфты - ${r.CouplingLength} мм`,
    `- Потеря длины при свинчивании - ${r.MakeUpLoss} мм`,
    `- Группа прочности муфты - ${r.CouplingGrade}`,
    "",
    "Прочностные характеристики:",
    `- Мин. внутр. давление до предела текучести - ${r.InternalPressure} МПа`,
    `- Сминающее давление тела трубы - ${r.CollapsePressure} МПа`,
    `- Растяжение до предела текучести - ${r.BodyTension} кН`,
    `- Растяжение до разрушения соединения - ${r.ConnectionTension} кН`
  ];

  lines.forEach(line => {
    doc.text(line, 10, y);
    y += 7;
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save(`Техлист_${r.OD}x${r.Wall}_${r.PipeGrade}.pdf`);
}
