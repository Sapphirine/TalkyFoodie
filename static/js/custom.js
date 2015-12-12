var namespace = '/test';
var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
var host = false;

socket.on('connect', function () {
});
socket.on('commit join', function (msg) {
    if (phoneNumber == msg.username) {
        document.getElementById("room_number").value = msg.room;
        console.log($('#username').data('username'));
        socket.emit('request join', {data: msg.room});
    }
});
socket.on('host confirm', function (msg) {
    var roomNumber = document.getElementById("room_number");
    host = true;
    roomNumber.value = msg.data;
    roomNumber.readOnly = true;
    var roomNumberText = document.getElementById("newGeneratedNumber");
    roomNumberText.innerHTML = roomNumberText.innerHTML + msg.data;
    document.getElementById("roomNumberLabel").innerHTML = "Room Number: " + msg.data;
    hideActionButton();
});
socket.on('join confirm', function (msg) {
    roomNumber = document.getElementById("room_number");
    roomNumber.readOnly = true;
    document.getElementById("roomNumberLabel").innerHTML = "Room Number: " + msg.data;
    hideActionButton();
});
socket.on('chat message receive', function (msg) {
    appendChat(msg.data);
});
function inviteFriend() {
    $('.close').click();
}
function requestHost() {
    socket.emit('request host', {data: 'whatever'});
    $('.close').click();
}
function requestJoin() {
    number = $("#room_number").val();
    socket.emit('request join', {data: number, username: $('#username').data('username')});
    $('#joinModal').modal('hide');
    $('.close').click();
}
function hideActionButton() {
    $('#play').removeClass('disabled');
    $('#outsideHostButton').hide();
    $('#outsideJoinButton').hide();
    $('#roomInfo').show();
}
function pressToSend(event) {
    if (event.keyCode == 13) {
        sendMessage();
    }
}
$('.button').popup({
    on: 'hover',
    closable: false
});
