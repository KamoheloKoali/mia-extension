import React, { useState, useEffect } from 'react';
import  AudioCapturePermission from "../components/permission"

const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setCurrentUrl(tabs[0].url);
    });

    // Load saved count from storage
    chrome.storage.local.get(['count'], (result) => {
      setCount(result.count || 0);
    });
  }, []);

  const incrementCount = () => {
    const newCount = count + 1;
    setCount(newCount);
    chrome.storage.local.set({ count: newCount });
  };

  const changePageColor = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'changeColor' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Error:', chrome.runtime.lastError.message);
          // Fallback: inject script directly if content script isn't available
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => {
              document.body.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            }
          }).catch(err => console.log('Script injection failed:', err));
        }
      });
    });
  };

  return (
    <div className="w-[500px] p-5 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]">
      <h1 className="text-lg mb-4 text-gray-700">React Chrome Extension</h1>
      
      <div className="mb-4 p-2.5 bg-gray-100 rounded">
        <p className="mb-2">Count: {count}</p>
        <button 
          onClick={incrementCount}
          className="bg-[#61dafb] text-white border-none py-1 px-2.5 rounded-sm cursor-pointer hover:bg-[#4fa8c5] transition-colors"
        >
          Increment
        </button>
      </div>
      
      <div className="mb-4 p-2.5 bg-blue-50 rounded">
        <p className="mb-2">Current URL:</p>
        <small className="break-all text-gray-600">{currentUrl}</small>
      </div>
      
      <button 
        onClick={changePageColor} 
        className="w-full bg-[#764abc] text-white border-none p-2.5 rounded cursor-pointer hover:bg-[#5a3796] transition-colors"
      >
        Change Page Color
      </button>
      < AudioCapturePermission />
    </div>
  );
};

export default Popup;