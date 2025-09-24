import React, { useState } from "react";

const AudioCapturePermission = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  const requestPermission = () => {
    if (!chrome.tabCapture) {
      setError("tabCapture API not available. Did you enable it in manifest.json?");
      return;
    }

    chrome.tabCapture.capture(
      {
        audio: true,
        video: false
      },
      (capturedStream) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message);
          return;
        }
        if (!capturedStream) {
          setError("User denied permission or no stream available.");
          return;
        }
        setStream(capturedStream);
        setError(null);
      }
    );
  };

  return (
    <div className="p-4 border rounded-xl bg-gray-100 max-w-md">
      <h2 className="text-lg font-semibold mb-2">Tab Audio Capture</h2>

      {!stream ? (
        <>
          <p className="mb-2 text-gray-700">
            Click below to grant permission to capture audio from this tab.
          </p>
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Request Permission
          </button>
        </>
      ) : (
        <p className="text-green-600 font-medium">✅ Audio capture started!</p>
      )}

      {error && <p className="text-red-600 mt-2">⚠️ {error}</p>}
    </div>
  );
};

export default AudioCapturePermission;
