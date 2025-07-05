
let data = [];
let structure = {};
let recommendations = {};

const steps = [
  "standard",
  "od",
  "wall",
  "tolerance",
  "grade",
  "upset",
  "tooljoint_type",
  "tj_od",
  "tj_id",
  "length_group",
  "pipe_length",
  "tong_nip",
  "tong_box"
];

const map = {
  standard: "Standard",
  od: "Outside diameter, (mm)",
  wall: "Wall Thickness, (mm)",
  tolerance: "Wall Thickness Tolerance, (%)",
  grade: "Grade",
  upset: "Upset Type",
  tooljoint_type: "Tool Joint Type",
  tj_od: "Tool Joint OD, (mm)",
  tj_id: "Tool Joint ID, (mm)",
  length_group: "Length Group",
  pipe_length: "Pipe Body Length, (mm)",
  tong_nip: "Tong Space Pin, (mm)",
  tong_box: "Tong Space Box, (mm)"
};

Promise.all([
  fetch("drill_pipes_data.json").then(res => res.json()),
  fetch("drill_techsheet_structure.json").then(res => res.json()),
  fetch("makeup_torque_recommendations.json").then(res => res.json())
]).then(([jsonData, jsonStruct, jsonRec]) => {
  data = jsonData;
  structure = jsonStruct;
  recommendations = jsonRec;
  initSelectors();
  document.getElementById("findBtn").disabled = false;
});

function initSelectors() {
  fillSelect("standard", [...new Set(data.map(d => d["Standard"]))], true);

  for (let i = 1; i < steps.length; i++) {
    const select = document.getElementById(steps[i]);
    if (select) {
      select.innerHTML = "";
      select.disabled = true;
    }
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
  const selected = {};
  for (let i = 0; i < step; i++) {
    const val = document.getElementById(steps[i]).value;
    if (!val) return;
    selected[map[steps[i]]] = val;
  }

  const filtered = data.filter(d =>
    Object.entries(selected).every(([k, v]) => d[k] == v)
  );

  const nextKey = steps[step];
  if (!nextKey) return;

  const nextField = map[nextKey];
  const options = [...new Set(filtered.map(d => d[nextField]))];

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
