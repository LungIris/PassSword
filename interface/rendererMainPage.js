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
            alert("Invalid email or password.");
        }
        ipcRenderer.send('check-username-email', { username, email });
ipcRenderer.send('check-username-email', { username, email });
    
ipcRenderer.once('check-username-email-response', (event, exists) => {
    if (exists) {
        alert("Username or Email already exists.");
    } else {
        ipcRenderer.send('signup-request', { username, email, password });
        ipcRenderer.once('signup-response', (event, response) => {
            
                location.reload();
            
        });
    }
});
    });
ipcRenderer.on('login-response', (event, response) => {
    if (response.success) {
        sessionStorage.setItem('sessionKey', response.sessionKey);  
        sessionStorage.setItem('username', response.username)
        window.location.href = 'dashboard.html';

    } else {
        console.log(response.message); 
        alert("Login failed: " + response.message);
        location.reload();

    }
});

    
});
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
}
function validatePassword(password) {
    const minLength = 15;
    const hasNumbers = /\d/;
    const hasUpper = /[A-Z]/;
    const hasLower = /[a-z]/;
    const hasSpecial = /[!@#\$%\^\&*\)\(+=._-]/;

    if (password.length < minLength) {
        alert("Password must be at least 15 characters long.");
        return false;
    }
    if (!hasNumbers.test(password)) {
        alert("Password must include at least one number.");
        return false;
    }
    if (!hasUpper.test(password)) {
        alert("Password must include at least one uppercase letter.");
        return false;
    }
    if (!hasLower.test(password)) {
        alert("Password must include at least one lowercase letter.");
        return false;
    }
    if (!hasSpecial.test(password)) {
        alert("Password must include at least one special character.");
        return false;
    }
    return true;
}
