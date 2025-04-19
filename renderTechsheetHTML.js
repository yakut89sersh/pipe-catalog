
function renderTechsheetHTML(structure, result, pipeType) {
  const createBlock = (title, rows, color) => {
    let html = `<div class="block" style="background-color:${color}; border-radius:5px; margin-bottom:20px;">`;
    html += `<div class="block-title">${title}</div>`;
    rows.forEach(({ label, value }, index) => {
      html += `
        <div class="row" style="background-color:${index % 2 === 0 ? '#f0f4f8' : '#e8eff4'};">
          <div class="label">${label}</div>
          <div class="value">${value}</div>
        </div>`;
    });
    html += `</div>`;
    return html;
  };

  const getValue = key => result[key] ?? null;
  const getLabel = key => structure.fields[key] ?? key;

  const sectionColors = {
    common: '#dceeff',
    pipe: '#d9f7ef',
    connection: '#fff3cc'
  };

  const sections = ['common', 'pipe', 'connection'];
  let html = `<div class="techsheet">`;
  html += `<h2>Технический лист данных для ${pipeType}</h2>`;

  sections.forEach(sec => {
    const rows = [];
    for (const key of structure.sections_order[sec]) {
      if (result[key] !== undefined && result[key] !== null && result[key] !== "") {
        rows.push({ label: getLabel(key), value: result[key] });
      }
    }
    if (rows.length > 0) {
      html += createBlock(structure.sections[sec], rows, sectionColors[sec]);
    }
  });

  html += `</div>`;
  return html;
}
