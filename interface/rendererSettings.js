
const { ipcRenderer } = require('electron');

document.getElementById('confirmChangePassword').addEventListener('click', () => {
    const oldPassword = document.getElementById('myPassword1').value;
    const newPass = document.getElementById('myPassword2').value;
    const confirmPassword = document.getElementById('myPassword3').value;

    if (newPass !== confirmPassword) {
        alert("New passwords do not match.");
        return;
    }
    const username=sessionStorage.getItem('username')
    ipcRenderer.send('change-password-request', { oldPassword, newPass ,username});
});

ipcRenderer.on('change-password-response', (event, response) => {
    if (response.success) {
        alert('Password changed successfully.');
        window.location.href = 'settings.html';
    } else {
        alert(response.message);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const username = sessionStorage.getItem('username');
    if (username) {
        ipcRenderer.send('get-user-email', { username });

    } else {
        console.log('Username not found');
    }
});


ipcRenderer.on('send-user-email', (event, { email }) => {
    if (email) {
        console.log(email);
        document.getElementById('emailInput').textContent = email;
    } else {
        console.log('No email found for the user.');
    }
});



