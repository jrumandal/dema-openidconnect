
$('.btnTriggerActionIframe').on('click', () => {
    $('iframe').attr('src', 'API/DEL/000000');
});

$('.btnTriggerActionGet').on('click', () => {
    axios.get('API/DEL/000000');
});
$('.btnTriggerActionPost').on('click', () => {
    axios.post('API/DEL/111111');
});

this._interval = setInterval(() => {
    let authIframe = $('iframe')[0];
    console.log(authIframe.src);
    console.log(authIframe.src);
    console.log(authIframe.contentDocument.body.innerHTML);
    try {
        let result = authIframe.contentDocument.body.innerHTML;
        console.log(result);
        let resultObj = JSON.parse(result);
        console.log(resultObj);

        clearInterval(this._interval);
    } catch (e) { console.error('not parseble'); }
}, 500);
