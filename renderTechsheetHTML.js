
function renderTechsheetHTML(data, structure) {
  const sections = ["common", "pipe", "connection"];
  const colors = {
    common: ["#e0f0ff", "#d0e7ff"],
    pipe: ["#e6f9f0", "#d6f1e6"],
    connection: ["#fff3d6", "#ffebbf"]
  };

  const title = `<h2 style="text-align:center; font-weight:bold;">
    Технический лист данных для ${data["Name"].includes("НКТ") ? "НКТ" : "обсадной трубы"} ${data["Outside diameter, (mm)"]} x ${data["Wall Thickness, (mm)"]} мм, гр. пр. ${data["Pipe grade"]}, ${data["Thread type"]} по ${data["Standard"]}
  </h2>`;

  let html = '<div class="techsheet">' + title;

  for (const section of sections) {
    html += `<div class="block"><div class="block-title">${structure.sections[section]}</div>`;
    const keys = structure.sections_order[section];
    const zebra = colors[section];
    let rowIndex = 0;

    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== "") {
        html += `
          <div class="row" style="background-color: ${zebra[rowIndex % 2]}">
            <div class="label">${structure.fields[key]}</div>
            <div class="value">${data[key]}</div>
          </div>`;
        rowIndex++;
      }
    }
    html += "</div>";
  }

  html += "</div>";
  return html;
}
