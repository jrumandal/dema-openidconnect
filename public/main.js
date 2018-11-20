$(window).on('ready', function () {
    $('.btnTriggerActionGet').on('click', () => {
        axios.get('/DEL/000000');
    });
    $('.btnTriggerActionPost').on('click', () => {
        axios.post('/DEL/111111');
    });
})