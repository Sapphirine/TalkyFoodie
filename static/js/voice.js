var playing = false;
var localstream, localrecorder;
var bufferSize = 4096, bufferNum = 1;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var audioBuffer = audioCtx.createBuffer(1, bufferNum * bufferSize, audioCtx.sampleRate);

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
    recorder.onaudioprocess = 123;
    localrecorder = recorder;
    source.connect(filter);
    filter.connect(recorder);
    recorder.connect(audioCtx.destination);
}

socket.on('voice message receive', function (msg) {
    //if (msg.username == username) return;
    var source = audioCtx.createBufferSource();
    console.log(msg);
    audioBuffer.getChannelData(0).set(Object.keys(msg.data).map(key => msg.data[key])
    )
    ;
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
});

socket.on('error', function (e) {
    console.log(e);
});

peer.on('call', function(call) {
  getUserMedia({video: true, audio: true}, function(stream) {
    call.answer(stream); // Answer the call with an A/V stream.
    call.on('stream', function(remoteStream) {
        console.log('sent talk');
    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
});

$('#play').click(function () {
    if (!playing) {
        playing = true;
        $('#mic').switchClass('unmute', 'mute', '10', 'linear');
        $(this).switchClass('green', 'red', 2000, 'swing');
        getUserMedia({video: true, audio: true}, function (stream) {
            var call = peer.call('another-peers-id', stream);
            call.on('stream', function (remoteStream) {
                console.log('got talk');
            });
        }, function (err) {
            console.log('Failed to get local stream', err);
        });
    } else {
        playing = false;
        localrecorder.onaudioprocess = function () {
        };
        $('#mic').switchClass('mute', 'unmute', '10', 'linear');
        $(this).switchClass('red', 'green', 2000, 'swing');
    }
});