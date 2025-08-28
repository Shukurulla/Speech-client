// src/components/SpeechDebug.jsx
import React, { useEffect, useState } from "react";

const SpeechDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [micPermission, setMicPermission] = useState("unknown");

  useEffect(() => {
    // Collect debug information
    const info = {
      // Browser info
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,

      // Security context
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      hostname: window.location.hostname,

      // Speech API availability
      hasSpeechRecognition: !!window.SpeechRecognition,
      hasWebkitSpeechRecognition: !!window.webkitSpeechRecognition,
      hasMozSpeechRecognition: !!window.mozSpeechRecognition,
      hasMsSpeechRecognition: !!window.msSpeechRecognition,

      // Media devices
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ),

      // Browser detection
      isChrome:
        /Chrome/.test(navigator.userAgent) &&
        /Google Inc/.test(navigator.vendor),
      isFirefox: /Firefox/.test(navigator.userAgent),
      isSafari:
        /Safari/.test(navigator.userAgent) &&
        /Apple Computer/.test(navigator.vendor),
      isEdge: /Edg/.test(navigator.userAgent),

      // Additional checks
      hasAudioContext: !!(window.AudioContext || window.webkitAudioContext),
    };

    setDebugInfo(info);

    // Check microphone permission
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      // First check if permissions API is available
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({
            name: "microphone",
          });
          setMicPermission(result.state);

          result.addEventListener("change", () => {
            setMicPermission(result.state);
          });
        } catch (err) {
          console.log("Permissions API not fully supported:", err);
        }
      }

      // Try to get actual microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission("granted");
    } catch (err) {
      console.error("Microphone access error:", err);
      setMicPermission("denied");
    }
  };

  const testSpeechRecognition = () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Speech Recognition not available");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        console.log("Speech recognition started");
        alert("Speech recognition started! Say something...");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        alert(`You said: "${transcript}"`);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event);
        alert(`Error: ${event.error}`);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
      };

      recognition.start();
    } catch (err) {
      console.error("Test failed:", err);
      alert(`Test failed: ${err.message}`);
    }
  };

  const getStatusIcon = (status) => {
    if (status === true || status === "granted") return "✅";
    if (status === false || status === "denied") return "❌";
    if (status === "prompt") return "⚠️";
    return "❓";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-md z-50 border border-gray-200">
      <h3 className="font-bold text-lg mb-3">🔧 Speech Recognition Debug</h3>

      <div className="space-y-2 text-sm">
        {/* Security Context */}
        <div className="p-2 bg-gray-50 rounded">
          <strong>Security:</strong>
          <div>
            {getStatusIcon(debugInfo.isSecureContext)} Secure Context (HTTPS)
          </div>
          <div className="text-xs text-gray-600">
            Protocol: {debugInfo.protocol} | Host: {debugInfo.hostname}
          </div>
        </div>

        {/* Speech API Status */}
        <div className="p-2 bg-gray-50 rounded">
          <strong>Speech API:</strong>
          <div>
            {getStatusIcon(debugInfo.hasSpeechRecognition)} Standard API
          </div>
          <div>
            {getStatusIcon(debugInfo.hasWebkitSpeechRecognition)} Webkit API
          </div>
        </div>

        {/* Microphone Status */}
        <div className="p-2 bg-gray-50 rounded">
          <strong>Microphone:</strong>
          <div>{getStatusIcon(debugInfo.hasGetUserMedia)} getUserMedia API</div>
          <div>
            {getStatusIcon(micPermission === "granted")} Permission:{" "}
            {micPermission}
          </div>
        </div>

        {/* Browser Detection */}
        <div className="p-2 bg-gray-50 rounded">
          <strong>Browser:</strong>
          <div className="text-xs">
            {debugInfo.isChrome && "🟢 Chrome"}
            {debugInfo.isEdge && "🟢 Edge"}
            {debugInfo.isSafari && "🟡 Safari"}
            {debugInfo.isFirefox && "🔴 Firefox (Limited support)"}
          </div>
          <div className="text-xs text-gray-600">
            {navigator.userAgent.substring(0, 50)}...
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={testSpeechRecognition}
          className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          🎤 Test Speech Recognition
        </button>

        {/* Request Permission Button */}
        {micPermission !== "granted" && (
          <button
            onClick={checkMicrophonePermission}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            🔓 Request Microphone Permission
          </button>
        )}
      </div>

      {/* Instructions if not working */}
      {(!debugInfo.isSecureContext ||
        !debugInfo.hasWebkitSpeechRecognition) && (
        <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
          <strong>⚠️ Issues detected:</strong>
          <ul className="mt-1">
            {!debugInfo.isSecureContext && <li>• Use HTTPS or localhost</li>}
            {!debugInfo.hasWebkitSpeechRecognition && (
              <li>• Use Chrome or Edge browser</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SpeechDebug;
