let data = [];

const steps = [
  { id: "standard", key: "Standard" },
  { id: "od", key: "Pipe Body OD, mm" },
  { id: "wall", key: "Wall Thickness, mm" },
  { id: "tolerance", key: "Tolerance pipe body wall thickness, %" },
  { id: "grade", key: "Pipe Grade" },
  { id: "upset", key: "Upset Type" },
  { id: "jointtype", key: "Type tool joints" },
  { id: "jointstyle", key: "RSC Type" },
  { id: "od_joint", key: "Coupling OD, mm" },
  { id: "id_joint", key: "Coupling ID" },
  { id: "length_group", key: "length_group" },
  { id: "pipe_length", key: "pipe_length" },
  { id: "tong_nip", key: "Pin tong length, mm" },
  { id: "tong_box", key: "Box tong length, mm" }
];

fetch("drill_pipes_data.json")
  .then(res => res.json())
  .then(jsonData => {
    data = jsonData;
    initSelectors();
    document.getElementById("findBtn").disabled = false;
  });

function initSelectors() {
  fillSelect("standard", [...new Set(data.map(d => d["Standard"]))], true);

  for (const { id } of steps.slice(1)) {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = "";
      select.disabled = true;
    }
  }
}

function fillSelect(id, options, withPlaceholder = true) {
  const select = document.getElementById(id);
  if (!select) return;
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
  const selected = {};
  for (let i = 0; i < step; i++) {
    const { id, key } = steps[i];
    const val = document.getElementById(id)?.value;
    if (!val) return;
    selected[key] = val;
  }

  const { id, key } = steps[step];
  const filtered = data.filter(d =>
    Object.entries(selected).every(([k, v]) => d[k] == v)
  );

  const options = [...new Set(filtered.map(d => d[key]))];
  const nextSelect = document.getElementById(id);
  if (!nextSelect) return;

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

function selectTab(button) {
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
}