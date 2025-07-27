
async function loadTechsheetStructureDrill() {
  const response = await fetch('techsheet_structure_drill.json');
  return await response.json();
}

function createTechsheetBlock(title) {
  const block = document.createElement('div');
  block.className = 'techsheet-block';

  const header = document.createElement('h2');
  header.textContent = title;
  block.appendChild(header);

  return block;
}

function createStandardTable(columns, rows) {
  const table = document.createElement('table');
  table.className = 'techsheet-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.appendChild(document.createElement('th')); // пустая ячейка для заголовка строки
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    const labelCell = document.createElement('td');
    labelCell.textContent = row.label;
    tr.appendChild(labelCell);
    row.values.forEach(value => {
      const td = document.createElement('td');
      td.textContent = value || '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}

function renderGroupedTables(tables) {
  const wrapper = document.createElement('div');
  tables.forEach(tableData => {
    const subtitle = document.createElement('h3');
    subtitle.textContent = tableData.subtitle;
    wrapper.appendChild(subtitle);

    const table = createStandardTable(tableData.columns, tableData.rows);
    wrapper.appendChild(table);
  });
  return wrapper;
}

function renderDrillTechsheet(structure) {
  const container = document.getElementById('techsheet-result');
  container.innerHTML = '';

  // "Общие сведения" — отдельно от всех
  if (Array.isArray(structure)) {
    structure.forEach(block => {
      const section = createTechsheetBlock(block.title);

      if (block.rows) {
        const ul = document.createElement('ul');
        block.rows.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${item.label}:</strong> — <span>${item.value || ''}</span>`;
          ul.appendChild(li);
        });
        section.appendChild(ul);
      }

      container.appendChild(section);
    });
  } else {
    console.error("Структура должна быть массивом.");
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const structure = await loadTechsheetStructureDrill();
  renderDrillTechsheet(structure);
});
