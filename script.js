const userEmail = sessionStorage.getItem('loggedInUser');
if (!userEmail) window.location.href = "login.html";
let chartInstance = null;
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("symptomForm");
  const date = document.getElementById("date");
  const symptom = document.getElementById("symptom");
  const severity = document.getElementById("severity");
  const notes = document.getElementById("notes");
  const tableBody = document.querySelector("#logTable tbody");
  const toast = document.getElementById("toast");

  const logs = JSON.parse(localStorage.getItem("symptomLogs_" + userEmail)) || [];
  logs.forEach(addEntryToTable);
  renderChart();

  form.onsubmit = (e) => {
    e.preventDefault();
    const entry = { date: date.value, symptom: symptom.value, severity: severity.value, notes: notes.value };
    logs.push(entry);
    localStorage.setItem("symptomLogs_" + userEmail, JSON.stringify(logs));
    addEntryToTable(entry);
    renderChart();
    toast.textContent = "Symptom logged successfully!";
    toast.style.display = "block";
    setTimeout(() => (toast.style.display = "none"), 2000);
    form.reset();
  };

  function addEntryToTable(entry) {
    const row = document.createElement("tr");
    row.innerHTML = `<td class="border p-2">${entry.date}</td><td class="border p-2">${entry.symptom}</td><td class="border p-2">${entry.severity}</td><td class="border p-2">${entry.notes}</td>`;
    tableBody.appendChild(row);
  }
});

function renderChart() {
  const ctx = document.getElementById("symptomChart").getContext("2d");
  const logs = JSON.parse(localStorage.getItem("symptomLogs_" + userEmail)) || [];

  const labels = logs.map(log => log.date);
  const data = logs.map(log => parseInt(log.severity));

  if (chartInstance) chartInstance.destroy();

  // Create gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(75,192,192,0.4)");
  gradient.addColorStop(1, "rgba(75,192,192,0)");

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Symptom Severity Over Time",
        data,
        borderColor: "#2563eb",
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#2563eb",
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Severity: ${context.parsed.y}`;
            }
          }
        },
        title: {
          display: true,
          text: "Symptom Trend Chart",
          font: { size: 18 }
        },
        legend: {
          labels: {
            font: { size: 14 }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
            font: { size: 14 }
          }
        },
        y: {
          beginAtZero: true,
          max: 10,
          title: {
            display: true,
            text: "Severity (1-10)",
            font: { size: 14 }
          }
        }
      }
    }
  });
}


function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const logs = JSON.parse(localStorage.getItem("symptomLogs_" + userEmail)) || [];
  doc.text("Health Matters - Symptom Log Report", 10, 10);
  let y = 20;
  logs.forEach((log, i) => {
    doc.text(`Entry ${i + 1}`, 10, y);
    doc.text(`Date: ${log.date}`, 10, y + 7);
    doc.text(`Symptom: ${log.symptom}`, 10, y + 14);
    doc.text(`Severity: ${log.severity}`, 10, y + 21);
    doc.text(`Notes: ${log.notes}`, 10, y + 28);
    y += 38;
    if (y > 270) {
      doc.addPage(); y = 20;
    }
  });
  doc.save("health-report.pdf");
}
