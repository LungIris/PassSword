const signInBtnLink = document.querySelector('.signInBtn-link');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const wrapper = document.querySelector('.wrapper');

signUpBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');

})
signInBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
})
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.sign-in form');
    const signUpForm = document.querySelector('.sign-up form');

    loginForm.addEventListener('submit', function(event) {
        const email = document.querySelector('.sign-in [type="email"]').value;
        const password = document.querySelector('.sign-in [type="password"]').value;
        if (!validateEmail(email) || !validatePassword(password)) {
            event.preventDefault(); // Stop form submission
            alert("Invalid email or password.");
        }
    });

    signUpForm.addEventListener('submit', function(event) {
        const email = document.querySelector('.sign-up [type="email"]').value;
        const password = document.querySelector('.sign-up [type="password"]').value;
        if (!validateEmail(email) || !validatePassword(password)) {
            event.preventDefault(); // Stop form submission
            alert("Invalid email or password.");
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
