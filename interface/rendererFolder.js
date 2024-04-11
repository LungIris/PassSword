const { ipcRenderer } = require("electron");

const folderForm = document.querySelector('#addFolderForm')
const popup = document.querySelector('#popup');
const blur = document.querySelector('#blur');
const submenu = document.querySelector('#submenu');
const createAndMovePopup = document.querySelector('#createAndMove');
const movePopup = document.querySelector('#move-popup');
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
    console.log("entered folder data");
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
        
            const option = document.createElement('option');
            option.value = folder.dataValues.folder_name;
            option.textContent = folder.dataValues.folder_name;
            folderList.appendChild(option);
        
    });
   
});

// Request folders data when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('request-folders-data');
    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    });
    const createAndMoveButton = document.querySelector('#createAndMove button[type="submit"]');
    createAndMoveButton.addEventListener('click', () => {
        const folderNameInput = document.querySelector('.createAndMove input[type="text"]');
        const folderName = folderNameInput.value.trim();
        if (folderName !== '') {
            // Send folder name to the main process for creation
            ipcRenderer.send('new-folder', { folder_name: folderName });
            // Clear input field
            folderNameInput.value = '';
        }
    });
    

});