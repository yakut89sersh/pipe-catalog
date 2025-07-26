document.addEventListener("DOMContentLoaded", function () {
  const findBtn = document.getElementById("findBtn");

  if (findBtn) {
    findBtn.addEventListener("click", () => {
      // 👇 пока тестовый пример, потом заменим расчётами
      const mockData = {
        "Outside diameter, (mm)": "127.0",
        "Wall Thickness, (mm)": "9.19",
        "Inside diameter, (mm)": "108.62",
        "Drift diameter, (mm)": "105.0",
        "Pipe weight, (kg/m)": "20.47",
        "Thread type": "NC50",
        "Pipe grade": "G-105",
        "Range": "R-3",
        "Minimum yield strength, (MPa)": "724",
        "Minimum tensile strength, (MPa)": "965",
        "Connection OD, (mm)": "152.4",
        "Connection ID, (mm)": "95.0",
        "Connection length, (mm)": "300",
        "Make-up loss, (mm)": "90",
        "Torsional strength, (kN·m)": "17.5",
        "Tensile strength connection, (kN)": "1200"
      };

      renderTechsheet(mockData, "techsheet_structure_drill.json");
    });
  }
});
