
function renderTechsheetHTML(result, structure) {
  const sections = structure.sections;
  const order = structure.sections_order;
  const fields = structure.fields;

  function createRow(label, value, rowClass = "") {
    const row = document.createElement("div");
    row.className = "row " + rowClass;

    const labelDiv = document.createElement("div");
    labelDiv.className = "label";
    labelDiv.textContent = label;

    const valueDiv = document.createElement("div");
    valueDiv.className = "value";
    valueDiv.textContent = value;

    row.appendChild(labelDiv);
    row.appendChild(valueDiv);
    return row;
  }

  function createBlock(title, keys, color) {
    const block = document.createElement("div");
    block.className = "block";
    block.style.backgroundColor = color;

    const titleDiv = document.createElement("div");
    titleDiv.className = "block-title";
    titleDiv.textContent = title;
    block.appendChild(titleDiv);

    const inner = document.createElement("div");
    let isEven = true;

    keys.forEach(k => {
      if (result[k] !== undefined && result[k] !== null && result[k] !== "") {
        inner.appendChild(createRow(fields[k], result[k], isEven ? "even" : "odd"));
        isEven = !isEven;
      }
    });

    block.appendChild(inner);
    return block;
  }

  const container = document.createElement("div");
  container.className = "techsheet";

  const pipeType = result["Name"] === "НКТ" ? "НКТ" : "обсадной трубы";

  const heading = document.createElement("h2");
  heading.innerHTML = `Технический лист данных для ${pipeType} ${result["Outside diameter, (mm)"]} x ${result["Wall Thickness, (mm)"]} мм, гр. пр. ${result["Pipe grade"]}, ${result["Thread type"]} по ${result["Standard"]}`;
  container.appendChild(heading);

  container.appendChild(createBlock(sections.common, order.common, "#dbeeff"));
  container.appendChild(createBlock(sections.pipe, order.pipe, "#d6f5db"));
  container.appendChild(createBlock(sections.connection, order.connection, "#fff0c9"));

  return container;
}
