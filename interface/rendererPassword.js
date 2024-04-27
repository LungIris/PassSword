const { ipcRenderer } = require("electron");

const addPasswordForm = document.getElementById('addPasswordForm');


const websites=[
    {"name": "Facebook", "url": "https://www.facebook.com"},
    {"name": "Instagram", "url": "https://www.instagram.com"},
    {"name": "Twitter", "url": "https://www.twitter.com"}
]
const websiteNames = websites.map(website => website.name);
console.log(websiteNames);
const sortedWebsites = websiteNames.sort();
let input = document.getElementById("title");
function displayWebsites(value) {
    input.value = value;
    removeElements();
}
input.addEventListener("keyup", (e) => {
    removeElements();

    for (let i of sortedWebsites) {
        if (i.toLowerCase().startsWith(input.value.toLowerCase()) && input.value != "") {
            let listItem = document.createElement("li");
            listItem.classList.add("list-items");
            listItem.style.cursor = "pointer";
            listItem.onclick = function() { displayWebsites(i); }; 
            let word = "<b>" + i.substring(0, input.value.length) + "</b>";
            word += i.substring(input.value.length);
            listItem.innerHTML = word;
            document.querySelector(".list").appendChild(listItem);
        
        }
    }
})

function removeElements() {
    let items = document.querySelectorAll(".list-items");
    items.forEach((item)=>{
        item.remove();
    });
}
function addPassword(e) {
    console.log('this is add password');
    e.preventDefault();
    const formData = new FormData(addPasswordForm);
    const title = formData.get('title');
    const address = formData.get('address');
    const user = formData.get('user');
    const password = formData.get('password');
    const folder = '';
    ipcRenderer.send('new-password', { title, address, user, password , folder});
    addPasswordForm.reset();
    window.location.href = 'dashboard.html';
}
addPasswordForm.addEventListener('submit', addPassword);


