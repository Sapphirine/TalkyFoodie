window.AudioContext = window.AudioContext || window.webkitAudioContext;
var mediaStream,
    audioContext = new AudioContext(),
    mediaStreamSource,
    audioMeter;

function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
    var from = 200;
    var to = 5000;
    var geometricMean = Math.sqrt(from * to);
    var filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = geometricMean;
    filter.Q.value = geometricMean / (to - from);

    var processor = audioContext.createScriptProcessor(4096);
    processor.onaudioprocess = volumeAudioProcess;
    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = clipLevel || 0.98;
    processor.averaging = averaging || 0.95;
    processor.clipLag = clipLag || 750;
    filter.connect(processor);
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

    return filter;
}

function volumeAudioProcess(event) {
    var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
    var sum = 0;
    var x;

    for (var i=0; i<bufLength; i++) {
        x = buf[i];
        if (Math.abs(x)>=this.clipLevel) {
            this.clipping = true;
            this.lastClip = window.performance.now();
        }
        sum += x * x;
    }

    var rms =  Math.sqrt(sum / bufLength);
    this.volume = Math.max(rms, this.volume*this.averaging);
}

function process(localMediaStream) {
    mediaStream = localMediaStream;
    mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
    audioMeter = createAudioMeter(audioContext);
    mediaStreamSource.connect(audioMeter);
}

socket.on('error', function (e) {
    console.log(e);
});


// https://github.com/GoogleChrome/webplatform-samples/blob/master/webspeechdemo/webspeechdemo.html

if ('webkitSpeechRecognition' in window) {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = function () {
        recognizing = true;
        console.log('started');
    };
    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            ignore_onend = true;
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
        var interim_transcript = '', old_final_transcript = final_transcript;
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        if (old_final_transcript != final_transcript)
            $('#chat_message').val(final_transcript);
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
        if (recognition) {
            final_transcript = '';
            recognition.lang = 'en-US';
            recognition.start();
            ignore_onend = false;
        }
        $('#mic').switchClass('unmute', 'mute', '10', 'linear');
        $(this).switchClass('green', 'red', 2000, 'swing');
    } else {
        console.log('closed');
        if (recognition) recognition.stop();
        if (localstream) localstream.getTracks()[0].enabled = false;
        console.log(123);
        playing = false;
        $('#mic').switchClass('mute', 'unmute', '10', 'linear');
        $(this).switchClass('red', 'green', 2000, 'swing');
    }
});
