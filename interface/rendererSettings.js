
const { ipcRenderer } = require('electron');
const crypto = require('crypto');

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
    ipcRenderer.send('get-browser', { username });
    ipcRenderer.send('request-folders-data', { username });
    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    })
    ipcRenderer.send('get-launchApp-status', { username });
});
ipcRenderer.on('send-browser', (event, { browser }) => {
    if (browser) {
        const selectElement = document.getElementById('browserPreference');
        selectElement.value = browser;
    }
    else {
        reject('Failed to retrieve browser: ' + response.message); 
    }
});
ipcRenderer.on('launchApp-status-response', (event, { launchApp }) => {
    if (launchApp === '1') {
        toggleBtn2.classList.add("active");
    } else {
        toggleBtn2.classList.remove("active");
    }
});
document.getElementById('confirmChangePassword').addEventListener('click', () => {
    const username = sessionStorage.getItem('username');
    ipcRenderer.send('get-password-data',{username});
    ipcRenderer.once('password-data-response', (event, response) => {
        const username = sessionStorage.getItem('username');
        ipcRenderer.send('get-key', { username });
        ipcRenderer.once('get-key-response', (event, keyResponse) => {
            const username = sessionStorage.getItem('username')
            const sessionKey = keyResponse.sessionKey;
            const decryptedPasswords = response.data.map(item => {
                
                return {
                    ...item,
                    title: item.dataValues.title,
                    user: item.dataValues.user,
                    address: item.dataValues.address,
                    decryptedPassword: decryptPassword(item.dataValues.password, item.dataValues.iv, sessionKey)
                };
            });
            const oldPassword = document.getElementById('myPassword1').value;
            const newPass = document.getElementById('myPassword2').value;
            const confirmPassword = document.getElementById('myPassword3').value;

            if (newPass !== confirmPassword) {
                alert("New passwords do not match.");
                return;
            }
           
            ipcRenderer.send('password-request', { oldPassword, newPass, username, decryptedPasswords });
            ipcRenderer.once('change-password-response', (event, changeResponse) => {
                const username = sessionStorage.getItem('username')
                const sessionKey = changeResponse.newKey;
                const decryptedPasswords = changeResponse.decryptedPasswords;
                decryptedPasswords.forEach(pass => {
                    const title = pass.title;
                    const address = pass.address;
                    const user = pass.user;
                    const password = pass.decryptedPassword;

                    ipcRenderer.send('update-password', { title, address, user, password, username, sessionKey });
                })
            })

        })
    })
});
function decryptPassword(encryptedPassword, ivHex, sessionKey) {
    try {
        const key = Buffer.from(sessionKey, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}
ipcRenderer.on('change-password-response', (event, response) => {
    if (response.success) {
        alert('Password changed successfully.');
        window.location.href = 'settings.html';
    } else {
        alert(response.message);
    }
});



document.getElementById('browserPreference').addEventListener('change', async function() {
    const selectedBrowser = this.value;
    const username = sessionStorage.getItem('username');

    ipcRenderer.send('update-browser-preference', { username, browser: selectedBrowser });
});

const toggleBtn2 = document.getElementById("toggleBtn2");
toggleBtn2.addEventListener('click', () => {
    toggleBtn2.classList.toggle("active");
    const isActive = toggleBtn2.classList.contains("active") ? '1' : '0';
    const username = sessionStorage.getItem('username');
    ipcRenderer.send('update-launchApp', { username, launchApp: isActive });

})


