import React, { useState, useEffect } from 'react';
import './Popup.css';

const Popup = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingType, setRecordingType] = useState('microphone');
  const [showRecordingOptions, setShowRecordingOptions] = useState(false);

  useEffect(() => {
    // Check recording state when popup opens
    chrome.runtime.sendMessage({ action: 'getRecordingState' }, (response) => {
      if (response) {
        setIsRecording(response.isRecording);
      }
    });
  }, []);

  const handleStartRecording = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (!isRecording) {
        // Start recording
        chrome.runtime.sendMessage({ 
          action: 'startRecording', 
          recordingType: recordingType 
        }, (response) => {
          setIsLoading(false);
          if (response && response.success) {
            setIsRecording(true);
            setShowRecordingOptions(false);
            alert(`${recordingType} recording started!`);
          } else {
            alert(`Failed to start recording: ${response?.message || 'Unknown error'}`);
          }
        });
      } else {
        // Stop recording
        chrome.runtime.sendMessage({ action: 'stopRecording' }, (response) => {
          setIsLoading(false);
          if (response && response.success) {
            setIsRecording(false);
            alert('Recording stopped!');
          } else {
            alert(`Failed to stop recording: ${response?.message || 'Unknown error'}`);
          }
        });
      }
    } catch (error) {
      setIsLoading(false);
      alert(`Error: ${error.message}`);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
    // Add your login logic here
    if (!isLoggedIn) {
      alert('Logged in successfully!');
    } else {
      alert('Logged out!');
    }
  };

  return (
    <div className="popup-container">
      <div className="header">
        <h1 className="main-title">MIA</h1>
        <h2 className="subtitle">MEETING MINUTE ASSISTANT</h2>
        <p className="description">DESIGNED TO AUTOMATE MINUTES FOR MEETINGS</p>
      </div>

      <div className="actions-section">
        <div className="buttons-container">
          {!isRecording && !showRecordingOptions && (
            <button 
              className="record-options-btn"
              onClick={() => setShowRecordingOptions(true)}
            >
              CHOOSE RECORDING TYPE
            </button>
          )}
          
          {showRecordingOptions && !isRecording && (
            <div className="recording-options">
              <h3>Select Recording Source:</h3>
              <div className="option-buttons">
                <button 
                  className={`option-btn ${recordingType === 'microphone' ? 'selected' : ''}`}
                  onClick={() => setRecordingType('microphone')}
                >
                  🎤 MICROPHONE ONLY
                  <small>Records your voice only</small>
                </button>
                <button 
                  className={`option-btn ${recordingType === 'desktop' ? 'selected' : ''}`}
                  onClick={() => setRecordingType('desktop')}
                >
                  🖥️ DESKTOP AUDIO
                  <small>Records system audio (includes other participants)</small>
                </button>
                <button 
                  className={`option-btn ${recordingType === 'tab' ? 'selected' : ''}`}
                  onClick={() => setRecordingType('tab')}
                >
                  🌐 BROWSER TAB
                  <small>Records current tab audio</small>
                </button>
              </div>
              <div className="option-actions">
                <button 
                  className="back-btn"
                  onClick={() => setShowRecordingOptions(false)}
                >
                  BACK
                </button>
              </div>
            </div>
          )}
          
          {(isRecording || (!showRecordingOptions && recordingType)) && (
            <button 
              className={`record-btn ${isRecording ? 'recording' : ''} ${isLoading ? 'loading' : ''}`} 
              onClick={handleStartRecording}
              disabled={isLoading}
            >
              {isLoading ? 'PROCESSING...' : (isRecording ? 'STOP RECORDING' : `START ${recordingType.toUpperCase()} RECORDING`)}
            </button>
          )}
          
          <button 
            className={`login-btn ${isLoggedIn ? 'logged-in' : ''}`} 
            onClick={handleLogin}
          >
            {isLoggedIn ? 'LOGOUT' : 'LOGIN'}
          </button>
        </div>

        <div className="info-text">
          <span className="purple-text">RECORDING IS TRANSCRIBED AUTOMATICALLY WHEN LOGGED IN</span>
        </div>
      </div>
    </div>
  );
};

export default Popup;