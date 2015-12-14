var namespace = '/test';
var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
var host = false;
var peer_api = 'unl8wqyitfv18aor', peer;
var username = $('#username').data('username');

socket.on('connect', function () {
    peer = new Peer({key: peer_api})

    peer.on('open', function (id) {
        socket.emit('new peer', {username: username, peer: id});
    });

    peer.on('call', function (call) {
        getUserMedia({video: true, audio: true}, function (stream) {
            call.answer(stream); // Answer the call with an A/V stream.
            call.on('stream', function (remoteStream) {
                console.log('sent talk');
            });
        }, function (err) {
            console.log('Failed to get local stream', err);
        });
    });
});

socket.on('host confirm', function (msg) {
    var roomNumber = $("#room_number");
    host = true;
    roomNumber.val(msg.data);
    $("#room_number").prop("readonly", true);
    var roomNumberText = $("#newGeneratedNumber");
    roomNumberText.html(roomNumberText.html() + msg.data);
    $("#roomNumberLabel").html("Room Number: " + msg.data);
    hideActionButton();
});

socket.on('join confirm', function (msg) {
    $("#room_number").prop("readonly", true);
    $("#roomNumberLabel").html("Room Number: " + msg.data);
    connectPeers(msg.peers);
    hideActionButton();
});

socket.on('chat message receive', function (msg) {
    appendChat(msg.data);
});

socket.on('recommendation receive', function (msg) {
    //recommend(msg);
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
