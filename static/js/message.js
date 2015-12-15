var spam_event;
var spamming = false;

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
        spam.text('QING');
        spam.switchClass('btn-primary', 'btn-danger', 500, 'linear');
        clearInterval(spam_event);
        spamming = false;
    }
}


function mei() {
    var msg = {};
    msg[username] = ['sushi', 'icecream', 'pasta', 'ramen', 'pizza', 'chowmen', 'coffee'];
    shuffle(msg[username]);
    recommend(msg);
}

function recommend(msg) {
    $('#foodrecommend').slideUp("slow", function () {
        var foods = msg[username];
        var count = 1;
        for (var index = 0; count <= 5 && index < foods.length; index++) {
            if (foods[index] == curr_room) continue;
            $('#foodButton' + count).text(foods[index]);
            $('#foodButton' + count).show();
            count++;
        }
    });
    $('#foodrecommend').slideDown(2000);
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
