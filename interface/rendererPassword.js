const { ipcRenderer } = require("electron");

const addPasswordForm = document.getElementById('addPasswordForm');

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