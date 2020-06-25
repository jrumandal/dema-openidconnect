
$('.btnTriggerActionIframe').on('click', () => {
    $('iframe').attr('src', 'API/DEL/000000');
});

$('.btnTriggerActionGet').on('click', () => {
    axios.get('API/DEL/000000');
});
$('.btnTriggerActionPost').on('click', () => {
    axios.post('API/DEL/111111');
});

console.info("Define `debugFunction` in `this` or `window` to be able to make any middle action/debugging/logging.")
this._interval = setInterval(() => {
    let authIframe = $('iframe')[0];

    if (globalThis.debugFunction) globalThis.debugFunction();

    try {
        let result = authIframe.contentWindow.document.body.innerHTML;
        console.log(result);
        let resultObj = JSON.parse(result);
        console.log(resultObj);

        clearInterval(this._interval);
    } catch (e) { console.error('not parseble'); }
}, 500);
