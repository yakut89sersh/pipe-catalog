
function renderTechsheetHTML(result, structure) {
  function createBlock(title, rows, zebraColors) {
    let html = `<div class="block"><div class="block-header">${title}</div><table class="zebra-table">`;
    rows.forEach(([key, val], i) => {
      const rowClass = i % 2 === 0 ? zebraColors[0] : zebraColors[1];
      html += `<tr class="${rowClass}">
                 <td class="key">${key}</td>
                 <td class="val">${val}</td>
               </tr>`;
    });
    html += `</table></div>`;
    return html;
  }

  const r = result;
  const s = structure;

  const blocks = [];
  const zebraMap = {
    common: ['zebra-blue', 'zebra-light'],
    pipe: ['zebra-green', 'zebra-light'],
    connection: ['zebra-red', 'zebra-light']
  };

  const sections = ['common', 'pipe', 'connection'];
  for (const sec of sections) {
    const title = s.sections[sec];
    const keys = s.sections_order[sec];
    const rows = [];
    for (const key of keys) {
      if (r[key] !== undefined && r[key] !== null && r[key] !== "") {
        // только одно значение растяжения соединения
        if (sec === "connection" && (
          key === "Connection tension (to failure), (kN)" ||
          key === "Yield Strength in Tension, (kN)" ||
          key === "Shear-out strength of the threaded connection, (kN)")) {
          if (rows.some(row => row[0].includes("соединения"))) continue;
        }
        rows.push([s.fields[key], r[key]]);
      }
    }
    blocks.push(createBlock(title, rows, zebraMap[sec]));
  }

  const titleText = s.title
    .replace("{PipeType}", r["Name"] === "НКТ" ? "НКТ" : "обсадной трубы")
    .replace("{OD}", r["Outside diameter, (mm)"])
    .replace("{Wall}", r["Wall Thickness, (mm)"])
    .replace("{PipeGrade}", r["Pipe grade"])
    .replace("{ThreadType}", r["Thread type"])
    .replace("{Standard}", r["Standard"]);

  document.getElementById("result").innerHTML = `
    <div class="techsheet-title">${titleText}</div>
    ${blocks.join("<div class='block-gap'></div>")}
  `;
}
