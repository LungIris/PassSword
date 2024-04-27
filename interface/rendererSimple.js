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

// Request folders data when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('request-folders-data');
    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    })
});
document.addEventListener('DOMContentLoaded', () => {
    editForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        const address = document.getElementById('websiteField').value; // Change to .value
        const user = document.getElementById('userField').value; // Change to .value
        const password = document.getElementById('myPassword').value;const title = new URLSearchParams(window.location.search).get('title');

        ipcRenderer.send('update-password', { title,address, user, password });
    });
});
ipcRenderer.on('update-password-response', (event, response) => {
    if (response.success) {
        alert('Update successful!');
        window.location.href = 'dashboard.html'; // Redirect back to dashboard or other appropriate page
    } else {
        alert(`Failed to update: ${response.message}`);
    }
});