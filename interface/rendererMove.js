const { ipcRenderer } = require("electron");

const folderForm = document.querySelector('#addFolderForm')
const popup = document.querySelector('#createAndMove');
const fldrForm = document.querySelector('#fldrForm');

function addFolder(e) {
    e.preventDefault()
    const formData = new FormData(fldrForm)
    const folder_name = formData.get('newFldrName')
    const selectedItem = document.querySelector('.itemInfo .itemTitle').textContent;
    const selectedFolder = folder_name;
    ipcRenderer.send('new-folder', { folder_name })
    ipcRenderer.send('move-to-folder',{selectedItem,selectedFolder})
    fldrForm.reset();
    document.getElementById('move-message').innerText = "Item moved to folder "+selectedFolder;
        hidePopup('move-popup');
        blur.classList.toggle('active');
        showPopup('moveMessage');
        setTimeout(function() {
            hidePopup('moveMessage');
            }, 1000);
}
fldrForm.addEventListener('submit', addFolder);
fldrForm.addEventListener('submit', () => {
    window.location.reload();
})
function addFolder2(e) {
    e.preventDefault()
    const formData = new FormData(folderForm)
    const folder_name = formData.get('newFolderName')
    
    ipcRenderer.send('new-folder', { folder_name })
    popup.classList.remove('active');
    blur.classList.remove('active');
    folderForm.reset();
}

folderForm.addEventListener('submit', addFolder2);

const submenu = document.querySelector('#submenu');

const folderList = document.querySelector('#folder-list');
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

        const option = document.createElement('option');
        option.value = folder.dataValues.folder_name;
        option.textContent = folder.dataValues.folder_name;
        folderList.appendChild(option);
    })
})

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('request-folders-data');
    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    });

});
