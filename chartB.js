const ctx2 = document.getElementById('doughnut');

new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Strong','Medium','Weak'],
      datasets: [{
        label: 'Passwords:',
          data: [27,21,12],
          backgroundColor: [
            '#2ed344',
            '#ffa500',
              '#f00',
              
          ],
          borderColor: [
            '#2ed344',
            '#ffa500',
            '#f00',
            
          ],
          borderWidth: 1
      }]
    },
    options: {
        responsive: true
    }
  });