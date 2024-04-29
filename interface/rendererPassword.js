const { ipcRenderer } = require("electron");

const addPasswordForm = document.getElementById('addPasswordForm');
let inputAddress = document.getElementById("address");
let websiteLogo = document.getElementById("logo"); // Assuming this is the ID for your image element


const websites = [
    {"name": "Facebook", "url": "https://www.facebook.com"},
    {"name": "Instagram", "url": "https://www.instagram.com"},
    {"name": "Twitter", "url": "https://www.twitter.com"},
    {"name": "YouTube", "url": "https://www.youtube.com"},
    {"name": "Google", "url": "https://www.google.com"},
    {"name": "Yahoo", "url": "https://www.yahoo.com"},
    {"name": "Reddit", "url": "https://www.reddit.com"},
    {"name": "Pinterest", "url": "https://www.pinterest.com"},
    {"name": "LinkedIn", "url": "https://www.linkedin.com"},
    {"name": "Amazon", "url": "https://www.amazon.com"},
    {"name": "eBay", "url": "https://www.ebay.com"},
    {"name": "Walmart", "url": "https://www.walmart.com"},
    {"name": "TripAdvisor", "url": "https://www.tripadvisor.com"},
    {"name": "Yelp", "url": "https://www.yelp.com"},
    {"name": "Hulu", "url": "https://www.hulu.com"},
    {"name": "Twitch", "url": "https://www.twitch.tv"},
    {"name": "IMDb", "url": "https://www.imdb.com"},
    {"name": "WebMD", "url": "https://www.webmd.com"},
    {"name": "CNN", "url": "https://www.cnn.com"},
    {"name": "ESPN", "url": "https://www.espn.com"},
    {"name": "BBC", "url": "https://www.bbc.com"},
    {"name": "The Guardian", "url": "https://www.theguardian.com"},
    {"name": "Forbes", "url": "https://www.forbes.com"},
    {"name": "BuzzFeed", "url": "https://www.buzzfeed.com"},
    {"name": "HBO", "url": "https://www.hbo.com"},
    {"name": "Disney+", "url": "https://www.disneyplus.com"},
    {"name": "Adobe", "url": "https://www.adobe.com"},
    {"name": "Dropbox", "url": "https://www.dropbox.com"},
    {"name": "GitHub", "url": "https://www.github.com"},
    {"name": "Stack Overflow", "url": "https://stackoverflow.com"},
    {"name": "Apple", "url": "https://www.apple.com"},
    {"name": "Microsoft", "url": "https://www.microsoft.com"},
    { "name": "Spotify", "url": "https://www.spotify.com" },
    {"name": "Netflix","url":"https://www.netflix.com" },
    {"name": "Tiktok","url":"https://www.tiktok.com" },
    { "name": "Snapchat", "url": "https://www.snapchat.com" },
    { "name": "Booking", "url": "https://www.booking.com" },
    { "name": "Uber", "url": "https://www.uber.com" },
    { "name": "Zoom", "url": "https://www.zoom.com" },
    { "name": "Skype", "url": "https://www.skype.com" },
    { "name": "Bolt", "url": "https://www.bolt.com" },
    { "name": "Gmail", "url": "https://www.gmail.com" },
    { "name": "Outlook", "url": "https://www.outlook.com" },
    { "name": "Discord", "url": "https://www.discord.com" },
    {"name": "WhatsApp","url":"https://www.whatsapp.com" },
];

const websiteNames = websites.map(website => website.name);
console.log(websiteNames);
const sortedWebsites = websiteNames.sort();
let input = document.getElementById("title");
function displayWebsites(value) {
    input.value = value;
    removeElements();
    const website = websites.find(site => site.name === value);
    if (website) {
        inputAddress.value = website.url;
        websiteLogo.src = `./logos/${value}`;

    }
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


