// Background script for handling recording functionality

let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];
let recordingType = 'microphone'; // 'microphone' or 'tab' or 'desktop'

// Listen for messages from popup and content script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    try {
      recordingType = request.recordingType || 'microphone';
      
      if (recordingType === 'tab') {
        // Record current tab audio (for meeting platforms)
        await startTabRecording(sender.tab?.id);
      } else if (recordingType === 'desktop') {
        // Record desktop audio (screen share with audio)
        await createOffscreenDocument();
        const response = await chrome.runtime.sendMessage({
          action: 'offscreen-start-desktop-recording'
        });
        
        if (!response?.success) {
          throw new Error('Failed to start desktop recording');
        }
      } else {
        // Default microphone recording
        await createOffscreenDocument();
        const response = await chrome.runtime.sendMessage({
          action: 'offscreen-start-recording'
        });
        
        if (!response?.success) {
          throw new Error('Failed to start microphone recording');
        }
      }
      
      isRecording = true;
      
      // Store recording state
      await chrome.storage.local.set({ 
        isRecording: true, 
        recordingType: recordingType 
      });
      
      // Notify all tabs about recording state
      broadcastRecordingState(true);
      
      sendResponse({ success: true, message: `${recordingType} recording started` });
    } catch (error) {
      console.error('Error starting recording:', error);
      sendResponse({ success: false, message: error.message });
    }
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'stopRecording') {
    try {
      // Send message to offscreen document to stop recording
      const response = await chrome.runtime.sendMessage({
        action: 'offscreen-stop-recording'
      });
      
      isRecording = false;
      
      // Store recording state
      await chrome.storage.local.set({ isRecording: false });
      
      // Notify all tabs about recording state
      broadcastRecordingState(false);
      
      // Close offscreen document
      await closeOffscreenDocument();
      
      sendResponse({ success: true, message: 'Recording stopped' });
    } catch (error) {
      console.error('Error stopping recording:', error);
      sendResponse({ success: false, message: error.message });
    }
    return true;
  }
  
  if (request.action === 'getRecordingState') {
    const result = await chrome.storage.local.get(['isRecording']);
    sendResponse({ isRecording: result.isRecording || false });
    return true;
  }
});

// Broadcast recording state to all content scripts
async function broadcastRecordingState(recording) {
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    chrome.tabs.sendMessage(tab.id, {
      action: 'recordingStateChanged',
      isRecording: recording
    }).catch(() => {
      // Ignore errors for tabs that don't have content script
    });
  });
}

// Create offscreen document for microphone access
async function createOffscreenDocument() {
  const existingDocuments = await chrome.offscreen.getDocuments();
  
  if (existingDocuments.length > 0) {
    return; // Document already exists
  }
  
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'Recording audio for meeting minutes'
  });
}

// Close offscreen document
async function closeOffscreenDocument() {
  const existingDocuments = await chrome.offscreen.getDocuments();
  
  if (existingDocuments.length > 0) {
    await chrome.offscreen.closeDocument();
  }
}

// Start tab recording (captures audio from meeting platforms)
async function startTabRecording(tabId) {
  if (!tabId) {
    // Get active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = activeTab.id;
  }
  
  try {
    const stream = await chrome.tabCapture.capture({
      audio: true,
      video: false
    });
    
    // Create offscreen document to handle the stream
    await createOffscreenDocument();
    
    // Send stream to offscreen for recording
    const response = await chrome.runtime.sendMessage({
      action: 'offscreen-handle-tab-stream',
      streamId: stream.id
    });
    
    return response;
  } catch (error) {
    throw new Error(`Tab recording failed: ${error.message}`);
  }
}
