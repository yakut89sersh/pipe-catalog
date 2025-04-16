function renderTechsheetHTML(result) {
  const blocks = {
    common: {
      title: "Общие сведения:",
      color: "#dde8f0",
      rows: [
        ["Name", "Наименование"],
        ["Process of manufacture", "Способ производства"],
        ["Outside diameter, (mm)", "Наружный диаметр трубы, (мм)"],
        ["Wall Thickness, (mm)", "Толщина стенки, (мм)"],
        ["Thread type", "Тип резьбы"],
        ["Standard", "Нормативный документ"],
        ["Production quality", "Тип исполнения"],
        ["Drift Option", "Тип шаблона"],
        ["Weight, (kg/m)", "Теоретический вес 1 м колонны, (кг/м)"]
      ]
    },
    pipe: {
      title: "Параметры тела трубы:",
      color: "#eaf1ea",
      rows: [
        ["Inside diameter, (mm)", "Внутренний диаметр трубы, (мм)"],
        ["Drift diameter, (mm)", "Диаметр шаблона, (мм)"],
        ["Body tension (to yield), (kN)", "Растяжение до предела текучести тела трубы, кН"],
        ["Internal yield pressure, (MPa)", "Минимальное внутреннее давление до предела текучести тела трубы, (МПа)"],
        ["Collapse pressure, (MPa)", "Сминающее давление тела трубы, (МПа)"],
        ["Pipe grade", "Группа прочности трубы"],
        ["Minimum yield strength, (MPa)", "Минимальный предел текучести, (МПа)"],
        ["Minimum tensile strength, (MPa)", "Минимальный предел прочности, (МПа)"]
      ]
    },
    connection: {
      title: "Характеристики соединения:",
      color: "#f3ede2",
      rows: [
        ["Coupling type", "Тип муфты"],
        ["Coupling OD, (mm)", "Наружный диаметр муфты, (мм)"],
        ["Coupling ID, (mm)", "Внутренний диаметр муфты, (мм)"],
        ["Coupling length, (mm)", "Длина муфты, (мм)"],
        ["Make-up loss, (mm)", "Потеря длины при свинчивании, (мм)"],
        ["Connection tension (to failure), (kN)", "Растяжение до разрушения резьбового соединения, кН"],
        ["Yield Strength in Tension, (kN)", "Растяжение до предела текучести резьбового соединения, кН"],
        ["Shear-out strength of the threaded connection, (kN)", "Страгивающая нагрузка резьбового соединения, кН"],
        ["Min. Internal Yield Pressure Coupling, Mpa", "Минимальное внутреннее давление до предела текучести муфты, (МПа)"],
        ["Coupling grade", "Группа прочности муфты"]
      ]
    }
  };

  function renderBlock(block, data) {
    const rows = block.rows
      .filter(([key]) => data[key])
      .map(([key, label], i) => {
        return `<div class="row" style="background:${i % 2 === 0 ? "#fff" : block.color}">
          <div class="label">${label}</div>
          <div class="value">${data[key]}</div>
        </div>`;
      })
      .join("");
    return `<div class="block">
      <div class="block-title">${block.title}</div>
      ${rows}
    </div>`;
  }

  const pipeType = (result["Name"] || "").toLowerCase().includes("нкт") ? "НКТ" : "обсадной трубы";
  const title = `<h2><strong>Технический лист данных для ${pipeType} ${result["Outside diameter, (mm)"]} x ${result["Wall Thickness, (mm)"]} мм, гр. пр. ${result["Pipe grade"]}, ${result["Thread type"]} по ${result["Standard"]}</strong></h2>`;

  return `<div class="techsheet">${title}${renderBlock(blocks.common, result)}${renderBlock(blocks.pipe, result)}${renderBlock(blocks.connection, result)}</div>`;
}