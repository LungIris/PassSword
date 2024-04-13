const { ipcRenderer } = require("electron");

ipcRenderer.on('passwords-data', (event, passwordData) => {
    const passwordTable = document.querySelector('#passwordTbl');

    passwordData.forEach(password => {
        const newRow = document.createElement('tr');
        const titleCell = document.createElement('td');
        titleCell.innerHTML = `<div class="content">
        <div class="tableImage"><img src="images/biometric.png" /></div>
        <div class="tableTitle">${password.dataValues.title}</div>
        </div>`
        const addressCell = document.createElement('td');
        addressCell.textContent = password.dataValues.address;

        const userCell = document.createElement('td');
        userCell.textContent = password.dataValues.user;

        const actionCell = document.createElement('td');
        actionCell.innerHTML = `<button class="tooltip" data-tooltip="Launch Website"><ion-icon name="rocket-outline"></ion-icon></button>
        <button><ion-icon name="trash-outline"></ion-icon></button>`;
        newRow.appendChild(titleCell);
        newRow.appendChild(addressCell);
        newRow.appendChild(userCell);
        newRow.appendChild(actionCell);
        passwordTable.appendChild(newRow);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('request-passwords-data');
    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    });
});