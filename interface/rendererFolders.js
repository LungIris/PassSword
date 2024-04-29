const { ipcRenderer } = require("electron");

ipcRenderer.on('folder-items-data', (event, passwordData) => {
    const passwordTable = document.querySelector('#passwordTbl');

    passwordData.forEach(password => {
        const newRow = document.createElement('tr');
        const titleCell = document.createElement('td');
        const logo = `./logos/${password.dataValues.title}`;
        if (logo) {
            titleCell.innerHTML = `<div class="content">
        <div class="tableImage"><img src="${logo}" /></div>
        <div class="tableTitle">${password.dataValues.title}</div>
        </div>`
        }
        else {
            titleCell.innerHTML = `<div class="content">
        <div class="tableImage"><img src="images/biometric.png" /></div>
        <div class="tableTitle">${password.dataValues.title}</div>
        </div>` 
        }
        const addressCell = document.createElement('td');
        addressCell.textContent = password.dataValues.address;

        const userCell = document.createElement('td');
        userCell.textContent = password.dataValues.user;
        if (password.dataValues.folder) {
            newRow.setAttribute('data-folder', password.dataValues.folder);
        }
        else {
            newRow.setAttribute('data-folder', 'None');
        }
        newRow.setAttribute('data-user', password.dataValues.user);
        newRow.setAttribute('data-password', password.dataValues.password);
        const actionCell = document.createElement('td');
        actionCell.innerHTML = `<button class"tooltip" data-tooltip="Remove from folder"><ion-icon name="remove-circle-outline"></ion-icon></button>
        <button class="tooltip" data-tooltip="Launch Website"><ion-icon name="rocket-outline"></ion-icon></button>
        <button><ion-icon name="trash-outline"></ion-icon></button>`;
        newRow.appendChild(titleCell);
        newRow.appendChild(addressCell);
        newRow.appendChild(userCell);
        newRow.appendChild(actionCell);
        passwordTable.appendChild(newRow);
        newRow.addEventListener('click', openItemInfo);

        const removeButton = actionCell.children[0];
        removeButton.addEventListener('click', function (event) {
            event.stopPropagation();
            const itemTitle = password.dataValues.title;
            ipcRenderer.send('remove-item-from-folder', { itemTitle });
            setTimeout(function() {
                window.location.reload();
        
            }, 1000);
        })

    const deleteBtn = actionCell.children[2];
    deleteBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        const itemTitle = password.dataValues.title; 
        ipcRenderer.send('move-item-to-trash', { itemTitle });
        window.location.reload();
    }) 
    });
    
});

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('request-folders-data');
    const currentFolder = document.getElementById('pageTitle').textContent;
    ipcRenderer.send('request-folder-items',{currentFolder});
    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    });
});
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

const itemInfo = document.querySelector('.itemInfo');
const closeBtn = document.querySelector('.itemInfo .closeBtn');
const movePopupTitle = document.querySelector('#move-popup h2');

function updateItemInfo(title, user, website, folder, imageSrc) {
    itemInfo.querySelector('.itemTitle').textContent = title;
    itemInfo.querySelector('.itemWebsite').textContent = `Website :  ${website}`;
    itemInfo.querySelector('.itemImage img').src = imageSrc;
    if (folder && folder.trim() !== '') {
        itemInfo.querySelector('.itemFolder').textContent = `Folder :  ${folder}`;
    } else {
        itemInfo.querySelector('.itemFolder').textContent = "Folder: None";
    }    itemInfo.classList.remove('inactive');
    itemInfo.classList.add('active');
}
function openItemInfo() {
    const title = this.querySelector('.tableTitle').textContent;
    const user = this.querySelector('td:nth-child(3)').textContent;
    const website = this.querySelector('td:nth-child(2)').textContent;
    const imageSrc = this.querySelector('.tableImage img').src;
    const folder = this.getAttribute('data-folder');
    const password = this.getAttribute('data-password');
    movePopupTitle.textContent = title;
    const editButton = itemInfo.querySelector('.editButton button');
    updateItemInfo(title, user, website, folder, imageSrc);
    editButton.onclick = () => openEditPage(title, website, user, password);
}
function openEditPage(title, website, user, password) {
    const url = `editPassword.html?title=${encodeURIComponent(title)}&website=${encodeURIComponent(website)}&user=${encodeURIComponent(user)}&password=${encodeURIComponent(password)}`;
    window.location.href = url;
}
// Function to close item info
function closeItemInfo() {
    itemInfo.classList.remove('active');
    itemInfo.classList.add('inactive');    
}
    // Add click event listener to close button
    closeBtn.addEventListener('click', closeItemInfo);

 document.getElementById('move-btn').addEventListener('click', function(event) {
        var folderSelect = document.getElementById('folder-list');
        var selectedFolder = folderSelect.options[folderSelect.selectedIndex].value;
           
     if (selectedFolder === 'New Folder') {
            event.preventDefault();
            let create=document.getElementById('createAndMove');
            create.classList.add('active');
            showPopup('createAndMove');

        } else {
         event.preventDefault();
         const movePopupTitle = document.querySelector('#move-popup h2').textContent;
         const selectedItem = movePopupTitle;     

        ipcRenderer.send('move-to-folder',{selectedItem,selectedFolder})
          
        document.getElementById('move-message').innerText = "Item moved to folder "+selectedFolder;
        hidePopup('move-popup');
        blur.classList.toggle('active');
        showPopup('moveMessage');
        setTimeout(function() {
            hidePopup('moveMessage');
            }, 1000);

        }
 });
    
document.getElementById('remove-option').addEventListener('click', function (event) {
    event.preventDefault();
    const itemTitle = document.querySelector('.itemInfo .itemTitle').textContent;

    ipcRenderer.send('remove-item-from-folder', { itemTitle });     
    

});

ipcRenderer.on('folder-removed', (event, response) => {
    if (response.success) {
        console.log('Folder removal successful.');
        
    } else {
        console.error('Failed to remove folder:', response.error);
    }
});
