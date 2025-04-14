
window.jsPDF = window.jspdf;
window.jspdf_loadDejaVuFont = function () {
  if (!window.jspdf || !window.jspdf.jsPDF) return;
  const font = "AAEAAAARAQAABAAQR0RFRlZObEIAAAEAAfQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";  // обрезано для примера, будет заменено на настоящий base64-шрифт
  window.jspdf.jsPDF.API.events.push([
    "addFonts",
    function () {
      this.addFileToVFS("DejaVuSans.ttf", font);
      this.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
    }
  ]);
};
