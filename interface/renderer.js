const { ipcRenderer } = require("electron");
const folderForm = document.querySelector('#addFolderForm')

function addFolder(e) {
    e.preventDefault()
    const formData = new FormData(folderForm)
    const folder_name = formData.get('newFolderName')
    
    ipcRenderer.send('new-folder',{folder_name})
}
folderForm.addEventListener('submit',addFolder)