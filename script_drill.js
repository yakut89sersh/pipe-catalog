
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
  { id: "pipe_length", key: "pipe_length" },
  { id: "pin_length", key: "Pin tong length, mm " },
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
    const el = document.getElementById(steps[i].id);
    const val = el?.value;
    if (!val) return;
    selected[steps[i].key] = val;
  }

  const filtered = data.filter(d =>
    Object.entries(selected).every(([k, v]) => d[k] == v)
  );

  const currentStep = steps[step];
  if (!currentStep) return;


// 🔽 КАСТОМНАЯ ОБРАБОТКА ГРУППЫ ДЛИН
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

    const options = [
      "Группа длин 1 (от 6,1 до 7,01)",
      "Группа длин 2 (от 8,84 до 9,75)",
      "Группа длин 3 (от 12,19 до 13,72)"
    ];

    options.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      select.appendChild(o);
    });

    return; // 🔁 Остановить выполнение дальше — важно!
  }



  // 🔽 СТАНДАРТНАЯ ОБРАБОТКА
  const options = [...new Set(filtered.map(d => d[currentStep.key]))];
  const nextSelect = document.getElementById(currentStep.id);
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

// 🔽 КАСТОМНый ввод дины трубы 
if (currentStep.id === "pipe_length") {
  const group = document.getElementById("length_group")?.value || "";
  const select = document.getElementById("pipe_length_select");
  const input = document.getElementById("pipe_length_input");
  const wrapper = document.getElementById("pipe_length_wrapper");

  select.disabled = false;
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.hidden = true;
  placeholder.textContent = "Выберите...";
  select.appendChild(placeholder);

  let defaultVal = "", min = "", max = "";
  if (group.includes("1")) {
    defaultVal = "6.4"; min = "6.10"; max = "7.01";
  } else if (group.includes("2")) {
    defaultVal = "8.96"; min = "8.84"; max = "9.75";
  } else if (group.includes("3")) {
    defaultVal = "12.19"; min = "12.19"; max = "13.72";
  }

  const defaultOption = document.createElement("option");
  defaultOption.value = defaultVal;
  defaultOption.textContent = defaultVal;
  select.appendChild(defaultOption);

  const manualOption = document.createElement("option");
  manualOption.value = "manual";
  manualOption.textContent = "Ввести вручную";
  select.appendChild(manualOption);

  input.style.display = "none";
  input.value = "";
  input.disabled = false;
  input.min = min;
  input.max = max;
  input.step = "0.01";

  input.addEventListener("input", function () {
    const val = parseFloat(this.value);
    const decimals = (this.value.split(".")[1] || "").length;
    if (decimals > 2) {
      this.setCustomValidity("Введите значение с точностью не более двух знаков после запятой.");
    } else if (val < parseFloat(this.min) || val > parseFloat(this.max)) {
      this.setCustomValidity("Значение вне допустимого диапазона.");
    } else {
      this.setCustomValidity("");
    }
  });

  return;
}

}

function handlePipeLengthOptionChange() {
  const select = document.getElementById("pipe_length_select");
  const input = document.getElementById("pipe_length_input");

  if (select.value === "manual") {
    input.style.display = "inline-block";
  } else {
    input.style.display = "none";
    input.value = ""; // очистим ручной ввод, если выбрано не "ввести вручную"
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
