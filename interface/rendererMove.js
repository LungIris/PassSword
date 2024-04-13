const { ipcRenderer } = require("electron");

const folderForm = document.querySelector('#addFolderForm')
const popup = document.querySelector('#createAndMove');

const fldrForm = document.querySelector('#fldrForm');

function addFolder(e) {
    e.preventDefault()
    const formData = new FormData(fldrForm)
    const folder_name = formData.get('newFldrName')
    
    ipcRenderer.send('new-folder', { folder_name })
    fldrForm.reset();
}
fldrForm.addEventListener('submit', addFolder);
fldrForm.addEventListener('submit', () => {
    window.location.reload();
})
