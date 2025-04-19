
function renderTechsheetHTML(result, structure) {
  const sections = ['common', 'pipe', 'connection'];
  const colors = {
    common: ['#e0efff', '#d4e9fb'],
    pipe: ['#e0fff0', '#d3f7e5'],
    connection: ['#fff3d9', '#fcefd0']
  };

  const title = document.createElement('h2');
  title.style.textAlign = 'center';
  title.style.fontWeight = 'bold';
  title.innerText = `Технический лист данных для ${result['Name'] === 'НКТ' ? 'НКТ' : 'обсадной трубы'} ${result['Outside diameter, (mm)']} x ${result['Wall Thickness, (mm)']} мм, гр. пр. ${result['Pipe grade']}, ${result['Thread type']} по ${result['Standard']}`;

  const container = document.createElement('div');
  container.appendChild(title);

  sections.forEach(section => {
    const block = document.createElement('div');
    block.className = 'block';

    const heading = document.createElement('div');
    heading.className = 'block-title';
    heading.innerText = structure.sections[section];
    block.appendChild(heading);

    let zebra = colors[section];
    let count = 0;

    structure.sections_order[section].forEach(key => {
      if (result[key] !== null && result[key] !== undefined) {
        const row = document.createElement('div');
        row.className = 'row';
        row.style.backgroundColor = zebra[count % 2];

        const label = document.createElement('div');
        label.className = 'label';
        label.innerText = structure.fields[key];

        const value = document.createElement('div');
        value.className = 'value';
        value.innerText = result[key];

        row.appendChild(label);
        row.appendChild(value);
        block.appendChild(row);

        count++;
      }
    });

    container.appendChild(block);
  });

  return container;
}
