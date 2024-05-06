const { ipcRenderer } = require("electron");

const folderForm = document.querySelector('#addFolderForm')
const popup = document.querySelector('#popup');
const blur = document.querySelector('#blur');
const submenu = document.querySelector('#submenu');

function addFolder(e) {
    e.preventDefault()
    const formData = new FormData(folderForm)
    const folder_name = formData.get('newFolderName')
    const username=sessionStorage.getItem('username')

    ipcRenderer.send('new-folder', { folder_name,username })
    popup.classList.remove('active');
    blur.classList.remove('active');
    folderForm.reset();
}
folderForm.addEventListener('submit', addFolder);

ipcRenderer.on('folders-data', (event, foldersTable,username) => {
    foldersTable.forEach(folder => {
        const folderDiv = document.createElement('div');
        folderDiv.classList.add('folder-item');

        const folderLink = document.createElement('a');
        folderLink.href = `folders.html?title=${encodeURIComponent(folder.folder_name)}`;
        folderLink.textContent = folder.dataValues.folder_name;
        folderLink.classList.add('link');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
         const icon = document.createElement('ion-icon');
         icon.setAttribute('name', 'trash-outline');
 
         deleteButton.appendChild(icon); 
 
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            event.preventDefault();
            deleteFolder(folder.dataValues.folder_name); 
        });

        folderLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            const title = this.textContent; 
            window.location.href = `folders.html?title=${encodeURIComponent(title)}`;
        });
        folderDiv.appendChild(folderLink);
        folderDiv.appendChild(deleteButton);
        submenu.appendChild(folderDiv);
    })
})
function deleteFolder(folder_name) {
    const username=sessionStorage.getItem('username')

    ipcRenderer.send('delete-folder', { folder_name,username });
    window.location.reload();
}
ipcRenderer.on('trash-data', (event, trashData,username) => {
    const passwordTable = document.querySelector('#passwordTbl');
    trashData.forEach(password => {
        const newRow = document.createElement('tr');
        const titleCell = document.createElement('td');
        const logo = `./logos/${password.dataValues.title}`;
        titleCell.innerHTML = `<div class="content">
        <div class="tableImage"><img src="${logo}" onerror="this.onerror=null; this.src='images/biometric.png';" />
        </div>
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
            const username=sessionStorage.getItem('username')

            ipcRenderer.send('recover-item', { itemTitle,username });
            setTimeout(function() {
                window.location.reload();
        
                 }, 1000);
        })

        const deleteButton = actionCell.children[1];
        deleteButton.addEventListener('click', function (event) {
            event.stopPropagation();
            const itemTitle = password.dataValues.title;
            const username=sessionStorage.getItem('username')

            ipcRenderer.send('permanently-delete', { itemTitle,username });
            setTimeout(function() {
                window.location.reload();
        
            }, 1000);
        })
    })
})
document.addEventListener('DOMContentLoaded', () => {
    const username=sessionStorage.getItem('username')

    ipcRenderer.send('request-trash-data', { username });
    ipcRenderer.send('request-folders-data',{username});

    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    });

});