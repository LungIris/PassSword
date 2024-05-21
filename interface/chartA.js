function getLoginDataForChart() {
  const username = sessionStorage.getItem('username');
  const logins = JSON.parse(localStorage.getItem('monthlyLogins')) || {};
  const userLogins = logins[username] || {};
  const data = [];
  const labels = [];

  const currentYear = new Date().getFullYear();
   for (let month = 0; month < 12; month++) { 
       const key = `${currentYear}-${month}`;
       labels.push(new Date(currentYear, month).toLocaleString('default', { month: 'long' })); // Get month name
       data.push(userLogins[key] || 0); // Push the number of logins for this month or 0 if none
      }
  return { labels, data };

}

function updateChart() {
  const { labels, data } = getLoginDataForChart();
  const ctx = document.getElementById('lineChart');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Logins',
        data: data,
        backgroundColor: [
          '#2ed344'
        ],
        borderColor: [
            '#2ed344'
        ],
      borderWidth: 1
    }]
  },
  options: {
      responsive: true
  }
});
}