
function renderTechsheetHTML(result, structure) {
  const container = document.createElement("div");
  container.className = "techsheet";

  const title = document.createElement("h2");
  title.textContent = structure.title
    .replace("{PipeType}", result["Name"])
    .replace("{OD}", result["Outside diameter, (mm)"])
    .replace("{Wall}", result["Wall Thickness, (mm)"])
    .replace("{PipeGrade}", result["Pipe grade"])
    .replace("{ThreadType}", result["Thread type"])
    .replace("{Standard}", result["Standard"]);
  container.appendChild(title);

  const blockColors = ["#d5e8f6", "#d9f2e4", "#fef2cc"];
  const sectionKeys = ["common", "pipe", "connection"];
  sectionKeys.forEach((section, index) => {
    const block = document.createElement("div");
    block.className = "block";

    const blockTitle = document.createElement("div");
    blockTitle.className = "block-title";
    blockTitle.style.backgroundColor = "#444";
    blockTitle.textContent = structure.sections[section];
    block.appendChild(blockTitle);

    structure.sections_order[section].forEach((key, i) => {
      if (!result[key]) return;
      const row = document.createElement("div");
      row.className = "row";
      row.style.backgroundColor = i % 2 === 0 ? blockColors[index] : "#ffffff";

      const label = document.createElement("div");
      label.className = "label";
      label.textContent = structure.fields[key];

      const value = document.createElement("div");
      value.className = "value";
      value.textContent = result[key];

      row.appendChild(label);
      row.appendChild(value);
      block.appendChild(row);
    });

    container.appendChild(block);
  });

  return container;
}
