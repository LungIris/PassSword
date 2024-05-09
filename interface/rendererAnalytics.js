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

    ipcRenderer.send('request-folders-data', { username });
    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    })
});
document.addEventListener('DOMContentLoaded', function() {
    fetchDataAndUpdateUI();
    updateChart();
});

function fetchDataAndUpdateUI() {
    const username = sessionStorage.getItem('username');
    ipcRenderer.send('request-analytics-data',{username});
    ipcRenderer.on('analytics-data-response', (event, data) => {
        updateCards(data);
    });
    ipcRenderer.send('get-password-data',{username});
    ipcRenderer.on('password-data-response', (event, response) => {
        if (response.success && response.data) {
            const username = sessionStorage.getItem('username');

            ipcRenderer.send('get-key', { username });
            ipcRenderer.once('get-key-response', (event, keyResponse) => {
                const sessionKey = keyResponse.sessionKey;
                const decryptedPasswords = response.data.map(item => {
                    return {
                        ...item,
                        decryptedPassword: decryptPassword(item.dataValues.password, item.dataValues.iv, sessionKey)
                    };
                });
                getStrengthResult(decryptedPasswords);
                updateReusedItems(decryptedPasswords);
            });
            
    
        } else {
            console.log('No data received or decryption failed:', response.message);
        }
    });
}

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

function updateCards(data) {
    document.getElementById('items').textContent = data.totalItems;
    document.getElementById('folders').textContent = data.foldersNumber;
    document.getElementById('deleted').textContent = data.deletedItems;
}
function updateReusedItems(decryptedPasswords) {
    const passwordCount = {};
    decryptedPasswords.forEach(password => {
        if (passwordCount[password.decryptedPassword]) {
            passwordCount[password.decryptedPassword]++;
        } else {
            passwordCount[password.decryptedPassword] = 1;
           }
           
       });
       let duplicateCount = 0;
    for (let password in passwordCount) {
           if (passwordCount[password] > 1) {
               duplicateCount += passwordCount[password] - 1; 
           }
    }
    document.getElementById('reused').textContent = duplicateCount;

}

function getStrengthResult(decryptedPasswords) {
    const strengthResult = decryptedPasswords.map(getPasswordStrength);
    updatePasswordStrengthChart(strengthResult);

}

function getPasswordStrength(password) {
    let score = 0;

    if (password.decryptedPassword.length > 6) score++;
    if (password.decryptedPassword.length >= 15) score++;

    if (/[A-Z]/.test(password.decryptedPassword)) score++;
    if (/[a-z]/.test(password.decryptedPassword)) score++;
    if (/[0-9]/.test(password.decryptedPassword)) score++;

    if (/\W|_/g.test(password.decryptedPassword)) score++;


    if (score > 4) {
        return 'strong';
    } else if (score >= 2 && score <= 4) {
        return 'medium';
    } else {
        return 'weak';
    }
}

function updatePasswordStrengthChart(passwordStrength) {
    const strengthCounts = {
        strong: 0,
        medium: 0,
        weak: 0
    };

    passwordStrength.forEach(strength => {
        if (strength === 'strong') {
            strengthCounts.strong++;
        } else if (strength === 'medium') {
            strengthCounts.medium++;
        } else if (strength === 'weak') {
            strengthCounts.weak++;
        }
    });
    const ctx2 = document.getElementById('doughnut');
    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Strong', 'Medium', 'Weak'],
            datasets: [{
                label: 'Password Strength',
                data: [strengthCounts.strong, strengthCounts.medium, strengthCounts.weak],
                backgroundColor: [
                    '#2ed344', '#ffa500', '#f00',
                ],
                borderColor: [
                    '#2ed344', '#ffa500', '#f00',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

