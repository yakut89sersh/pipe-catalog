
function renderTechsheetHTML(data) {
  const container = document.getElementById("result");
  container.innerHTML = "";

  const addRow = (table, key, val) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td class="key">${key}</td><td class="val">${val}</td>`;
    table.appendChild(row);
  };

  const addBlock = (title, className) => {
    const block = document.createElement("div");
    block.className = "block";

    const header = document.createElement("div");
    header.className = "block-header";
    header.textContent = title;
    block.appendChild(header);

    const table = document.createElement("table");
    table.className = "zebra-table " + className;
    block.appendChild(table);

    container.appendChild(block);
    return table;
  };

  const title = document.createElement("div");
  title.className = "techsheet-title";
  const pipeType = data["Name"]?.toLowerCase().includes("нкт") ? "НКТ" : "обсадной трубы";
  title.textContent = `Технический лист данных для ${pipeType} ${data["Outside diameter, (mm)"]} x ${data["Wall Thickness, (mm)"]} мм, гр. пр. ${data["Pipe grade"]}, ${data["Thread type"]} по ${data["Standard"]}`;
  container.appendChild(title);

  // Общие сведения
  const common = addBlock("Общие сведения:", "zebra-blue");
  addRow(common, "Наименование", data["Name"]);
  addRow(common, "Способ производства", data["Process of manufacture"]);
  if (data["Production quality"]) {
    addRow(common, "Тип исполнения", data["Production quality"]);
  } else if (
    data["Standard"] === "ГОСТ 632-80" ||
    data["Standard"] === "ГОСТ 633-80"
  ) {
    addRow(common, "Тип исполнения", "Исполнение А");
  }
  addRow(common, "Наружный диаметр трубы, (мм)", data["Outside diameter, (mm)"]);
  addRow(common, "Толщина стенки, (мм)", data["Wall Thickness, (mm)"]);
  addRow(common, "Тип резьбы", data["Thread type"]);
  addRow(common, "Нормативный документ", data["Standard"]);
  addRow(common, "Тип шаблона", data["Drift Option"]);
  addRow(common, "Теоретический вес 1 м колонны, (кг/м)", data["Weight, (kg/m)"]);

  // Параметры тела трубы
  const pipe = addBlock("Параметры тела трубы:", "zebra-green");
  addRow(pipe, "Внутренний диаметр трубы, (мм)", data["Inside diameter, (mm)"]);
  addRow(pipe, "Диаметр шаблона, (мм)", data["Drift diameter, (mm)"]);
  addRow(pipe, "Растяжение до предела текучести тела трубы, кН", data["Body tension (to yield), (kN)"]);
  addRow(pipe, "Минимальное внутреннее давление до предела текучести тела трубы, (МПа)", data["Internal yield pressure, (MPa)"]);
  addRow(pipe, "Сминающее давление тела трубы, (МПа)", data["Collapse pressure, (MPa)"]);
  addRow(pipe, "Группа прочности трубы", data["Pipe grade"]);
  addRow(pipe, "Минимальный предел текучести, (МПа)", data["Minimum yield strength, (MPa)"]);
  addRow(pipe, "Минимальный предел прочности, (МПа)", data["Minimum tensile strength, (MPa)"]);

  // Характеристики соединения
  const conn = addBlock("Характеристики соединения:", "zebra-red");
  addRow(conn, "Тип муфты", data["Coupling type"]);
  addRow(conn, "Наружный диаметр муфты, (мм)", data["Coupling OD, (mm)"]);
  if (data["Coupling ID, (mm)"]) {
    addRow(conn, "Внутренний диаметр муфты, (мм)", data["Coupling ID, (mm)"]);
  }
  addRow(conn, "Длина муфты, (мм)", data["Coupling length, (mm)"]);
  addRow(conn, "Потеря длины при свинчивании, (мм)", data["Make-up loss, (mm)"]);

  const tensionKey = [
    "Connection tension (to failure), (kN)",
    "Yield Strength in Tension, (kN)",
    "Shear-out strength of the threaded connection, (kN)",
  ].find(k => data[k]);
  if (tensionKey) {
    addRow(conn, tensionKey.replace(/\s*\(.*?\)/, ""), data[tensionKey]);
  }

  if (data["Min. Internal Yield Pressure Coupling, Mpa"]) {
    addRow(conn, "Минимальное внутреннее давление до предела текучести муфты, (МПа)", data["Min. Internal Yield Pressure Coupling, Mpa"]);
  }
  addRow(conn, "Группа прочности муфты", data["Coupling grade"]);

  document.getElementById("downloadBtn").style.display = "block";
}
