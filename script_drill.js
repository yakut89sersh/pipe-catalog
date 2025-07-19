
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
  // Это собирает все выбранные значения до текущего шага, чтобы отфильтровать базу данных.
   resetStepsFrom(step);
  const selected = {};


  // 🔁 Логика при которой очищаем все шаги ниже текущего если что-то изменилочь в списках сверху
  
  for (let i = step + 1; i < steps.length; i++) {
    const stepToClear = steps[i];
    const element = document.getElementById(stepToClear.id);
    if (!element) continue;
    if (element.tagName === "SELECT") {
      element.innerHTML = "";
      element.disabled = true;
    }
     const input = document.getElementById(stepToClear.id + "_input");
    if (input) {
      input.value = "";
      input.style.display = "none";
      input.disabled = true;
    }
    const wrapper = document.getElementById(stepToClear.id + "_wrapper");
    if (wrapper && stepToClear.id !== "pipe_length" && stepToClear.id !== "pin_length" && stepToClear.id !== "box_length") {
  wrapper.style.display = "none";
    }
  }

 

for (let i = 0; i < step; i++) {
  const el = document.getElementById(steps[i].id);
  const val = el?.value;
  if (!val) return;
  if (steps[i].key === "Pipe Length, m") continue;
  selected[steps[i].key] = val;
}

// Фильтруем базу данных.На основе выбранных параметров отбираем только те строки в базе, которые соответствуют этим значениям.
  const filtered = data.filter(d =>
    Object.entries(selected).every(([k, v]) => d[k] == v)
  );

  // Определяем текущий шаг.Получаем объект текущего шага (например: pipe_od, wall, grade и т.д.)
  const currentStep = steps[step];
  if (!currentStep) return;


// Специальная обработка некоторых шагов (11–14). Это шаги, у которых особая логика отображения:
// 🔽 Шаг 11 — length_group (Группа длин)
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


// 🔽 Шаг 12 — pipe_length (Длина трубы)
if (step === 11) {
  const group = document.getElementById("length_group").value;
  if (!group) return;
  activatePipeLengthField(group);
  return;
}


// 🔽 Шаг 13 — pin_length (Длина ниппеля)
if (step === 12) {
  const values = data
    .map(d => parseFloat(d["Pin tong length, mm"]))
    .filter(v => !isNaN(v));
  if (values.length === 0) return;
  activateCustomLengthField("pin_length", values);
  return;
}


// 🔽 Шаг 14 — box_length (Длина муфты)
if (step === 13) {
  const values = data
    .map(d => parseFloat(d["Box tong length, mm"]))
    .filter(v => !isNaN(v));
  if (values.length === 0) return;
  activateCustomLengthField("box_length", values);
  return;
}

// 🔽ОБРАБОТКА ШАГА "Найти трубу"
if (step === 14) {
  document.getElementById("findBtn").disabled = false;
  return;
}

// 🔽Он отвечает за обработку шагов с нестандартной логикой — а именно:pin_length — длина ниппеля под ключ; и box_length — длина муфты под ключ.
if (currentStep.id === "pin_length" || currentStep.id === "box_length") {
  const key = currentStep.key;
  const id = currentStep.id;
  const values = filtered.map(d => parseFloat(d[key])).filter(v => !isNaN(v));
  if (values.length === 0) return;
  activateCustomLengthField(id, values);
  return;
}




// 🔽 СТАНДАРТНАЯ ОБРАБОТКА остальных шагов
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

// 🔽 для сброса длины трубы
function resetPipeLength() {
  const select = document.getElementById("pipe_length_select");
  const input = document.getElementById("pipe_length_input");
  const hidden = document.getElementById("pipe_length");

  select.value = "";
  select.disabled = true;
  select.innerHTML = "";
  input.value = "";
  input.style.display = "none";
  input.disabled = true;
  hidden.value = "";
}


function resetStepsFrom(index) {
  if (index <= 10) {
    resetPipeLength();
  }

  for (let i = index + 1; i < steps.length; i++) {
    const step = steps[i];
    const el = document.getElementById(step.id);
    if (!el) continue;

    if (el.tagName === "SELECT") {
      el.value = "";
      el.disabled = true;
    } else if (el.tagName === "INPUT") {
      el.value = "";
      el.disabled = true;
    }

    const wrapper = document.getElementById(step.id + "_wrapper");
if (
  wrapper &&
  step.id !== "pipe_length" &&
  step.id !== "pin_length" &&
  step.id !== "box_length"
) {
  wrapper.style.display = "none";
}
  
 // 🔧 Скрываем подсказку
    const hint = document.getElementById(step.id + "_hint");
    if (hint) {
      hint.style.display = "none";
    }
  }

  

  document.getElementById("findBtn").disabled = true;
}














