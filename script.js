
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
    `- Длина муфты - ${r.CouplingLength} мм`,
    `- Потеря длины при свинчивании - ${r.MakeUpLoss} мм`,
    `- Группа прочности муфты - ${r.CouplingGrade}`,
    "",
    "Прочностные характеристики:",
    `- Минимальное внутреннее давление до предела текучести тела трубы - ${r.InternalPressure} МПа`,
    `- Сминающее давление тела трубы (по Саркисову) - ${r.CollapsePressure} МПа`,
    `- Растяжение до предела текучести тела трубы - ${r.BodyTension} кН`,
    `- Растяжение до разрушения резьбового соединения - ${r.ConnectionTension} кН`
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
