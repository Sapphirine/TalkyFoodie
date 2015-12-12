var username = $('#username').data('username');
var playing = false;
var localstream, localrecorder, localbuffer;
var bufferSize = 4096, bufferNum = 1, count = 0;
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioBuffer = audioCtx.createBuffer(1, bufferNum * bufferSize, audioCtx.sampleRate);
//var toSend = new Float32Array(bufferNum * bufferSize);
var toSend = "";
function initializeRecorder(stream) {
    localstream = stream;
    var from = 300;
    var to = 3000;
    var geometricMean = Math.sqrt(from * to);
    var filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = geometricMean;
    filter.Q.value = geometricMean / (to - from);
    var source = audioCtx.createMediaStreamSource(stream);
    var recorder = audioCtx.createScriptProcessor(bufferSize, 1, 1);
    recorder.onaudioprocess = recorderProcess;
    localrecorder = recorder;
    source.connect(filter);
    filter.connect(recorder);
    recorder.connect(audioCtx.destination);
}

function recorderProcess(e) {
    //toSend.set(e.inputBuffer.getChannelData(0), count++ * bufferSize);
    toSend = e.inputBuffer.getChannelData(0);
    //if (++count < bufferNum) return;
    //console.log('send', left);
    localbuffer = e.inputBuffer;
    /* Self-testing
     var source = audioCtx.createBufferSource();
     source.buffer = e.inputBuffer;
     source.connect(audioCtx.destination);
     source.start(0);
     */
    var room_number = $("#room_number").val();
    socket.emit('voice chat', {data: toSend, room: room_number, username: username});
    //toSend = new Float32Array(bufferNum * bufferSize);
    //toSend = "";
    //count = 0;
}


socket.on('voice message receive', function (msg) {
    //if (msg.username == username) return;
    var source = audioCtx.createBufferSource();
    console.log(msg);
    audioBuffer.getChannelData(0).set(Object.keys(msg.data).map(key => msg.data[key])
    )
    ;
    source.buffer = audioBuffer;
    console.log('got', msg);
    source.connect(audioCtx.destination);
    source.start(0);
});
socket.on('error', function (e) {
    console.log(e);
});

$('#play').click(function () {
    if (!playing) {
        if (navigator.mozGetUserMedia) {
            navigator.mozGetUserMedia({audio: true, video: false}, initializeRecorder, function (e) {
                console.log(e);
            });
        } else if (navigator.webkitGetUserMedia) {
            navigator.webkitGetUserMedia({audio: true, video: false}, initializeRecorder, function (e) {
                console.log(e);
            });
        }
        playing = true;
        $('#mic').switchClass('unmute', 'mute', '10', 'linear');
        $(this).switchClass('green', 'red', 2000, 'swing');
    } else {
        playing = false;
        localrecorder.onaudioprocess = function () {
        };
        $('#mic').switchClass('mute', 'unmute', '10', 'linear');
        $(this).switchClass('red', 'green', 2000, 'swing');
    }
});