$(window).on('ready', function () {
    $('.btnTriggerActionGet').on('click', () => {
        axios.get('/DEL/111111');
    });
    $('.btnTriggerActionPost').on('click', () => {
        axios.post('/DEL/111111');
    });
})