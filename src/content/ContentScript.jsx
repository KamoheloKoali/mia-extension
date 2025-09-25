import React from 'react';
import ReactDOM from 'react-dom/client';

// Recording Control Component
const RecordingControl = () => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: window.innerWidth - 120, y: 20 });

  React.useEffect(() => {
    // Check initial recording state
    chrome.runtime.sendMessage({ action: 'getRecordingState' }, (response) => {
      if (response) {
        setIsRecording(response.isRecording);
      }
    });

    // Listen for recording state changes
    const messageListener = (request, sender, sendResponse) => {
      if (request.action === 'recordingStateChanged') {
        setIsRecording(request.isRecording);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleStopRecording = () => {
    chrome.runtime.sendMessage({ action: 'stopRecording' }, (response) => {
      if (response && response.success) {
        setIsRecording(false);
      }
    });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - startX));
      const newY = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - startY));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!isRecording) return null;

  const styles = {
    container: {
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '20px',
      zIndex: 999999,
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: isDragging ? 'grabbing' : 'grab',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      userSelect: 'none',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      minWidth: '100px'
    },
    recordingDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#ff4444',
      animation: 'pulse 1.5s infinite'
    },
    stopButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '10px',
      fontSize: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background 0.2s'
    },
    text: {
      fontSize: '10px',
      fontWeight: '500'
    }
  };

  return ReactDOM.createPortal(
    <>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
      <div
        style={styles.container}
        onMouseDown={handleMouseDown}
      >
        <div style={styles.recordingDot}></div>
        <span style={styles.text}>REC</span>
        <button
          style={styles.stopButton}
          onClick={handleStopRecording}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          STOP
        </button>
      </div>
    </>,
    document.body
  );
};

// Component that will be injected into pages
const ContentApp = () => {
  return <RecordingControl />;
};

// Inject our React component
const app = document.createElement('div');
app.id = 'mia-extension-content';
document.body.appendChild(app);

const root = ReactDOM.createRoot(app);
root.render(<ContentApp />);