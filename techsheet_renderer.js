// techsheet_renderer.js

export function renderTechsheet(structure, data) {
  const container = document.getElementById("techsheet");
  container.innerHTML = ""; // Очистим старое содержимое

  // Заголовок
  const header = document.createElement("h2");
  header.textContent = structure.title;
  container.appendChild(header);

  // Обходим все секции
  structure.sections.forEach((section) => {
    // Заголовок секции
    const sectionTitle = document.createElement("h3");
    sectionTitle.textContent = section.title;
    container.appendChild(sectionTitle);

    if (section.type === "table") {
      const table = document.createElement("table");
      table.className = "techsheet-table";

      // Заголовок таблицы
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const emptyTh = document.createElement("th");
      headerRow.appendChild(emptyTh);
      section.columns.forEach((col) => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Тело таблицы
      const tbody = document.createElement("tbody");
      section.rows.forEach((row) => {
        const tr = document.createElement("tr");
        const labelTd = document.createElement("td");
        labelTd.textContent = row.label;
        tr.appendChild(labelTd);
        row.values.forEach((val) => {
          const td = document.createElement("td");
          td.textContent = val;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      container.appendChild(table);
    }

    if (section.type === "table-grouped") {
      section.tables.forEach((subtable) => {
        const subtitle = document.createElement("h4");
        subtitle.textContent = subtable.subtitle;
        container.appendChild(subtitle);

        const table = document.createElement("table");
        table.className = "techsheet-table";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const emptyTh = document.createElement("th");
        headerRow.appendChild(emptyTh);
        subtable.columns.forEach((col) => {
          const th = document.createElement("th");
          th.textContent = col;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        subtable.rows.forEach((row) => {
          const tr = document.createElement("tr");
          const labelTd = document.createElement("td");
          labelTd.textContent = row.label;
          tr.appendChild(labelTd);
          row.values.forEach((val) => {
            const td = document.createElement("td");
            td.textContent = val;
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.appendChild(table);
      });
    }
  });
}
