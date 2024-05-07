const { ipcRenderer } = require("electron");

const folderForm = document.querySelector('#addFolderForm')
const popup = document.querySelector('#popup');
const blur = document.querySelector('#blur');
const submenu = document.querySelector('#submenu');
const editForm = document.querySelector('#editPasswordForm');
function addFolder(e) {
    e.preventDefault()
    const formData = new FormData(folderForm)
    const folder_name = formData.get('newFolderName')
    const username=sessionStorage.getItem('username')

    ipcRenderer.send('new-folder', {
        folder_name, username
     })
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

document.addEventListener('DOMContentLoaded', () => {
    const username=sessionStorage.getItem('username')

    ipcRenderer.send('request-folders-data', { username });
    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    })
});

ipcRenderer.on('update-password-response', (event, response) => {
    if (response.success) {
        alert('Update successful!');
        window.location.href = 'dashboard.html'; 
    } else {
        alert(`Failed to update: ${response.message}`);
    }
});



