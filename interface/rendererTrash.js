const { ipcRenderer } = require("electron");

const folderForm = document.querySelector('#addFolderForm')
const popup = document.querySelector('#popup');
const blur = document.querySelector('#blur');
const submenu = document.querySelector('#submenu');
const folderList = document.querySelector('#folder-list');

function addFolder(e) {
    e.preventDefault()
    const formData = new FormData(folderForm)
    const folder_name = formData.get('newFolderName')
    
    ipcRenderer.send('new-folder', { folder_name })
    popup.classList.remove('active');
    blur.classList.remove('active');
    folderForm.reset();
}
folderForm.addEventListener('submit', addFolder);

ipcRenderer.on('folders-data', (event, foldersTable) => {
    foldersTable.forEach(folder => {
        const folderLink = document.createElement('a');
        folderLink.href = `folders.html?title=${encodeURIComponent(folder.folder_name)}`;
        folderLink.textContent = folder.dataValues.folder_name;
        folderLink.classList.add('link');

        folderLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            const title = this.textContent; 
            window.location.href = `folders.html?title=${encodeURIComponent(title)}`;
        });
        submenu.appendChild(folderLink);

    })
})
ipcRenderer.on('trash-data', (event, trashData) => {
    const passwordTable = document.querySelector('#passwordTbl');
    trashData.forEach(password => {
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
        actionCell.innerHTML = `<button class"tooltip" data-tooltip="Recover item"><ion-icon name="arrow-undo-outline"></ion-icon></button>
        <button class="tooltip" data-tooltip="Permanently delete"><ion-icon name="trash-outline"></ion-icon></button>`;
        newRow.appendChild(titleCell);
        newRow.appendChild(addressCell);
        newRow.appendChild(userCell);
        newRow.appendChild(actionCell);
        passwordTable.appendChild(newRow);

        const recoverBtn = actionCell.children[0];
        recoverBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            const itemTitle = password.dataValues.title;
            ipcRenderer.send('recover-item', { itemTitle });
            showPopup('moveMessage');
            setTimeout(function() {
                hidePopup('moveMessage');
                window.location.reload();
        
                 }, 1000);
        })

        const deleteButton = actionCell.children[1];
        deleteButton.addEventListener('click', function (event) {
            event.stopPropagation();
            const itemTitle = password.dataValues.title;
            ipcRenderer.send('permanently-delete', { itemTitle });
            setTimeout(function() {
                window.location.reload();
        
            }, 1000);
        })
    })
})

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('request-trash-data');
    ipcRenderer.send('request-folders-data');

    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    });

});