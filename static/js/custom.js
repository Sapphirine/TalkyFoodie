var namespace = '/test';
var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
var host = false;
var peer_api = 'unl8wqyitfv18aor', peer;
var username = $('#username').data('username');

socket.on('connect', function () {
    peer = new Peer({key: peer_api});
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
    connectPeers(msg.peers);
    hideActionButton();
});

socket.on('chat message receive', function (msg) {
    appendChat(msg.data);
});

peer.on('open', function(id) {
    socket.emit('new peer', {username: username, peer : id});
});

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
function connectPeers(peers) {
    console.log(1);
}
$('.button').popup({
    on: 'hover',
    closable: false
});
