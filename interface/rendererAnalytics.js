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
    document.getElementById('folders').textContent = data.foldersNumber;
    document.getElementById('reused').textContent = data.reusedPasswords;
    document.getElementById('deleted').textContent = data.deletedItems;
}
ipcRenderer.on('strength-data', (event, passwordsArray) => {
    const strengthResults = passwordsArray.map(getPasswordStrength);
    updatePasswordStrengthChart(strengthResults);
});
function getPasswordStrength(password) {
    let i= 0;
    if(password.length> 6){
        i++;
    }
    if(password.length>= 10){
        i++;
    }
    if(/[A-Z]/.test(password)){
        i++;
    }
    
    if(/[a-z]/.test(password)){
        i++;
    }
    if(/[0-9]/.test(password)){
        i++;
    }
    if(/[A-Za-z0-9]/.test(password)){
        i++;
    }

    if (i > 4) {
        return 'strong';
    }
    else if (i >= 2 && i <= 4) {
        return 'medium';
    }
    else return weak;
}
function updatePasswordStrengthChart(passwordStrength) {
    const strengthCounts = {
        strong: 0,
        medium: 0,
        weak: 0
    };

    passwordStrength.forEach(strength => {
        if (strength === 'strong') {
            strengthCounts.strong++;
        } else if (strength === 'medium') {
            strengthCounts.medium++;
        } else if (strength === 'weak') {
            strengthCounts.weak++;
        }
    });
    const ctx2 = document.getElementById('doughnut');
    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Strong', 'Medium', 'Weak'],
            datasets: [{
                label: 'Password Strength',
                data: [strengthCounts.strong, strengthCounts.medium, strengthCounts.weak],
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