function activatePipeLengthField(group) {
  const select = document.getElementById("pipe_length_select");
  const input = document.getElementById("pipe_length_input");
  const wrapper = document.getElementById("pipe_length_wrapper");
  const pipeLengthHidden = document.getElementById("pipe_length");
  const hint = document.getElementById("pipe_length_hint");

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
    defaultValue = "8.84";
    min = 8.84;
    max = 9.75;
  } else if (group === "Группа длин 3 (от 12,19 до 13,72)") {
    defaultValue = "12.19";
    min = 12.19;
    max = 13.72;
  }

 // 🔹 Обновляем подсказку
  hint.textContent = `Введите значение от ${min} м до ${max} м с точностью до 0,1 м`;
  hint.style.display = "none";


  // Добавляем варианты
  const placeholder = document.createElement("option");
placeholder.value = ""; // обязательно!
placeholder.disabled = true;
placeholder.hidden = true;
placeholder.textContent = "Выберите...";
select.appendChild(placeholder);

select.value = ""; // важно: выбрать именно пустое значение!

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

 // ❗ СБРОС ПОЛЕЙ "ниппель" и "муфта"
["pin_length", "box_length"].forEach(function (id) {
  const s = document.getElementById(id);
  const i = document.getElementById(id + "_input");
  const h = document.getElementById(id + "_hint");

  if (s) {
    s.value = "";
    s.disabled = true;
  }

  if (i) {
    i.value = "";
    i.disabled = true;
    i.style.display = "none";
  }

  if (h) {
    h.style.display = "none";
  }
});


// Сброс шагов ниже
    resetStepsFrom(11); // сбрасываем шаги начиная с шага 12 (индекс 11)

      input.style.display = "inline-block";
      input.disabled = false;
      input.value = "";
      input.min = min;
      input.max = max;
      input.step = 0.01;
      pipeLengthHidden.value = ""; // обнуляем

      hint.style.display = "inline-block";
      
 





    } else {
      input.style.display = "none";
      input.disabled = true;
      input.value = "";
      pipeLengthHidden.value = this.value;

       hint.style.display = "none";

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
  const hint = document.getElementById(id + "_hint");

  wrapper.style.display = "block";
  select.disabled = false;
  select.innerHTML = "";

  const min = Math.min(...values);
  const max = 700;
  const defaultVal = min.toFixed(1);

  hint.textContent = `Введите значение от ${defaultVal} мм до 700 мм`;
  hint.style.display = "none";



  // Плейсхолдер
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.hidden = true;
  placeholder.textContent = "Выберите...";
  select.appendChild(placeholder);
  select.value = ""; // обязательно ставим после appendChild


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
  input.style.display = "none";
  input.disabled = true;


  select.onchange = function () {
  if (this.value === "manual") {


    
    input.style.display = "inline-block";
    input.disabled = false;
    input.value = "";
    input.min = min;
    input.max = max;
    input.step = 0.1;
    hint.style.display = "inline-block";


      // ❗ СБРОС следующего шага
      if (id === "pin_length") {
        const boxSelect = document.getElementById("box_length");
        const boxInput = document.getElementById("box_length_input");
        const boxHint = document.getElementById("box_length_hint");

       boxSelect.disabled = true;
      boxInput.disabled = true;
      boxInput.style.display = "none";
      boxInput.value = "";
      boxHint.style.display = "none";

      }


      
    } else {
      input.style.display = "none";
      input.disabled = true;
      input.value = "";
      hint.style.display = "none";

      
      if (id === "pin_length") stepShow(13);
      if (id === "box_length") stepShow(14);
    }
  };



    // === Обработка ручного ввода ===
    input.addEventListener("input", function () {
      const val = parseFloat(this.value);
      const decimals = (this.value.split(".")[1] || "").length;

      if (decimals > 1) {
        this.setCustomValidity("Не более одной цифры после запятой.");
      } else if (val < min || val > max) {
        this.setCustomValidity(`Введите значение от ${min} до ${max}`);
      } else {
        this.setCustomValidity("");

         if (id === "pin_length") stepShow(13);
         if (id === "box_length") stepShow(14);
      }

      this.reportValidity();
    });

  input.addEventListener("change", function () {
    const val = parseFloat(this.value);
    if (!isNaN(val) && val >= min && val <= max) {
      if (id === "pin_length") stepShow(13);
      if (id === "box_length") stepShow(14);
    }

  if (this.checkValidity()) {
    if (id === "pin_length") stepShow(13);
    if (id === "box_length") stepShow(14);
}



  });
}
















function findPipe() {
  alert("Поиск трубы пока не реализован. Добавим позже.");
}

function selectTab(button) {
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
}
