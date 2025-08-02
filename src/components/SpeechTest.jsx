import React, { useState, useRef, useEffect } from "react";
import TestService from "../service/test.service";

const SpeechTest = ({ testDetail, onNext, onBack, hasNext }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [testPhase, setTestPhase] = useState("ready"); // ready, recording, completed
  const [audioBlob, setAudioBlob] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugLog, setDebugLog] = useState([]);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Debug logging function
  const addDebugLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog((prev) => [...prev, `${timestamp}: ${message}`]);
    console.log(`[DEBUG] ${timestamp}: ${message}`);
  };

  // Check microphone permission on component mount
  useEffect(() => {
    addDebugLog("Component mounted, checking microphone permission");
    checkMicrophonePermission();
  }, []);

  // Check browser support
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      addDebugLog("webkitSpeechRecognition supported");
    } else if ("SpeechRecognition" in window) {
      addDebugLog("SpeechRecognition supported");
    } else {
      addDebugLog("Speech Recognition NOT supported");
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      addDebugLog("getUserMedia supported");
    } else {
      addDebugLog("getUserMedia NOT supported");
    }
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      addDebugLog("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophonePermission("granted");
      addDebugLog("Microphone permission granted");

      // Stop the stream
      stream.getTracks().forEach((track) => {
        track.stop();
        addDebugLog(`Audio track stopped: ${track.label}`);
      });
    } catch (error) {
      addDebugLog(
        `Microphone permission error: ${error.name} - ${error.message}`
      );
      setMicrophonePermission("denied");
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        addDebugLog("Speech recognition started");
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        addDebugLog(
          `Speech recognition result event: ${event.results.length} results`
        );

        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          addDebugLog(
            `Result ${i}: "${transcript}" (confidence: ${confidence}, final: ${event.results[i].isFinal})`
          );

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setRecordedText((prev) => {
            const newText = (prev + " " + finalTranscript).trim();
            addDebugLog(`Final transcript updated: "${newText}"`);
            return newText;
          });
        }
      };

      recognitionRef.current.onerror = (event) => {
        addDebugLog(`Speech recognition error: ${event.error}`);
        if (event.error === "not-allowed") {
          setMicrophonePermission("denied");
        }
      };

      recognitionRef.current.onend = () => {
        addDebugLog("Speech recognition ended");
        setIsListening(false);

        // Restart if still recording
        if (testPhase === "recording") {
          addDebugLog("Attempting to restart speech recognition...");
          setTimeout(() => {
            try {
              if (recognitionRef.current && testPhase === "recording") {
                recognitionRef.current.start();
                addDebugLog("Speech recognition restarted successfully");
              }
            } catch (error) {
              addDebugLog(
                `Failed to restart speech recognition: ${error.message}`
              );
            }
          }, 100);
        }
      };

      addDebugLog("Speech recognition initialized");
    } else {
      addDebugLog("Speech recognition not supported in this browser");
    }
  }, [testPhase]);

  // Timer countdown
  useEffect(() => {
    if (testPhase === "recording" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && testPhase === "recording") {
      addDebugLog("Timer finished, stopping recording");
      stopRecording();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, testPhase]);

  const requestMicrophonePermission = async () => {
    try {
      addDebugLog("Requesting microphone permission manually...");
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophonePermission("granted");
      addDebugLog("Permission granted, reloading page...");
      window.location.reload();
    } catch (error) {
      addDebugLog(`Permission denied: ${error.message}`);
      setMicrophonePermission("denied");
      alert(
        "Mikrofonga ruxsat berilmadi. Iltimos, brauzer sozlamalaridan mikrofonga ruxsat bering va sahifani qayta yuklang."
      );
    }
  };

  // Text-to-Speech for sample
  const playExampleAudio = () => {
    addDebugLog("Playing sample audio...");

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(testDetail.text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      addDebugLog("Sample audio started playing");
    };

    utterance.onend = () => {
      addDebugLog("Sample audio finished playing");
    };

    utterance.onerror = (event) => {
      addDebugLog(`Sample audio error: ${event.error}`);
    };

    speechSynthesis.speak(utterance);
  };

  // Start recording
  const startRecording = async () => {
    addDebugLog("Start recording button clicked");

    if (microphonePermission !== "granted") {
      addDebugLog("Microphone permission not granted, requesting...");
      const userConfirmed = confirm(
        "Mikrofon ruxsati kerak. Ruxsat berasizmi?"
      );
      if (userConfirmed) {
        await requestMicrophonePermission();
        return;
      } else {
        addDebugLog("User declined microphone permission");
        return;
      }
    }

    try {
      addDebugLog("Starting recording process...");
      setTestPhase("recording");
      setTimeLeft(15);
      setRecordedText("");
      setIsRecording(true);

      // Start audio recording
      addDebugLog("Requesting audio stream...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      addDebugLog(
        `Audio stream obtained with ${
          stream.getAudioTracks().length
        } audio tracks`
      );

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          addDebugLog(`Audio data chunk received: ${event.data.size} bytes`);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        addDebugLog("Media recorder stopped");
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        addDebugLog(`Audio blob created: ${audioBlob.size} bytes`);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(100);
      addDebugLog("Media recorder started");

      // Start speech recognition
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            addDebugLog("Starting speech recognition...");
            recognitionRef.current.start();
          } catch (error) {
            addDebugLog(`Error starting speech recognition: ${error.message}`);
          }
        } else {
          addDebugLog("Speech recognition not available");
        }
      }, 500);
    } catch (error) {
      addDebugLog(`Error in startRecording: ${error.message}`);
      alert(
        "Mikrofon ishlatishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
      );
      setTestPhase("ready");
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    addDebugLog("Stopping recording...");
    setIsRecording(false);
    setIsListening(false);
    setTestPhase("completed");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        addDebugLog("Speech recognition stopped");
      } catch (error) {
        addDebugLog(`Error stopping speech recognition: ${error.message}`);
      }
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
        addDebugLog("Media recorder stopped");
      } catch (error) {
        addDebugLog(`Error stopping media recorder: ${error.message}`);
      }
    }

    // Wait for final transcription
    setTimeout(() => {
      addDebugLog(`Final recorded text: "${recordedText}"`);
      const calculatedScore = calculateSimilarityScore(
        testDetail.text,
        recordedText
      );
      addDebugLog(`Calculated score: ${calculatedScore}`);
      setScore(calculatedScore);
      setShowResults(true);
    }, 1000);
  };

  // Play recorded audio
  const playRecordedAudio = () => {
    if (audioBlob) {
      addDebugLog("Playing recorded audio...");
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      addDebugLog("No audio blob available");
    }
  };

  // Calculate similarity score
  const calculateSimilarityScore = (original, spoken) => {
    if (!spoken || !spoken.trim()) {
      addDebugLog("No spoken text provided for scoring");
      return 0;
    }

    const originalWords = original.toLowerCase().split(/\s+/);
    const spokenWords = spoken.toLowerCase().split(/\s+/);

    let matches = 0;
    const totalWords = originalWords.length;

    originalWords.forEach((word) => {
      if (
        spokenWords.some(
          (spokenWord) => spokenWord.includes(word) || word.includes(spokenWord)
        )
      ) {
        matches++;
      }
    });

    const accuracyScore = (matches / totalWords) * 100;
    const lengthFactor = Math.min(spokenWords.length / totalWords, 1);
    const finalScore = Math.round(accuracyScore * lengthFactor);

    return Math.min(finalScore, 100);
  };

  const resetTest = () => {
    addDebugLog("Resetting test...");
    setTestPhase("ready");
    setRecordedText("");
    setScore(null);
    setTimeLeft(15);
    setAudioBlob(null);
    setShowResults(false);
    setDebugLog([]);
  };

  const handleQuit = () => {
    setShowQuitModal(true);
  };

  const confirmQuit = () => {
    onBack();
  };

  // Show error if microphone denied
  if (microphonePermission === "denied") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Mikrofonга ruxsat kerak
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Speech test uchun mikrofon kerak. Iltimos, brauzer sozlamalarida
            ruxsat bering.
          </p>
          <button
            onClick={requestMicrophonePermission}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Ruxsat berish
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Quit Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Are you sure you want to quit this session?
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowQuitModal(false)}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmQuit}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-8 py-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-gray-900">
                0:{timeLeft.toString().padStart(2, "0")}
              </div>
            </div>
            <button
              onClick={handleQuit}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Quit
            </button>
          </div>
        </div>

        {/* Timer Progress */}
        {testPhase === "recording" && (
          <div className="bg-gray-50 px-8 py-4 border-b">
            <div className="w-full bg-yellow-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Debug Panel - Only show in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 p-4 border-b max-h-40 overflow-y-auto">
            <h3 className="font-bold mb-2">Debug Log:</h3>
            <div className="text-xs space-y-1">
              {debugLog.slice(-10).map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Record yourself saying the statement below.
            </h2>

            {/* Character illustration */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center relative">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-900 rounded-full"></div>
                </div>
                <div className="absolute -right-2 top-4">
                  <div className="w-1 h-3 bg-gray-400 rounded mb-1"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded mb-1"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded"></div>
                </div>
              </div>
            </div>

            {/* Test Text */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <p className="text-xl text-gray-900 leading-relaxed font-medium">
                "{testDetail.text}"
              </p>
            </div>
          </div>

          {/* Status Information */}
          <div className="mb-6 text-center">
            <div className="text-sm text-gray-600 space-y-1">
              <p>Microphone: {microphonePermission || "checking..."}</p>
              <p>Listening: {isListening ? "Yes" : "No"}</p>
              <p>Recording: {isRecording ? "Yes" : "No"}</p>
              <p>Phase: {testPhase}</p>
              <p>Recorded text length: {recordedText.length} characters</p>
            </div>
          </div>

          {/* Recording Controls */}
          {testPhase === "ready" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={playExampleAudio}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span>🔊</span>
                  <span>Sample</span>
                </button>
              </div>
              <button
                onClick={startRecording}
                className="px-8 py-3 bg-yellow-400 text-white rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Recording now
              </button>
            </div>
          )}

          {/* Recording State */}
          {testPhase === "recording" && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="font-semibold">RECORDING...</span>
                </div>
              </div>

              {/* Audio Waveform Animation */}
              <div className="flex justify-center space-x-1 mb-6">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-600 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 30 + 10}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>

              {/* Show transcribed text */}
              {(recordedText || isListening) && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                  <p className="text-blue-800">
                    {isListening && !recordedText && (
                      <span className="italic">Listening...</span>
                    )}
                    {recordedText && (
                      <span>
                        <strong>Transcribing:</strong> "{recordedText}"
                      </span>
                    )}
                  </p>
                </div>
              )}

              <button
                onClick={stopRecording}
                className="px-8 py-3 bg-yellow-400 text-white rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="bg-green-50 rounded-xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Question completed! Review the sample answer.
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Expected Text:
                  </h4>
                  <p className="text-gray-700 bg-white p-4 rounded-lg border">
                    {testDetail.text}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Your Recording:
                  </h4>
                  <p className="text-gray-700 bg-white p-4 rounded-lg border">
                    {recordedText || "No speech detected"}
                  </p>
                </div>
              </div>

              {score !== null && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center space-x-3 bg-white rounded-xl p-4 border">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {score}/100
                      </div>
                      <div className="text-sm text-gray-600">
                        Accuracy Score
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={playExampleAudio}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span>🔊</span>
                  <span>Sample</span>
                </button>

                <button
                  onClick={playRecordedAudio}
                  disabled={!audioBlob}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>📊</span>
                  <span>Your recording</span>
                </button>

                <button
                  onClick={hasNext ? onNext : onBack}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SpeechTest;
