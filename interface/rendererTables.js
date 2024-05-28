const { ipcRenderer } = require("electron");
const crypto = require('crypto');

const puppeteer = require('puppeteer');

ipcRenderer.on('passwords-data', (event, passwordData) => {
    const passwordTable = document.querySelector('#passwordTbl');

    passwordData.forEach(password => {
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
        if (password.dataValues.folder) {
            newRow.setAttribute('data-folder', password.dataValues.folder);
        }
        else {
            newRow.setAttribute('data-folder', 'None');
        }
        if (password.dataValues.password) {
            newRow.setAttribute('data-password', password.dataValues.password);
        }
        else {
            newRow.setAttribute('data-password', 'None');
        }
        if (password.dataValues.iv) {
            newRow.setAttribute('data-iv', password.dataValues.iv);
        }
        else {
            newRow.setAttribute('data-iv', 'None');
        }
        const actionCell = document.createElement('td');
        actionCell.innerHTML = `<button class"tooltip" data-tooltip="Add to favorites"><ion-icon name="star-outline"></ion-icon></button>
        <button class="tooltip" data-tooltip="Launch Website"><ion-icon name="rocket-outline"></ion-icon></button>
        <button><ion-icon name="trash-outline"></ion-icon></button>`;
        newRow.appendChild(titleCell);
        newRow.appendChild(addressCell);
        newRow.appendChild(userCell);
        newRow.appendChild(actionCell);
        passwordTable.appendChild(newRow);
        newRow.addEventListener('click', openItemInfo);

        const favoriteBtn = actionCell.children[0];
    favoriteBtn.addEventListener('click', function(event) {
        event.stopPropagation(); 
        const itemTitle = password.dataValues.title; 
        const username=sessionStorage.getItem('username')

        ipcRenderer.send('set-folder-to-favorites', { itemTitle,username });
        showPopup('moveMessage');
        setTimeout(function() {
        hidePopup('moveMessage');
        window.location.reload();

         }, 1000);
    });
    const deleteBtn = actionCell.children[2];
    deleteBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        const itemTitle = password.dataValues.title; 
        const username = sessionStorage.getItem('username');
        ipcRenderer.send('move-item-to-trash', { itemTitle,username });
        window.location.reload();
    }) 
        
        const launchWebsiteBtn = actionCell.children[1];
    launchWebsiteBtn.addEventListener('click', async function (event) {
            event.stopPropagation();
            const itemTitle = password.dataValues.title;
        const username = password.dataValues.user;
            const encryptedPassword = password.dataValues.password;
            const iv = password.dataValues.iv;
            const sessionKey = await getSessionKey();
        const decryptedPassword = decryptPassword(encryptedPassword, iv, sessionKey);
        
        const browserPreference = await getBrowser();
            const browserPath = getBrowserPath(browserPreference);

            const browser = await puppeteer.launch({
                executablePath: browserPath,
                headless: false
            });
            const page = await  browser.newPage();
            await page.goto(password.dataValues.address);
            
            //await page.waitForSelector('input[type="password"]');
            const usernameSelectors = ['input[name="username"]', 'input[name="user"]', 'input[name="email"]','input[name="id"]','input[name="userLoginId"]'];
            const passwordSelectors = ['input[type="password"]'];

            
            const usernameField = await findWorkingSelector(page, usernameSelectors);
            if (usernameField) {
                await page.type(usernameField, username);
            }else {
                console.error("No valid username field found.");
                return;
            }
        
            const passwordField = await findWorkingSelector(page, passwordSelectors);
            if (passwordField) {
                await page.type(passwordField, decryptedPassword);
            } else {
                console.error("No valid password field found. Proceeding without password entry.");
                return; 
            }            
        })
        async function findWorkingSelector(page, selectors) {
            for (let selector of selectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 500 });
                    return selector;
                } catch (error) {
                    console.log(`Selector not found: ${selector}`);
                }
            }
            return null;
        }
    });
});
function getSessionKey() {
    return new Promise((resolve, reject) => {
        const username = sessionStorage.getItem('username');
        ipcRenderer.send('get-key', { username });
        ipcRenderer.once('get-key-response', (event, keyResponse) => {
            if (keyResponse.success) {
                resolve(keyResponse.sessionKey); 
            } else {
                reject('Failed to retrieve session key: ' + keyResponse.message); 
            }
        });
    });
}
function getBrowser() {
    return new Promise((resolve, reject) => {
        const username = sessionStorage.getItem('username');
        ipcRenderer.send('get-browser', { username });
        ipcRenderer.once('send-browser', (event, { browser }) => {
            if (browser) {
                resolve(browser); 
            } else {
                reject('Failed to retrieve browser: ' + response.message); 
            }
        });
    })
}
document.addEventListener('DOMContentLoaded', () => {
    const username=sessionStorage.getItem('username')
    ipcRenderer.send('request-passwords-data',{username});

    const addButton = document.querySelector('#addFolderBtn');
    addButton.addEventListener('click', () => {
        window.location.reload();
    });
});


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
    const iv = this.getAttribute('data-iv');
    const username = sessionStorage.getItem('username');
    ipcRenderer.send('get-key', { username });
    ipcRenderer.once('get-key-response', (event, keyResponse) => {
        const sessionKey = keyResponse.sessionKey;
        const deleteCard = document.getElementById('delete-card');
    deleteCard.addEventListener("click", function (event) {
        event.stopPropagation();
        const itemTitle = title; 
        const username = sessionStorage.getItem('username');
        ipcRenderer.send('move-item-to-trash', { itemTitle,username });
        window.location.reload();

    });
    const decryptedPassword = decryptPassword(password, iv, sessionKey);
    if (decryptedPassword) {
        const editButton = itemInfo.querySelector('.editButton button');
        movePopupTitle.textContent = title;
        updateItemInfo(title, user, website, folder, imageSrc);
        editButton.onclick = () => openEditPage(title, website, user, decryptedPassword, imageSrc);
    } else {
        console.error('Failed to decrypt password');
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

function openEditPage(title, website, user, password,imageSrc) {
    const url = `editPassword.html?title=${encodeURIComponent(title)}&website=${encodeURIComponent(website)}&user=${encodeURIComponent(user)}&password=${encodeURIComponent(password)}&image=${imageSrc}`;
    window.location.href = url;
}
function closeItemInfo() {
    itemInfo.classList.remove('active');
    itemInfo.classList.add('inactive');    
}
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
         const username=sessionStorage.getItem('username')

        ipcRenderer.send('move-to-folder',{selectedItem,selectedFolder,username})
          
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



    let sidebar= document.querySelector('.sidebar');
    let navbar=document.querySelector(".navbar");
    let addPassword=document.querySelector(".addPassword");
    let submenu=document.querySelector(".submenu");
    document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    });

   
    let MenuList= document.querySelectorAll('.MenuList li');
    function activeLink(){
        MenuList.forEach((item)=> 
            item.classList.remove('active'));  
        setTimeout(() => {
        if (!this.classList.contains('dropdown')) {
        this.classList.add('active');
    }
        }, 100);
    }
    MenuList.forEach((item)=> 
    item.addEventListener('click',activeLink));

    let button= document.querySelectorAll('.addPassword a');
    button.forEach(btn =>{
        btn.onmousemove= function(e){
            let x= e.pageX - btn.offsetLeft;
            let y= e.pageY - btn.offsetTop;

            btn.style.setProperty('--x', x + 'px');
            btn.style.setProperty('--y', y + 'px');

        }
    })
    document.addEventListener('DOMContentLoaded', function() {

     


    const arrowIcon = document.querySelector('.title .arrow');
    const submenu = document.querySelector('.dropdown .submenu');
    let dropdown=document.querySelector('.dropdown');
    arrowIcon.addEventListener('click', function() {
        submenu.classList.toggle('active');
        dropdown.classList.toggle('active');
        arrowIcon.classList.toggle('flip');
    });

    const foldersIcon=document.querySelector('.dropdown .title .icon');
    const openPopup=document.querySelector('.openPopup');
    const blur = document.getElementById('blur');
    const popup = document.getElementById('popup');

    openPopup.addEventListener("click",function(){
            blur.classList.toggle('active'),
            popup.classList.toggle('active')
    });
    
    const card=document.getElementById('dropdown-card');
    card.addEventListener("click",function(){
        var dropdownMenu = document.getElementById('dropdown-menu');
        dropdownMenu.classList.toggle('active');
    });

    
    function showPopup(popupId) {
        document.getElementById(popupId).style.display = "block";
    }
    document.getElementById('remove-option').addEventListener('click',function(event){
        event.preventDefault();
        showPopup('remove-popup');
        document.getElementById('remove-message').innerText = "Item removed";
        setTimeout(function() {
            hidePopup('remove-popup');
            window.location.reload();

        }, 1000);

    })

    document.getElementById('move-option').addEventListener('click', function(event) {
        event.preventDefault();
        showPopup('move-popup');
        blur.classList.toggle('active');

    });
    // Function to hide popup
    function hidePopup(popupId) {
        document.getElementById(popupId).style.display = "none";

    }

   
    const itemInfo = document.querySelector('.itemInfo');

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
            hidePopup('move-popup');
            blur.classList.toggle('active');
            showPopup('moveMessage');
            setTimeout(function() {
            hidePopup('moveMessage');
            window.location.reload();

        }, 1000);
        


        }
    });
    const closeBtnMoveToFolder = document.querySelector('.popupMoveToFolder .closeBtn');
    closeBtnMoveToFolder.addEventListener('click', function () {
            hidePopup('move-popup');
            blur.classList.toggle('active');

        });

    const closeCreateAndMove=document.querySelector('.createAndMove .closeBtn');
    closeCreateAndMove.addEventListener('click',function(){
        hidePopup('createAndMove');
    })

    const closeAddFolder=document.querySelector('.popup .closeBtn');
    closeAddFolder.addEventListener('click',function(){
        popup.classList.toggle('active');
        blur.classList.toggle('active');
    })
    
})


function getBrowserPath(browserName) {
    switch (browserName) {
        case 'Google Chrome':
            return 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'; 
        case 'Microsoft Edge':
            return 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'; 
        default:
            return puppeteer.executablePath(); 
    }
}
