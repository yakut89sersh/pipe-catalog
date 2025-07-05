let data = [];
let structure = {};
let recommendations = {};



Promise.all([
  fetch("drill_pipes_data.json").then(res => res.json()),
  fetch("drill_techsheet_structure.json").then(res => res.json())
]).then(([jsonData, jsonStruct, jsonRec]) => {
  data = jsonData;
  structure = jsonStruct;
  recommendations = jsonRec;
  initSelectors();
  document.getElementById("findBtn").disabled = false;
});



function initSelectors() {
  fillSelect("standard", [...new Set(data.map(d => d["Standard"]))], true);

  const steps = [
    "od", "wall", "tolerance", "grade", "upset",
    "jointtype", "jointstyle", "od_joint", "id_joint",
    "length_group", "pipe_length", "tong_nip", "tong_box"
  ];

  for (const id of steps) {
    const select = document.getElementById(id);
    select.innerHTML = "";
    select.disabled = true;
  }
}

function fillSelect(id, options, withPlaceholder = true) {
  const select = document.getElementById(id);
  select.innerHTML = "";

  if (withPlaceholder) {
    const placeholder = document.createElement("option");
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    placeholder.textContent = "Выберите...";
    select.appendChild(placeholder);
  }

  options.forEach(opt => {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    select.appendChild(o);
  });
}

function stepShow(step) {
  const steps = [
    "standard", "od", "wall", "tolerance", "grade", "upset",
    "jointtype", "jointstyle", "od_joint", "id_joint",
    "length_group", "pipe_length", "tong_nip", "tong_box"
  ];

  const selected = {};
  for (let i = 0; i < step; i++) {
    const val = document.getElementById(steps[i]).value;
    if (!val) return;
    selected[steps[i]] = val;
  }

  const filtered = data.filter(d =>
    Object.entries(selected).every(([k, v]) => d[k] == v)
  );

  const nextKey = steps[step];
  if (!nextKey) return;

  const options = [...new Set(filtered.map(d => d[nextKey]))];
  const nextSelect = document.getElementById(nextKey);
  nextSelect.disabled = false;
  nextSelect.innerHTML = "";

  if (options.length > 0) {
    const placeholder = document.createElement("option");
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    placeholder.textContent = "Выберите...";
    nextSelect.appendChild(placeholder);

    options.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      nextSelect.appendChild(o);
    });
  }
}

function findPipe() {
  alert("Поиск трубы пока не реализован. Добавим позже.");
}

/* переключение между трубами */

function selectTab(button) {
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
}
