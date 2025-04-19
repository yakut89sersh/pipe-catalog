
function renderTechsheetHTML(result, structure) {
  function createBlock(title, keys, zebraClass) {
    const block = document.createElement("div");
    block.className = "block";

    const blockTitle = document.createElement("div");
    blockTitle.className = "block-title";
    blockTitle.textContent = title;
    block.appendChild(blockTitle);

    keys.forEach((key, index) => {
      const value = result[key];
      if (value === undefined || value === null || value === "null") return;

      const row = document.createElement("div");
      row.className = "row " + zebraClass;

      const label = document.createElement("div");
      label.className = "label";
      label.textContent = structure.fields[key];
      row.appendChild(label);

      const val = document.createElement("div");
      val.className = "value";
      val.textContent = value;
      row.appendChild(val);

      block.appendChild(row);
    });

    return block;
  }

  // Выбор только одного из трёх параметров растяжения соединения
  const tensionKeys = [
    "Connection tension (to failure), (kN)",
    "Yield Strength in Tension, (kN)",
    "Shear-out strength of the threaded connection, (kN)"
  ];
  const connectionKeysFiltered = [...structure.sections_order.connection];
  const tensionKeyToShow = tensionKeys.find(key => result[key] !== undefined && result[key] !== null && result[key] !== "null");
  tensionKeys.forEach(k => {
    if (k !== tensionKeyToShow) {
      const i = connectionKeysFiltered.indexOf(k);
      if (i !== -1) connectionKeysFiltered.splice(i, 1);
    }
  });

  const container = document.createElement("div");
  container.className = "techsheet";

  const title = document.createElement("h2");
  title.textContent = structure.title
    .replace("{PipeType}", result["Name"] === "НКТ" ? "НКТ" : "обсадной трубы")
    .replace("{OD}", result["Outside diameter, (mm)"])
    .replace("{Wall}", result["Wall Thickness, (mm)"])
    .replace("{PipeGrade}", result["Pipe grade"])
    .replace("{ThreadType}", result["Thread type"])
    .replace("{Standard}", result["Standard"]);
  container.appendChild(title);

  container.appendChild(createBlock(structure.sections.common, structure.sections_order.common, "zebra-blue"));
  container.appendChild(createBlock(structure.sections.pipe, structure.sections_order.pipe, "zebra-green"));
  container.appendChild(createBlock(structure.sections.connection, connectionKeysFiltered, "zebra-yellow"));

  return container;
}
