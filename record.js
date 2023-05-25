require('dotenv').config();
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
var player = require('play-sound')(opts = {})

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env['API_KEY'],
});
const openai = new OpenAIApi(configuration);

const fs = require('fs');
const recorder = require('node-record-lpcm16');
const VAD = require('node-vad');
const vad = new VAD(VAD.Mode.NORMAL);


var vadHistory = [];
var isDurationableVoice = false;
var recording;

function startRecording() {
    var file = fs.createWriteStream('currentSpeech.wav', { encoding: 'binary' });

    recording = recorder.record({
        device: 'hw:1,0'
    });

    // Pipe the recording stream to the file
    recording.stream().pipe(file);

    recording.stream().on("data", chunk => {
        vad.processAudio(chunk, 16000).then(res => {
            switch (res) {
                case VAD.Event.ERROR:
                    console.log("ERROR");
                    break;
                case VAD.Event.NOISE:
                    console.log("NOISE");
                    break;
                case VAD.Event.SILENCE:
                    console.log("SILENCE");
                    vadHistory.push("SILENCE");
                    checkVadForDurationableSilence();
                    break;
                case VAD.Event.VOICE:
                    console.log("VOICE");
                    vadHistory.push("VOICE");
                    checkVadForDurationableVoice();
                    break;
            }
        }).catch(console.error);
    });

    // When the recording finishes
    recording.stream().on('end', function() {
        console.log('Recording stopped');
        handleAudioFile();
    });
}

function checkVadForDurationableSilence() {
    if (vadHistory.length > 16 && isDurationableVoice) {
        // check if at least 9 of the LAST 10 entries are silence
        var silenceCount = 0;
        for (var i = 0; i < 8; i++) {
            if (vadHistory[vadHistory.length - i - 1] == "SILENCE") {
                silenceCount++;
            }
        }
        if(silenceCount >= 7) {
            console.log("Durationable silence detected");
            recording.stop();
        }
    }
}

function checkVadForDurationableVoice() {
    if (vadHistory.length > 16 && !isDurationableVoice) {
        // check if at least 8 of the LAST 10 entries are voice
        var voiceCount = 0;
        for (var i = 0; i < 8; i++) {
            if (vadHistory[vadHistory.length - i - 1] == "VOICE") {
                voiceCount++;
            }
        }
        if(voiceCount >= 7) {
            console.log("Durationable voice detected");
            isDurationableVoice = true;
        }
    }
}

async function handleAudioFile() {
    // read the audio file and convert it to base64
    var base64data = fs.readFileSync('currentSpeech.wav', 'base64');

    console.log("Audio was received");
    var transcription = await detectSpeech(base64data);
    console.log(transcription);
    var answer = await getGPTAnswer(transcription);
    console.log(answer);
    var audioContent = await textToSpeechM(answer);
    console.log("Audio was generated");
    fs.writeFileSync('answer.wav', audioContent, 'binary');
    console.log("Audio was written to file");
    playAnswer();
}

async function detectSpeech(audioBytes){
    const speechClient = new speech.SpeechClient();
  
    const audio = {
      content: audioBytes,
    };
  
    const config = {
      languageCode: 'ru-RU',
    };
  
    const request = {
      audio: audio,
      config: config,
    };
  
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    return transcription;
}

async function textToSpeechM(transcription){
    const textToSpeechClient = new textToSpeech.TextToSpeechClient();
    const textToSpeechRequest = {
        input: { text: transcription },
        voice: { name: 'ru-RU-Wavenet-A', languageCode: 'ru-RU' },
        audioConfig: { audioEncoding: 'LINEAR16' },
    };

    const [textToSpeechResponse] = await textToSpeechClient.synthesizeSpeech(textToSpeechRequest);
    const audioContent = textToSpeechResponse.audioContent;
    return audioContent;
}

async function getGPTAnswer(question){
    const GPT35TurboMessage = [
        { role: "user", content: question }
    ];
    //gpt-4
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: GPT35TurboMessage
    });
    return response.data.choices[0].message.content
}

function playAnswer(){
    player.play('answer.wav', function(err){
        if(err)
            throw err
        console.log("Audio finished playing");
        vadHistory = [];
        isDurationableVoice = false;
        recording = null;
        startRecording();
    })
}

startRecording();