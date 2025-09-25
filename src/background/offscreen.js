// Offscreen script for handling different recording types

let mediaRecorder = null;
let recordedChunks = [];
let currentStream = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'offscreen-start-recording') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      startRecording(stream, 'microphone');
      sendResponse({ success: true });
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  
  if (request.action === 'offscreen-start-desktop-recording') {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        },
        video: false // We only want audio for meeting minutes
      });
      
      startRecording(stream, 'desktop');
      sendResponse({ success: true });
      
    } catch (error) {
      console.error('Error accessing desktop audio:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  
  if (request.action === 'offscreen-handle-tab-stream') {
    try {
      // Handle tab capture stream (this would need additional implementation)
      console.log('Tab stream handling not fully implemented yet');
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error handling tab stream:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  
  if (request.action === 'offscreen-stop-recording') {
    stopRecording();
    sendResponse({ success: true });
    return true;
  }
});

// Start recording with given stream
function startRecording(stream, type) {
  currentStream = stream;
  recordedChunks = [];
  
  mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });
  
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
    console.log(`${type} recording completed, blob size:`, blob.size);
    
    // Here you could save the recording or send it for transcription
    saveRecording(blob, type);
    
    // Stop all tracks
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      currentStream = null;
    }
  };
  
  mediaRecorder.start(1000); // Collect data every second
  console.log(`Started ${type} recording`);
}

// Stop recording
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
  
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}

// Save recording (placeholder for future implementation)
function saveRecording(blob, type) {
  const timestamp = new Date().toISOString();
  const filename = `meeting_${type}_${timestamp}.webm`;
  
  // Store in chrome.storage or send to server for transcription
  console.log(`Saving ${filename}, size: ${blob.size} bytes`);
  
  // For now, create a download URL (you could also upload to a server)
  const url = URL.createObjectURL(blob);
  console.log(`Recording URL: ${url}`);
}
