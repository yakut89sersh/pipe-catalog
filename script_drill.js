
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
  { id: "pin_length", key: "Pin length, mm" },
  { id: "box_length", key: "Box length, mm" }
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

    // 👇 сразу активируем поле длины трубы
    document.getElementById("pipe_length_wrapper").style.display = "block";
    activatePipeLengthField(select.value); // если уже выбрано значение
    select.onchange = () => activatePipeLengthField(select.value);

// Если значение уже выбрано — активировать поле сразу
if (select.value) {
  activatePipeLengthField(select.value);
}


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






function activatePipeLengthField() {
  const group = document.getElementById("length_group").value;
  const select = document.getElementById("pipe_length_select");
  const input = document.getElementById("pipe_length_input");
  const wrapper = document.getElementById("pipe_length_wrapper");

  wrapper.style.display = "block";
  select.disabled = false;
  select.innerHTML = "";

  let defaultValue = "";
  let min = 0;
  let max = 0;

  if (group.includes("1")) {
    defaultValue = "6.4";
    min = 6.1;
    max = 7.01;
  } else if (group.includes("2")) {
    defaultValue = "8.96";
    min = 8.84;
    max = 9.75;
  } else if (group.includes("3")) {
    defaultValue = "12.19";
    min = 12.19;
    max = 13.72;
  }

  const opt1 = document.createElement("option");
  opt1.value = defaultValue;
  opt1.textContent = defaultValue;

  const opt2 = document.createElement("option");
  opt2.value = "manual";
  opt2.textContent = "ввести вручную";

  select.appendChild(opt1);
  select.appendChild(opt2);

  select.onchange = function () {
    if (this.value === "manual") {
      input.style.display = "inline-block";
      input.disabled = false;
      input.value = "";
      input.min = min;
      input.max = max;
      input.step = 0.01;

      input.addEventListener("input", function () {
        const val = parseFloat(this.value);
        const decimals = (this.value.split(".")[1] || "").length;
        if (decimals > 2) {
          this.setCustomValidity("Не более двух знаков после запятой.");
        } else if (val < min || val > max) {
          this.setCustomValidity(`Введите значение от ${min} до ${max}`);
        } else {
          this.setCustomValidity("");
        }
      });

    } else {
      input.style.display = "none";
      input.disabled = true;
      input.value = "";
    }
  // 👇 Вызов следующего шага (активируем "длина ниппеля под ключ")
    stepShow(12);
    };
    // 👇 если по умолчанию уже выбрано значение — сразу показать следующий шаг
  if (select.value !== "manual") {
    stepShow(12);
  }
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

  const opt1 = document.createElement("option");
  opt1.value = defaultVal;
  opt1.textContent = defaultVal;

  const opt2 = document.createElement("option");
  opt2.value = "manual";
  opt2.textContent = "ввести вручную";

  select.appendChild(opt1);
  select.appendChild(opt2);

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
        }
      });

    } else {
      input.style.display = "none";
      input.disabled = true;
      input.value = "";
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
