var spam_event;
var spamming = false;

function spam() {
    if (!spamming) {
        spam_event = setInterval(function () {
            console.log(123);
            socket.send('spam');
        }, 500);
        $('#spam').text('STOP');
        $('#spam').switchClass('btn-danger', 'btn-primary', 500, 'linear');
        spamming = true;
    } else {
        $('#spam').text('SPAM');
        $('#spam').switchClass('btn-primary', 'btn-danger', 500, 'linear');
        clearInterval(spam_event);
        spamming = false;
    }
}