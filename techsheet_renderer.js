export function renderTechsheet(data, structure, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Очистим контейнер

  // Заголовок
  const title = document.createElement('h2');
  title.textContent = 'Технический лист данных бурильной трубы';
  container.appendChild(title);

  // Проход по каждому блоку (объект или массив)
  for (const block of structure) {
    const blockTitle = document.createElement('h3');
    blockTitle.textContent = block.title;
    container.appendChild(blockTitle);

    // ----- Простой блок с ключ-значением -----
    if (block.rows) {
      const table = document.createElement('table');
      table.className = 'techsheet-table';

      block.rows.forEach(row => {
        const tr = document.createElement('tr');

        const tdLabel = document.createElement('td');
        tdLabel.textContent = row.label;
        tdLabel.className = 'label-cell';

        const tdValue = document.createElement('td');
        tdValue.textContent = data[row.key] || '-';
        tdValue.className = 'value-cell';

        tr.appendChild(tdLabel);
        tr.appendChild(tdValue);
        table.appendChild(tr);
      });

      container.appendChild(table);
    }

    // ----- Таблица без подзаголовков -----
    if (block.type === 'table' && block.columns && block.rows) {
      const table = document.createElement('table');
      table.className = 'techsheet-table';

      // Заголовок таблицы
      const headerRow = document.createElement('tr');
      const thLabel = document.createElement('th');
      thLabel.textContent = '';
      headerRow.appendChild(thLabel);

      block.columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      // Строки
      block.rows.forEach(row => {
        const tr = document.createElement('tr');

        const tdLabel = document.createElement('td');
        tdLabel.textContent = row.label;
        tr.appendChild(tdLabel);

        row.values.forEach(value => {
          const td = document.createElement('td');
          td.textContent = value || '-';
          tr.appendChild(td);
        });

        table.appendChild(tr);
      });

      container.appendChild(table);
    }

    // ----- Таблица с подтаблицами (группами) -----
    if (block.type === 'table-grouped' && block.tables) {
      block.tables.forEach(subtable => {
        const subTitle = document.createElement('h4');
        subTitle.textContent = subtable.subtitle;
        container.appendChild(subTitle);

        const table = document.createElement('table');
        table.className = 'techsheet-table';

        // Заголовок таблицы
        const headerRow = document.createElement('tr');
        const thLabel = document.createElement('th');
        thLabel.textContent = '';
        headerRow.appendChild(thLabel);

        subtable.columns.forEach(col => {
          const th = document.createElement('th');
          th.textContent = col;
          headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Строки
        subtable.rows.forEach(row => {
          const tr = document.createElement('tr');

          const tdLabel = document.createElement('td');
          tdLabel.textContent = row.label;
          tr.appendChild(tdLabel);

          row.values.forEach(value => {
            const td = document.createElement('td');
            td.textContent = value || '-';
            tr.appendChild(td);
          });

          table.appendChild(tr);
        });

        container.appendChild(table);
      });
    }
  }
}
