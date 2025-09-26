import React, { useState } from 'react';
import './Popup.css';
import AudioCapturePermission from "../components/permission"

const Popup = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(!isRecording);
    // Add your recording logic here
    if (!isRecording) {
      alert('Recording started!');
    } else {
      alert('Recording stopped!');
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
          <button 
            className={`record-btn ${isRecording ? 'recording' : ''}`} 
            onClick={handleStartRecording}
          >
            {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
          </button>
          
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
      < AudioCapturePermission />
    </div>
  );
};

export default Popup;