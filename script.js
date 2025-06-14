const form = document.getElementById('symptomForm');
const chartData = { labels: [], data: [] };
let chartInstance = null;

document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById('date');
  const symptomInput = document.getElementById('symptom');
  const severityInput = document.getElementById('severity');
  const notesInput = document.getElementById('notes');
  const tableBody = document.querySelector("#logTable tbody");
  const toast = document.getElementById("toast");

  loadEntries();
  renderChart();

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const entry = {
      date: dateInput.value,
      symptom: symptomInput.value,
      severity: severityInput.value,
      notes: notesInput.value
    };

    saveEntry(entry);
    addEntryToTable(entry);
    renderChart();
    showToast("Symptom logged successfully!");
    form.reset();
  });

  function saveEntry(entry) {
    let logs = JSON.parse(localStorage.getItem("symptomLogs")) || [];
    logs.push(entry);
    localStorage.setItem("symptomLogs", JSON.stringify(logs));
  }

  function loadEntries() {
    let logs = JSON.parse(localStorage.getItem("symptomLogs")) || [];
    logs.forEach(addEntryToTable);
  }

  function addEntryToTable(entry) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border p-2">${entry.date}</td>
      <td class="border p-2">${entry.symptom}</td>
      <td class="border p-2">${entry.severity}</td>
      <td class="border p-2">${entry.notes}</td>
    `;
    tableBody.appendChild(row);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 2500);
  }
});

function renderChart() {
  const ctx = document.getElementById('symptomChart').getContext('2d');
  const logs = JSON.parse(localStorage.getItem("symptomLogs")) || [];

  const labels = logs.map(log => log.date);
  const data = logs.map(log => parseInt(log.severity));

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Symptom Severity Over Time',
        data: data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 10
        }
      }
    }
  });
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const logs = JSON.parse(localStorage.getItem("symptomLogs")) || [];

  doc.setFontSize(16);
  doc.text("Health Matters - Symptom Log Report", 10, 10);

  let y = 20;
  logs.forEach((log, index) => {
    doc.setFontSize(12);
    doc.text(`Entry ${index + 1}`, 10, y);
    doc.text(`Date: ${log.date}`, 10, y + 7);
    doc.text(`Symptom: ${log.symptom}`, 10, y + 14);
    doc.text(`Severity: ${log.severity}`, 10, y + 21);
    doc.text(`Notes: ${log.notes}`, 10, y + 28);
    y += 38;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.output("dataurlnewwindow");

}
