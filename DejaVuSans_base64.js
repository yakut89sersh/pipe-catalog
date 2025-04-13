
window.jsPDF = window.jspdf;
window.jspdf_loadDejaVuFont = function () {
  if (!window.jspdf || !window.jspdf.jsPDF) return;
  const font = atob("..."); // Здесь должен быть закодированный base64 шрифт
  window.jspdf.jsPDF.API.events.push([
    "addFonts",
    function () {
      this.addFileToVFS("DejaVuSans.ttf", font);
      this.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
    }
  ]);
};
