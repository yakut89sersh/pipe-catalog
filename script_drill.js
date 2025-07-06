let data = [];

fetch("drill_pipes_data.json")
  .then(res => res.json())
  .then(jsonData => {
    data = jsonData;
    initSelectors();
    document.getElementById("findBtn").disabled = false;
  });

const steps = [
  { id: "standard", key: "Standard" },
  { id: "pipe_od", key: "Pipe Body OD, mm" },
  { id: "wall", key: "Wall Thickness, mm" },
  { id: "tolerance", key: "Tolerance pipe body wall thickness, %" },
  { id: "grade", key: "Pipe Grade" },
  { id: "upset", key: "Upset Type" },
  { id: "joint_type", key: "Type tool joints" },
  { id: "joint_style", key: "RSC Type" },
  { id: "od_joint", key: "Coupling OD, mm" },
  { id: "id_joint", key: "Coupling ID, mm" },
  { id: "length_group", key: "length_group" },
  { id: "pipe_length", key: "Pipe Length, m" },
  { id: "pin_length", key: "Pin tong length, mm" },
  { id: "box_length", key: "Box tong length, mm" }
];

function initSelectors() {
  fillSelect(steps[0].id, [...new Set(data.map(d => d[steps[0].key]))], true);
  for (let i = 1; i < steps.length; i++) {
    const select = document.getElementById(steps[i].id);
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
  const selected = {};
  for (let i = 0; i < step; i++) {
    let val;
    if (steps[i].id === "pipe_length") {
      const select = document.getElementById("pipe_length_select");
      const input = document.getElementById("pipe_length_input");
      val = select.value === "manual" ? input.value : select.value;
      if (!val) return;
    } else {
      const el = document.getElementById(steps[i].id);
      val = el?.value;
      if (!val) return;
    }

    if (steps[i].key === "Pipe Length, m") continue;

    selected[steps[i].key] = val;
  }

  const filtered = data.filter(d =>
    Object.entries(selected).every(([k, v]) => d[k] == v)
  );

  const currentStep = steps[step];
  if (!currentStep) return;

  if (currentStep.id === "length_group") {
    const select = document.getElementById("length_group");
    select.disabled = false;
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    placeholder.textContent = "Выберите...";
    select.appendChild(placeholder);

    const lengthOptions = [
      "Группа длин 1 (от 6,1 до 7,01)",
      "Группа длин 2 (от 8,84 до 9,75)",
      "Группа длин 3 (от 12,19 до 13,72)"
    ];

    lengthOptions.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      select.appendChild(o);
    });

    select.onchange = () => {
      activatePipeLengthField(select.value);
      stepShow(11);
    };

    return;
  }

  if (step === 11) {
    const group = document.getElementById("length_group").value;
    if (!group) return;
    activatePipeLengthField(group);
    return;
  }

  if (step === 12) {
    const pinSelect = document.getElementById("pin_length");
    const values = filtered
      .map(d => parseFloat(d["Pin tong length, mm"]))
      .filter(v => !isNaN(v));

    if (values.length === 0) return;

    activateCustomLengthField("pin_length", values);
    stepShow(13);
    return;
  }

  if (currentStep.id === "pin_length" || currentStep.id === "box_length") {
    const key = currentStep.key;
    const id = currentStep.id;
    const values = filtered.map(d => parseFloat(d[key])).filter(v => !isNaN(v));

    if (values.length === 0) return;

    activateCustomLengthField(id, values);
    return;
  }

  let stepOptions = [...new Set(filtered.map(d => d[currentStep.key]))]
    .filter(v => v !== null && v !== "");

  const allNumeric = stepOptions.every(val => !isNaN(parseFloat(val)));

  if (allNumeric) {
    stepOptions.sort((a, b) => parseFloat(a) - parseFloat(b));
  }

  const nextSelect = document.getElementById(currentStep.id);
  nextSelect.disabled = false;
  nextSelect.innerHTML = "";

  if (stepOptions.length > 0) {
    const placeholder = document.createElement("option");
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    placeholder.textContent = "Выберите...";
    nextSelect.appendChild(placeholder);

    stepOptions.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      nextSelect.appendChild(o);
    });
  }
}
