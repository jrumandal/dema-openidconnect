
$('.btnTriggerActionIframe').on('click', () => {
    $('iframe').attr('src', 'API/DEL/000000');
});

$('.btnTriggerActionGet').on('click', () => {
    axios.get('API/DEL/000000');
});
$('.btnTriggerActionPost').on('click', () => {
    axios.post('API/DEL/111111');
});

