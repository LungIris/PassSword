const ctx = document.getElementById('lineChart');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['January','February','March','April','May','June','July','August','September','October','December'],
      datasets: [{
        label: 'Logins',
          data: [12, 19, 3, 5, 2, 3, 5, 2, 7, 16, 20, 8, 4, 1, 9, 17],
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