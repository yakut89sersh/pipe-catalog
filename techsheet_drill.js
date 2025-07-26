function loadTechsheetDrill() {
  fetch("data/techsheet_structure_drill.json")
    .then(response => response.json())
    .then(structure => {
      const container = document.getElementById("techsheet");
      container.innerHTML = ""; // Очистка

      // Заголовок
      const title = document.createElement("h2");
      title.textContent = structure.title;
      container.appendChild(title);

      // Подписи под заголовком
      const subtitle = document.createElement("p");
      subtitle.innerHTML = `
        <strong>Типоразмер:</strong> [значение] <br>
        <strong>Тип замкового соединения:</strong> [значение] <br>
        <strong>Группа прочности:</strong> [значение] <br>
        <strong>Группа длин:</strong> [значение]
      `;
      container.appendChild(subtitle);

      // Будущие таблицы (заготовка)
      for (const key in structure.sections) {
        const sectionTitle = structure.sections[key];
        const sectionDiv = document.createElement("div");
        const heading = document.createElement("h3");
        heading.textContent = sectionTitle;
        sectionDiv.appendChild(heading);

        const table = document.createElement("table");
        table.style.marginBottom = "20px";
        table.style.borderCollapse = "collapse";

        const rows = structure.sections_order[key];
        rows.forEach(field => {
          const row = document.createElement("tr");

          const cell1 = document.createElement("td");
          cell1.style.padding = "5px 10px";
          cell1.style.border = "1px solid #ccc";
          cell1.textContent = structure.fields[field] || field;

          const cell2 = document.createElement("td");
          cell2.style.padding = "5px 10px";
          cell2.style.border = "1px solid #ccc";
          cell2.textContent = "[значение]"; // пока заглушка

          row.appendChild(cell1);
          row.appendChild(cell2);
          table.appendChild(row);
        });

        sectionDiv.appendChild(table);
        container.appendChild(sectionDiv);
      }

      container.style.display = "block";
    })
    .catch(error => {
      console.error("Ошибка при загрузке techsheet_structure_drill:", error);
    });
}
