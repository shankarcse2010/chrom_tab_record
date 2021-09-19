
let recorededtracks = [];
let currenrtStream;
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.type) {
    case "watch_tab":
      watchTab();
      break;
    case "stop_tab":
      stopMediaStream(currenrtStream);
      break;
    case "download_tab":
      downloadTab();
      break;

    default:
      break;
  }
});

const watchTab = () => {
  beginRecord(recoreded => {
    recorededtracks = recoreded
  })
}
const downloadTab = async () => {
 await stopMediaStream(currenrtStream);
 setTimeout(() => {
  download(recorededtracks, Date.now());
 }, 100);
 
}
const detectMimeType = () => {
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  for (let mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return '';
};

const initMediaStream = async () => {
  const constraints = {
    video: {
      cursor: "never"
    },
    audio: false
  };
  const stream = await navigator.mediaDevices.getDisplayMedia(
    constraints,
  );
  return stream;
};

const stopMediaStream = async (stream) => {
  stream.getTracks().forEach((track) => track.stop());
};

const combineBlobs = (recordedBlobs) => {
  return new Blob(recordedBlobs, { type: 'video/webm' });
};

const createBlobURL = (blob) => {
  const url = window.URL.createObjectURL(blob);
  return url;
};

const beginRecord = async (onFinished) => {
  const stream = await initMediaStream();
  currenrtStream = stream
  // onStreamReady(stream);
  const options = { mimeType: detectMimeType() };
  const recordedBlobs = [];

  const mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  };
  mediaRecorder.onstop = () => {
    onFinished(recordedBlobs);
    stopMediaStream(stream);
  };

  mediaRecorder.start();

  return mediaRecorder;
};

const stopPlaying = (videoElement) => {
  videoElement.pause();
  videoElement.src = null;
  videoElement.srcObject = null;
};

const playRecordedBlobs = (videoElement, recordedBlobs) => {
  const blob = combineBlobs(recordedBlobs);
  const url = createBlobURL(blob);

  stopPlaying(videoElement);

  videoElement.controls = true;
  videoElement.src = url;
  videoElement.play();
};

const playStream = (videoElement, stream) => {
  stopPlaying(videoElement);

  videoElement.srcObject = stream;
  videoElement.play();
};
const download = (
  recordedBlobs,
  fileName = 'RecordedVideo.webm',
) => {
  const blob = combineBlobs(recordedBlobs);
  return saveAs(blob, fileName);
};