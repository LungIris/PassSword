const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    fetchDataAndUpdateUI();
    updatePasswordStrengthChart();
});

function fetchDataAndUpdateUI() {
    ipcRenderer.send('request-analytics-data');
    ipcRenderer.send('request-strength-data');
    ipcRenderer.on('analytics-data-response', (event, data) => {
        updateCards(data);
    });
}

function updateCards(data) {
    document.getElementById('items').textContent = data.totalItems;
    document.getElementById('accounts').textContent = data.uniqueAccounts;
    document.getElementById('reused').textContent = data.reusedPasswords;
    document.getElementById('deleted').textContent = data.deletedItems;
}
ipcRenderer.on('strength-data', (event, passwordsArray) => {
    
});

function updatePasswordStrengthChart(passwordStrength) {
    const ctx2 = document.getElementById('doughnut');
    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Strong', 'Medium', 'Weak'],
            datasets: [{
                label: 'Password Strength',
                data: [5, 3, 2],
                backgroundColor: [
                    '#2ed344', '#ffa500', '#f00',
                ],
                borderColor: [
                    '#2ed344', '#ffa500', '#f00',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}
