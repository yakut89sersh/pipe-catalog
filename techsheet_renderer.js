async function renderTechsheet(data, structurePath = 'drill_techsheet_structure.json') {
  const container = document.getElementById("techsheet");
  container.innerHTML = ""; // Очищаем старый вывод

  const res = await fetch(structurePath);
  const structure = await res.json();

  const title = document.createElement("h2");
  title.textContent = structure.title;
  container.appendChild(title);

  // Добавим строку с основными параметрами
  const intro = document.createElement("p");
  intro.innerHTML = `
    <strong>Типоразмер:</strong> ${data["Outside diameter, (mm)"]} × ${data["Wall Thickness, (mm)"]} мм<br>
    <strong>Тип замкового соединения:</strong> ${data["Thread type"]}<br>
    <strong>Группа прочности:</strong> ${data["Pipe grade"]}<br>
    <strong>Группа длин:</strong> ${data["Production quality"] || "—"}
  `;
  container.appendChild(intro);

  // Таблицы по секциям
  for (const [sectionKey, sectionName] of Object.entries(structure.sections)) {
    const sectionHeader = document.createElement("h3");
    sectionHeader.textContent = sectionName;
    container.appendChild(sectionHeader);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "30px";

    for (const field of structure.sections_order[sectionKey]) {
      if (!(field in data)) continue;

      const row = document.createElement("tr");

      const label = document.createElement("td");
      label.textContent = structure.fields[field];
      label.style.width = "70%";
      label.style.padding = "8px";
      label.style.border = "1px solid #ccc";
      label.style.background = "#f9f9f9";

      const value = document.createElement("td");
      value.textContent = data[field];
      value.style.padding = "8px";
      value.style.border = "1px solid #ccc";

      row.appendChild(label);
      row.appendChild(value);
      table.appendChild(row);
    }

    container.appendChild(table);
  }

  container.style.display = "block";
}
