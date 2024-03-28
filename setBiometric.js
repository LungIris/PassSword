let body = document.querySelector('body');
let fingerprint = document.querySelector('.fingerprint');
let popupBiometric = document.querySelector('.popupBiometric');
let scan = document.querySelector('.scan');
let timer, timerSuccesss;


function onSuccess() {
    body.removeEventListener('mousedown', onTouchstart);
    body.removeEventListener('touchstart', onTouchstart);


    fingerprint.classList.remove('active');
    popupBiometric.classList.add('success')

    clearTimeout(timerSuccesss);

    timerSuccesss = setTimeout(() => {
        body.addEventListener('mousedown', onTouchstart);
        body.addEventListener('touchstart', onTouchstart);
        popupBiometric.classList.remove('success')

    },3000);
}

function onTouchstart () {
    fingerprint.classList.add('active');
    timer = setTimeout(onSuccess,2000)
}

function onTouchEnd() {
    fingerprint.classList.remove('active')
    clearTimeout(timer)
}

popupBiometric.addEventListener('mousedown', onTouchstart)
popupBiometric.addEventListener('touchstart', onTouchstart)
popupBiometric.addEventListener('mouseup', onTouchEnd)
popupBiometric.addEventListener('touchend', onTouchEnd)