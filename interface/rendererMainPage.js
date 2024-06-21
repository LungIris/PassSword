const signInBtnLink = document.querySelector('.signInBtn-link');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const wrapper = document.querySelector('.wrapper');
const { ipcRenderer } = require('electron');

signUpBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');

})
signInBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
})
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.sign-in form');
    const signUpForm = document.querySelector('.sign-up form');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('usernameLogin').value;
        const password = document.querySelector('.sign-in [type="password"]').value;
        ipcRenderer.send('login-request', { username, password });
        
    });

    signUpForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.querySelector('.sign-up [type="email"]').value;
        const password = document.querySelector('.sign-up [type="password"]').value;
        if (!validateEmail(email) || !validatePassword(password)) {
            event.preventDefault();
            document.getElementById('fail-message').innerText = "Invalid email or password.";
            showPopup('fail-popup');
            setTimeout(function () {
                hidePopup('fail-popup');
            }, 2000);
        } else {
            ipcRenderer.send('check-username-email', { username, email, password });
        }
    });  
ipcRenderer.once('check-username-email-response', (event, exists,username,email,password) => {
    if (exists) {
        document.getElementById('fail-message').innerText = "Username or email already exist";
        showPopup('fail-popup');
        setTimeout(function() {
            hidePopup('fail-popup');
        }, 2000);
        const signupForm = document.querySelector('.sign-up form');
        signupForm.reset();
    } else {
        ipcRenderer.send('signup-request', { username, email, password });
        ipcRenderer.once('signup-response', (event, response) => {
            
                location.reload();
                sessionStorage.setItem('username', response.username)
                const today = new Date();
                const month = today.getMonth();
                const year = today.getFullYear();
                const key = `${year}-${month}`
                const username = response.username;
                let logins = JSON.parse(localStorage.getItem('monthlyLogins')) || {}; 
                logins[username][key] = 0; 
                localStorage.setItem('monthlyLogins', JSON.stringify(logins));

        });
    }
});
});
    
    function showPopup(popupId) {
        document.getElementById(popupId).style.display = "block";
    }
  function hidePopup(popupId) {
    document.getElementById(popupId).style.display = "none";

}
ipcRenderer.on('login-response', (event, response) => {
    if (response.success) {
        sessionStorage.setItem('username', response.username)
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        const key = `${year}-${month}`
        const username = response.username;
        let logins = JSON.parse(localStorage.getItem('monthlyLogins')) || {}; 
        if (!logins[username]) {
            logins[username] = {};
        }
        if (logins[username][key]) {
            logins[username][key]++;
        } else {
            logins[username][key] = 1; 
        }
        localStorage.setItem('monthlyLogins', JSON.stringify(logins));
        window.location.href = 'dashboard.html';

    } else {
        const loginForm = document.querySelector('.sign-in form');
        document.getElementById('fail-message').innerText = "Invalid credentials.";
        showPopup('fail-popup');
        setTimeout(function() {
            hidePopup('fail-popup');
        }, 2000);
        
        loginForm.reset();


    }

    
});

    

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
}
function validatePassword(password) {
    const minLength = 16;
    const hasNumbers = /\d/;
    const hasUpper = /[A-Z]/;
    const hasLower = /[a-z]/;
    const hasSpecial = /[!@#\$%\^\&*\)\(+=._-]/;

    if (password.length < minLength ||!hasNumbers.test(password) || !hasUpper.test(password) || !hasLower.test(password) || !hasSpecial.test(password)) {
        document.getElementById('fail-message').innerText = "Password does not meet requirements.";
        showPopup('fail-popup');
        setTimeout(function() {
            hidePopup('fail-popup');
        }, 3000);
        const signupForm = document.querySelector('.sign-up form');
        signupForm.reset();
        return false;
    }

    return true;
}
