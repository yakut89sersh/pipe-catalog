async function renderTechsheet(data, structurePath = 'techsheet_structure_drill.json') {
  const container = document.getElementById("techsheet");
  container.innerHTML = "";

  const res = await fetch(structurePath);
  const structure = await res.json();

  // ===== Заголовок =====
  const title = document.createElement("h2");
  title.textContent = "Технический лист данных бурильной трубы";
  container.appendChild(title);

  // ===== Общие сведения (title: "Общие сведения") =====
  if (structure.title === "Общие сведения" || structure.rows) {
    const summaryTable = document.createElement("table");
    summaryTable.style.width = "100%";
    summaryTable.style.borderCollapse = "collapse";
    summaryTable.style.marginBottom = "30px";

    const caption = document.createElement("caption");
    caption.textContent = "Общие сведения";
    caption.style.fontWeight = "bold";
    caption.style.marginBottom = "10px";
    summaryTable.appendChild(caption);

    for (const row of structure.rows) {
      const tr = document.createElement("tr");

      const tdLabel = document.createElement("td");
      tdLabel.textContent = row.label;
      tdLabel.style.width = "70%";
      tdLabel.style.padding = "8px";
      tdLabel.style.border = "1px solid #ccc";
      tdLabel.style.background = "#f9f9f9";

      const tdValue = document.createElement("td");
      tdValue.textContent = data[row.key] || "—";
      tdValue.style.padding = "8px";
      tdValue.style.border = "1px solid #ccc";

      tr.appendChild(tdLabel);
      tr.appendChild(tdValue);
      summaryTable.appendChild(tr);
    }

    container.appendChild(summaryTable);
  }

  // ===== Остальные таблицы =====
  if (Array.isArray(structure.tables)) {
    for (const block of structure.tables) {
      const sectionHeader = document.createElement("h3");
      sectionHeader.textContent = block.title || structure.title;
      container.appendChild(sectionHeader);

      // table-grouped
      if (block.type === "table-grouped") {
        for (const sub of block.tables) {
          const subHeader = document.createElement("h4");
          subHeader.textContent = sub.subtitle;
          container.appendChild(subHeader);

          const table = document.createElement("table");
          table.style.width = "100%";
          table.style.borderCollapse = "collapse";
          table.style.marginBottom = "30px";

          const headerRow = document.createElement("tr");
          const emptyCell = document.createElement("th");
          emptyCell.textContent = "";
          headerRow.appendChild(emptyCell);

          for (const col of sub.columns) {
            const th = document.createElement("th");
            th.textContent = col;
            th.style.border = "1px solid #ccc";
            th.style.padding = "6px";
            headerRow.appendChild(th);
          }
          table.appendChild(headerRow);

          for (const row of sub.rows) {
            const tr = document.createElement("tr");
            const tdLabel = document.createElement("td");
            tdLabel.textContent = row.label;
            tdLabel.style.border = "1px solid #ccc";
            tdLabel.style.padding = "6px";
            tdLabel.style.background = "#f9f9f9";
            tr.appendChild(tdLabel);

            for (const val of row.values) {
              const td = document.createElement("td");
              td.textContent = val || "—";
              td.style.border = "1px solid #ccc";
              td.style.padding = "6px";
              tr.appendChild(td);
            }

            table.appendChild(tr);
          }

          container.appendChild(table);
        }
      }

      // table
      else if (block.type === "table") {
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.marginBottom = "30px";

        const headerRow = document.createElement("tr");
        const emptyCell = document.createElement("th");
        emptyCell.textContent = "";
        headerRow.appendChild(emptyCell);

        for (const col of block.columns) {
          const th = document.createElement("th");
          th.textContent = col;
          th.style.border = "1px solid #ccc";
          th.style.padding = "6px";
          headerRow.appendChild(th);
        }
        table.appendChild(headerRow);

        for (const row of block.rows) {
          const tr = document.createElement("tr");
          const tdLabel = document.createElement("td");
          tdLabel.textContent = row.label;
          tdLabel.style.border = "1px solid #ccc";
          tdLabel.style.padding = "6px";
          tdLabel.style.background = "#f9f9f9";
          tr.appendChild(tdLabel);

          for (const val of row.values) {
            const td = document.createElement("td");
            td.textContent = val || "—";
            td.style.border = "1px solid #ccc";
            td.style.padding = "6px";
            tr.appendChild(td);
          }

          table.appendChild(tr);
        }

        container.appendChild(table);
      }
    }
  }

  container.style.display = "block";
}
