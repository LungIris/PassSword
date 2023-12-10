const signInBtnLink = document.querySelector('.signInBtn-link');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const wrapper = document.querySelector('.wrapper');

signUpBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
})
signInBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
})
/*
forgotPasswordBtnLink.addEventListener('click', ()=> { 
    toggle();
})
function toggle() {
    var blur = document.getElementById('blur');
    blur.classList.toggle('active');
}*/