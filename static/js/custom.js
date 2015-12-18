var namespace = '/test';
var peer_api = 'unl8wqyitfv18aor', peer_id;
var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
//var peer = new Peer({host: 'localhost', port: 9000, path: '/'});
var peer = new Peer({key: peer_api}), peers = [], localcall;
var curr_room = '';
var username = $('#username').data('username'), userid = $('#username').data('userid');
var localstream, remotestream;
var playing = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

peer.on('error', function (error) {
    console.log(error);
});

peer.on('open', function (id) {
    peer_id = id;
});

peer.on('call', function (call) {
    console.log('got called');
    if (!playing) {
        call.answer();
    } else {
        navigator.getUserMedia({video: false, audio: true}, function (stream) {
            localstream = stream;
            process(localstream);
            call.answer(localstream);
        }, function (err) {
            console.log('Failed to get local stream', err);
        });
    }
    call.on('stream', onReceiveStream);
});

socket.on('connect', function () {
});


socket.on('join confirm', function (msg) {
    peers = msg.peers;
    var roomNumber = $("#room_number");
    roomNumber.val(msg.room);
    $("#roomNumberLabel").html("Room Topic: " + msg.room);
    curr_room = msg.room;
    localstream = null;
    //console.log('received peers from server:', peers);
    $('#keyword').val(curr_room);
    $('#chatresponse').empty();
    search();
    hideActionButton();
});

socket.on('chat message receive', function (msg) {
    appendChat(msg.data);
});

socket.on('recommendation receive', function (msg) {
    recommend(msg);
});

function requestRandom() {
    socket.emit('request random', {username: $('#username').data('username'), peer: peer_id});
    $('.close').click();
}
function requestJoin() {
    var room = $("#room_number").val();
    if (!room) return;
    if (playing) {
        if (recognition) recognition.stop();
        if (localstream) localstream.getTracks()[0].enabled = false;
        $('#mic').switchClass('mute', 'unmute', '10', 'linear');
        $('#play').switchClass('red', 'green', 2000, 'swing');
        localcall.close();
        playing = false;
    }
    socket.emit('request join', {from: curr_room, to: room, username: $('#username').data('username'), peer: peer_id});
    $('.close').click();
}
function hideActionButton() {
    $('#play').removeClass('disabled');
    $('#randomButton').hide();
    $('#joinButton').hide();
    $('#roomInfo').show();
    $('#changeRoom').show();
}
function pressToSend(event) {
    if (event.keyCode == 13) {
        sendMessage();
    }
}
function connectPeers() {
    console.log('try to connect to ', peers);
    for (var i = 0; i < peers.length; ++i) {
        var other = peers[i];
        if (other != peer_id) {
            !function (other) {
                navigator.getUserMedia({video: false, audio: true}, function (stream) {
                    console.log('called', other);
                    localstream = stream;
                    process(localstream);
                    localcall = peer.call(other, stream);
                    localcall.on('stream', onReceiveStream);
                }, function (err) {
                    console.log('Failed to get local stream', err);
                });
            }(other);
        }
    }

}

function onReceiveStream(stream) {
    remotestream = stream;
    var audio = document.querySelector('audio');
    audio.src = window.URL.createObjectURL(stream);
    audio.onloadedmetadata = function (e) {
        console.log('now playing the audio');
        audio.play();
    }
}

function sendMessage() {
    if ($('#chat_message').value == "") {
        return;
    }
    if (!$('#room_number').val()) {
        alert('Please host or join a room first!');
        return
    }
    var text = $('#chat_message').val();
    var room_number = $("#room_number").val();
    socket.emit('chat broadcast', {text: text, food: room_number, user: userid, username: username});
    final_transcript = '';
    $('#chat_message').val("");
}
function appendChat(msg) {
    var chatWindow = $('#chatresponse');
    var avatar = '<img src="http://api.adorable.io/avatars/60/' + msg.substring(0, msg.indexOf(':')) + '%40adorable.io">';
    var messageLine = '<div class="comment"><a class="avatar">'
        + avatar
        + '</a><div class="content"><a class="author">'
        + msg.substring(0, msg.indexOf(':'))
        + '</a><div class="metadata"><span class="date">'
        + new Date().toLocaleTimeString()
        + '</span></div><div class="text">'
        + msg.substring(msg.indexOf(':') + 1)
        + '</div></div></div>';
    chatWindow.append(messageLine);
    document.getElementById('scrollable').scrollTop = document.getElementById('scrollable').scrollHeight;
}

$('.button').popup({
    on: 'hover',
    closable: false
});

$(document).on("click", ".recommend", function () {
    $('#room_number').val($(this).text());
});
