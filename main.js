"use strict";
const startCapturingButton = document.querySelector("#start-capturing");
const stopCapturingButton = document.querySelector("#stop-capturing");
const videoContainer = document.querySelector("div#capture-stream");
const canvasContainer = document.querySelector("div#screenshot");
let captureStream = null;
let intervalId = null;
let holdData = null;
let holdCanvas = null;
let saveCount = 0;
let filename = null;
let diffPercentage = null;
let interval = null;

startCapturingButton.addEventListener('click', async () => {
    captureStream = await navigator.mediaDevices.getDisplayMedia({ audio: false, video: true });
    videoContainer.innerHTML = '';
    if (captureStream) {
        const video = document.createElement("video");
        video.autoplay = true;
        video.srcObject = captureStream;
        videoContainer.appendChild(video);
        stopCapturingButton.removeAttribute("disabled");

        const textboxFilename = document.getElementById("filename");
        filename = textboxFilename.value;
        const textboxDiffPercentage = document.getElementById("diff-percentage");
        diffPercentage = textboxDiffPercentage.value / 100;
        const textboxInterval = document.getElementById("interval");
        interval = textboxInterval.value * 1000;
        intervalId = setInterval(function(){getBansho()}, interval);
    }

});

stopCapturingButton.addEventListener('click', () => {
    clearInterval(intervalId);
    captureStream = null;
    holdData = null;
    holdCanvas = null;
    saveCount = null;
});

async function getBansho(){
    console.log("getBansho");
    const videoTrack = captureStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);
    const imageBitmap = await imageCapture.grabFrame();

    canvasContainer.innerHTML = '';
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    canvas.getContext('2d').drawImage(imageBitmap, 0, 0);

    var context = canvas.getContext('2d');
    var imageData = context.getImageData(0,0,canvas.width, canvas.height);
    var data = imageData.data;

    if(holdData == null){
        canvasContainer.appendChild(canvas);
        holdData = data;
        holdCanvas = canvas;
    }else{
        let holdDiff = 0;
        var imageLength = data.length;

        for(var y = 0; y < canvas.height; y++){
            for(var x = 0; x < canvas.width; x++){
                var index = (y * canvas.width + x) * 4;
                if(data[index] != holdData[index]){
                    holdDiff += 1
                }
            }
        }
        
        if(holdDiff / imageLength > diffPercentage){
            canvasContainer.appendChild(canvas);
            holdData = data;
            holdCanvas = canvas;
            saveCount += 1;
            var a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg', 0.85);
            a.download = `${filename}-${saveCount}.jpg`;
            a.click();
            console.log("change!");
        }else{
            canvasContainer.appendChild(holdCanvas);
        }
    }
}