var spam_event;
var spamming = false;
var google_map_key = 'AIzaSyADLJGozwf27bx-BrTJf-BDAFUf827D5Mk';

function qing() {
    var spam = $('#spam');
    if (!spamming) {
        spam_event = setInterval(function () {
            console.log(123);
            socket.send('spam');
        }, 500);
        spam.text('STOP');
        spam.switchClass('btn-danger', 'btn-primary', 500, 'linear');
        spamming = true;
    } else {
        spam.text('SPAM');
        spam.switchClass('btn-primary', 'btn-danger', 500, 'linear');
        clearInterval(spam_event);
        spamming = false;
    }
}


function mei() {
    var msg = ['sushi', 'icecream', 'pasta', 'ramen', 'steak'];
    recommend(shuffle(msg));
    var map;
    var infowindow;

    

function recommend(msg) {
    console.log(msg);
}

function shuffle(array) {
    var counter = array.length, temp, index;

    while (counter > 0) {
        index = Math.floor(Math.random() * counter);
        counter--;
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}
