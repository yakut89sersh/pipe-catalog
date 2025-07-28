export function renderDrillTechsheet(container, structure, data) {
  container.innerHTML = ''; // Очистка содержимого

  const title = document.createElement('h2');
  title.textContent = 'Технический лист данных бурильной трубы';
  title.classList.add('techsheet-title');
  container.appendChild(title);

  structure.forEach(section => {
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = section.title;
    sectionTitle.classList.add('techsheet-section-title');
    container.appendChild(sectionTitle);

    if (section.type === 'table-grouped') {
      section.tables.forEach(table => {
        const subtitle = document.createElement('h4');
        subtitle.textContent = table.subtitle;
        subtitle.classList.add('techsheet-subtitle');
        container.appendChild(subtitle);

        const tableEl = document.createElement('table');
        tableEl.classList.add('techsheet-table');

        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        headRow.appendChild(document.createElement('th')); // Пустая ячейка для заголовков строк
        table.columns.forEach(col => {
          const th = document.createElement('th');
          th.textContent = col;
          headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        tableEl.appendChild(thead);

        const tbody = document.createElement('tbody');
        table.rows.forEach(row => {
          const tr = document.createElement('tr');
          const labelTd = document.createElement('td');
          labelTd.textContent = row.label;
          tr.appendChild(labelTd);

          table.columns.forEach((_, i) => {
            const td = document.createElement('td');
            td.textContent = row.values?.[i] ?? '';
            tr.appendChild(td);
          });

          tbody.appendChild(tr);
        });
        tableEl.appendChild(tbody);
        container.appendChild(tableEl);
      });
    } else if (section.type === 'table') {
      const tableEl = document.createElement('table');
      tableEl.classList.add('techsheet-table');

      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      headRow.appendChild(document.createElement('th')); // Пустая ячейка для заголовков строк
      section.columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      tableEl.appendChild(thead);

      const tbody = document.createElement('tbody');
      section.rows.forEach(row => {
        const tr = document.createElement('tr');
        const labelTd = document.createElement('td');
        labelTd.textContent = row.label;
        tr.appendChild(labelTd);

        section.columns.forEach((_, i) => {
          const td = document.createElement('td');
          td.textContent = row.values?.[i] ?? '';
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
      tableEl.appendChild(tbody);
      container.appendChild(tableEl);
    } else if (section.type === 'summary') {
      const tableEl = document.createElement('table');
      tableEl.classList.add('techsheet-table');

      const tbody = document.createElement('tbody');
      section.rows.forEach(row => {
        const tr = document.createElement('tr');

        const labelTd = document.createElement('td');
        labelTd.textContent = row.label;
        tr.appendChild(labelTd);

        const valueTd = document.createElement('td');
        valueTd.textContent = data[row.key] || '';
        tr.appendChild(valueTd);

        tbody.appendChild(tr);
      });
      tableEl.appendChild(tbody);
      container.appendChild(tableEl);
    }
  });
}