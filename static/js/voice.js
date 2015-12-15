var bufferSize = 4096;
window.AudioContext = window.AudioContext || window.webkitAudioContext;

function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
    var processor = audioContext.createScriptProcessor(512);
    processor.onaudioprocess = volumeAudioProcess;
    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = clipLevel || 0.98;
    processor.averaging = averaging || 0.95;
    processor.clipLag = clipLag || 750;

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(audioContext.destination);

    processor.checkClipping =
        function () {
            if (!this.clipping)
                return false;
            if ((this.lastClip + this.clipLag) < window.performance.now())
                this.clipping = false;
            return this.clipping;
        };

    processor.shutdown =
        function () {
            this.disconnect();
            this.onaudioprocess = null;
        };

    return processor;
}


socket.on('error', function (e) {
    console.log(e);
});


// https://github.com/GoogleChrome/webplatform-samples/blob/master/webspeechdemo/webspeechdemo.html

if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = function () {
        recognizing = true;
        console.log('started');
    };
    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
        }
        if (event.error == 'audio-capture') {
        }
        if (event.error == 'not-allowed') {
            ignore_onend = true;
        }
    };
    recognition.onend = function () {
        recognizing = false;
        console.log('recognition ended');
    };
    recognition.onresult = function (event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        if (final_transcript) $('#chat_message').val(final_transcript);
    };
}

$('#play').click(function () {
    if (!playing) {
        playing = true;
        console.log('opened');
        if (!localstream) {
            connectPeers();
        } else {
            localstream.getTracks()[0].enabled = true;
        }
        final_transcript = '';
        recognition.lang = 'en-US';
        recognition.start();
        ignore_onend = false;
        $('#mic').switchClass('unmute', 'mute', '10', 'linear');
        $(this).switchClass('green', 'red', 2000, 'swing');
    } else {
        console.log('closed');
        recognition.stop();
        if (localstream) localstream.getTracks()[0].enabled = false;
        console.log(123);
        playing = false;
        $('#mic').switchClass('mute', 'unmute', '10', 'linear');
        $(this).switchClass('red', 'green', 2000, 'swing');
    }
});
