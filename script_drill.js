
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

// 👇 Эта вставка вручную добавит значение pin_length в фильтр, чтобы активировался box_length
if (step === 13) {
  const pinVal = document.getElementById("pin_length")?.value;
  if (pinVal) {
    selected["Pin tong length, mm"] = pinVal;
  }
}


for (let i = 0; i < step; i++) {
  const el = document.getElementById(steps[i].id);
  const val = el?.value;
  if (!val) return;

  // Исключаем длину трубы, т.к. это не часть базы
  if (steps[i].key === "Pipe Length, m") continue;

  selected[steps[i].key] = val;
}

if (stepIndex === 13) {
  const pinVal = document.getElementById("pin_length").value;
  if (pinVal) selected["Pin tong length, mm"] = pinVal;
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
    activatePipeLengthField(select.value); // ← тут только при выборе
    stepShow(11); // ← здесь вручную активируем следующий шаг: Длина трубы
  };

  return; // Останавливаем выполнение
  }

// ✅ ДОБАВЬ ВОТ ЭТО СЮДА
if (step === 11) {
  const group = document.getElementById("length_group").value;
  if (!group) return;
  activatePipeLengthField(group);
  return;
}


// 🔧 ОБРАБОТКА ШАГА "Длина ниппеля под ключ (мм)"
if (step === 12) {
  const pinSelect = document.getElementById("pin_length");
  const values = data
    .map(d => parseFloat(d["Pin tong length, mm"]))
    .filter(v => !isNaN(v));

  if (values.length === 0) return;

  activateCustomLengthField("pin_length", values);
    return;
  
}

// 🔧 ОБРАБОТКА ШАГА "Длина муфты под ключ (мм)"
if (step === 13) {
  const values = filtered
    .map(d => parseFloat(d["Box tong length, mm"]))
    .filter(v => !isNaN(v));

  if (values.length === 0) return;

  activateCustomLengthField("box_length", values);
 
}




if (currentStep.id === "pin_length" || currentStep.id === "box_length") {
  const key = currentStep.key;
  const id = currentStep.id;
  const values = filtered.map(d => parseFloat(d[key])).filter(v => !isNaN(v));

  if (values.length === 0) return;

  activateCustomLengthField(id, values);
  return;
}

// 🔧 ОБРАБОТКА ШАГА "Найти трубу"
if (step === 14) {
  document.getElementById("findBtn").disabled = false;
  return;
}



  // 🔽 СТАНДАРТНАЯ ОБРАБОТКА
  let stepOptions = [...new Set(filtered.map(d => d[currentStep.key]))]
  .filter(v => v !== null && v !== "");

// Проверка: все ли значения — числа
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





function activatePipeLengthField(group) {
  const select = document.getElementById("pipe_length_select");
  const input = document.getElementById("pipe_length_input");
  const wrapper = document.getElementById("pipe_length_wrapper");
  const pipeLengthHidden = document.getElementById("pipe_length");

  wrapper.style.display = "block";
  select.disabled = false;
  select.innerHTML = "";

  let defaultValue = "";
  let min = 0;
  let max = 0;

  if (group === "Группа длин 1 (от 6,1 до 7,01)") {
    defaultValue = "6.4";
    min = 6.1;
    max = 7.01;
  } else if (group === "Группа длин 2 (от 8,84 до 9,75)") {
    defaultValue = "8.96";
    min = 8.84;
    max = 9.75;
  } else if (group === "Группа длин 3 (от 12,19 до 13,72)") {
    defaultValue = "12.19";
    min = 12.19;
    max = 13.72;
  }

  // Добавляем варианты
  const placeholder = document.createElement("option");
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.hidden = true;
  placeholder.textContent = "Выберите...";
  select.appendChild(placeholder);

  const fixedOption = document.createElement("option");
  fixedOption.value = defaultValue;
  fixedOption.textContent = defaultValue;
  select.appendChild(fixedOption);

  const opt2 = document.createElement("option");
  opt2.value = "manual";
  opt2.textContent = "ввести вручную";
  select.appendChild(opt2);

  select.value = "";
  input.style.display = "none";
  input.disabled = true;

  // === Обработка select ===
  select.onchange = function () {
    if (this.value === "manual") {
      input.style.display = "inline-block";
      input.disabled = false;
      input.value = "";
      input.min = min;
      input.max = max;
      input.step = 0.01;
      pipeLengthHidden.value = ""; // обнуляем

    } else {
      input.style.display = "none";
      input.disabled = true;
      input.value = "";
      pipeLengthHidden.value = this.value;
      stepShow(12); // активируем "Длина ниппеля"
    }
  };

  // === Обработка ручного ввода ===
  input.addEventListener("input", function () {
    const val = parseFloat(this.value);
    const decimals = (this.value.split(".")[1] || "").length;

    if (decimals > 2) {
      this.setCustomValidity("Не более двух знаков после запятой.");
    } else if (val < min || val > max) {
      this.setCustomValidity(`Введите значение от ${min} до ${max}`);
    } else {
      this.setCustomValidity("");
      pipeLengthHidden.value = val;
      stepShow(12);
    }
    this.reportValidity();
  });

  input.addEventListener("change", function () {
    let val = parseFloat(this.value);
    if (!isNaN(val)) {
      if (val < min) this.value = min;
      if (val > max) this.value = max;
      pipeLengthHidden.value = this.value;
      stepShow(12);
    }
  });
}







function activateCustomLengthField(id, values) {
  const wrapper = document.getElementById(id + "_wrapper");
  const select = document.getElementById(id);
  const input = document.getElementById(id + "_input");

  wrapper.style.display = "block";
  select.disabled = false;
  select.innerHTML = "";

  const min = Math.min(...values);
  const max = 700;
  const defaultVal = min.toFixed(1);

  // Плейсхолдер
const placeholder = document.createElement("option");
placeholder.disabled = true;
placeholder.selected = true;
placeholder.hidden = true;
placeholder.textContent = "Выберите...";
select.appendChild(placeholder);

// Значение из базы
const opt1 = document.createElement("option");
opt1.value = defaultVal;
opt1.textContent = defaultVal;
select.appendChild(opt1);

// Ввести вручную
const opt2 = document.createElement("option");
opt2.value = "manual";
opt2.textContent = "ввести вручную";
select.appendChild(opt2);

// Очищаем выбор
select.value = "";


  select.onchange = function () {
  if (this.value === "manual") {
    input.style.display = "inline-block";
    input.disabled = false;
    input.value = "";
    input.min = min;
    input.max = max;
    input.step = 0.1;

    input.addEventListener("input", function () {
      const val = parseFloat(this.value);
      const decimals = (this.value.split(".")[1] || "").length;
      if (decimals > 1) {
        this.setCustomValidity("Не более одной цифры после запятой.");
      } else if (val < min || val > max) {
        this.setCustomValidity(`Введите значение от ${min} до ${max}`);
      } else {
        this.setCustomValidity("");
        if (id === "box_length") stepShow(14); // добавлено
      }
    });

  } else {
    input.style.display = "none";
    input.disabled = true;
    input.value = "";
    if (id === "box_length") stepShow(14); // добавлено
  }
};

}










function findPipe() {
  alert("Поиск трубы пока не реализован. Добавим позже.");
}

function selectTab(button) {
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
}
