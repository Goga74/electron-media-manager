'use strict';

const electron = require('electron');
const remote = electron.remote;
const dialog = remote.dialog;
const fs = require('fs');
const shell = electron.shell;

let width = 320; // We will scale the photo width to this
let height = 0;  // This will be computed based on the input stream
let streaming = false;
let data = null; // Photo img src
const extension = 'png'; // Extensions of image file

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  let audioInputSelect = document.querySelector('select#audioSource');
  let audioOutputSelect = document.querySelector('select#audioOutput');
  let videoSelect = document.querySelector('select#videoSource');
  const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

  const values = selectors.map(function(select) {
    return select.value;
  });
  selectors.forEach(function(select) {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (var i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    let option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label || 'microphone ' + (audioInputSelect.length + 1);
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'audiooutput') {
      option.text = deviceInfo.label || 'speaker ' + (audioOutputSelect.length + 1);
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach(function(select, selectorIndex) {
    if (Array.prototype.slice.call(select.childNodes).some(function(n) {
      return n.value === values[selectorIndex];
    })) {
      select.value = values[selectorIndex];
    }
  });
}

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId).then(function() {
      console.log('Success, audio output device attached: ' + sinkId);
    }).catch(function(error) {
      let errorMessage = error;
      if (error.name === 'SecurityError') {
        errorMessage = 'You need to use HTTPS for selecting audio output ' + 'device: ' + error;
      }
      console.error(errorMessage);
      // Jump back to first output device in the list as it's the default.
      audioOutputSelect.selectedIndex = 0;
    });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

function changeAudioDestination() {
  let audioOutputSelect = document.querySelector('select#audioOutput');
  let videoElement = document.querySelector('video');
  let audioDestination = audioOutputSelect.value;
  attachSinkId(videoElement, audioDestination);
}

function gotStream(stream) {
  let videoElement = document.querySelector('video');
  window.stream = stream; // make stream available to console
  setAudioState();

  if (URL) {
    videoElement.src = URL.createObjectURL(stream);
  } else {
    videoElement.srcObject = stream;
  }  
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function setAudioState() {
  const audioMute = document.querySelector('input#audioMute');
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      if(track.kind === 'audio') {
        console.log('setAudioState:' + !audioMute.checked);
        track.enabled = !audioMute.checked;
      }
    });
  }
}

function start(e) {
  const audioInputSelect = document.querySelector('select#audioSource');
  const videoSelect = document.querySelector('select#videoSource');  
  const audioMute = document.querySelector('input#audioMute');
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {   
      if(track.kind === 'audio') {
        console.log('setAudioState:' + !audioMute.checked);
        track.enabled = !audioMute.checked;
      }
      console.log(e.currentTarget.id + ' = ' + track.kind);
      if (''.concat(e.currentTarget.id).startsWith(track.kind)) {
        track.stop();
      }
    });
  }
  const audioSource = audioInputSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints).
      then(gotStream).then(gotDevices).catch(handleError);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function clearphoto() {
  const downloadbutton = document.getElementById('downloadbutton');
  let context = canvas.getContext('2d');
  context.fillStyle = "#EEE";
  context.fillRect(0, 0, canvas.width, canvas.height);

  downloadbutton.style.visibility = 'hidden';

  const data = canvas.toDataURL('image/png');
  photo.setAttribute('src', data);
}

// Capture a photo by fetching the current contents of the video
// and drawing it into a canvas, then converting that to a PNG
// format data URL. By drawing it on an offscreen canvas and then
// drawing that to the screen, we can change its size and/or apply
// other changes before drawing it.
function takepicture() {
  const context = canvas.getContext('2d');
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
  
    data = canvas.toDataURL('image/png');
    if(data != null) {
      photo.setAttribute('src', data);
      downloadbutton.style.visibility = 'visible';
    }
  } else {
    clearphoto();
  }
}

function savePhotoAsFile() {
  let timeStamp = ''.concat(Math.round(new Date().getTime()/1000));
  let filename = 'Photo_'.concat(timeStamp, extension);
  dialog.showSaveDialog({filters: [
    {name: 'Images', extensions: ['jpg', 'png', 'gif']}]}, (fileName) => {
    if (fileName === undefined) {
        console.log("You didn't save the file");
        return;
    }

    // fileName is a string that contains the path and filename created in the save file dialog.  
    fs.writeFile(fileName, data, (err) => {
        if(err) {
            alert("An error ocurred creating the file "+ err.message)
        }

        alert("The file has been succesfully saved");
    });
  }); 
}

function startApp() {
  const audioInputSelect = document.querySelector('select#audioSource');
  const audioOutputSelect = document.querySelector('select#audioOutput');
  const videoSelect = document.querySelector('select#videoSource');
  const audioMute = document.querySelector('input#audioMute');
  const selectors = [audioInputSelect, audioOutputSelect, videoSelect];
  const startbutton = document.getElementById('startbutton');
  const clearbutton = document.getElementById('clearbutton');
  const downloadbutton = document.getElementById('downloadbutton');
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');

  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

  audioInputSelect.onchange = start;
  audioOutputSelect.onchange = changeAudioDestination;
  videoSelect.onchange = start;
  audioMute.onchange = setAudioState;

  video.addEventListener('canplay', function(ev) {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);

      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.
      if (isNaN(height)) {
        height = width / (4/3);
      }

      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  startbutton.addEventListener('click', function(e) {
    takepicture();
    e.preventDefault();
  }, false);

  clearbutton.addEventListener('click', function(e) {
    clearphoto();
    e.preventDefault();
  }, false);

  clearphoto();
  downloadbutton.onclick = savePhotoAsFile;

  $(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
  });

  start();
}
