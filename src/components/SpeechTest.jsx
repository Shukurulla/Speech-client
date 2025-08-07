import React, { useState, useRef, useEffect } from "react";
import { FiActivity, FiAward, FiVolume2 } from "react-icons/fi";

const SpeechTest = ({
  testDetail,
  onNext,
  onBack,
  hasNext,
  onComplete,
  questionNumber = 1,
  totalQuestions = 1,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [testPhase, setTestPhase] = useState("ready"); // ready, recording, completed
  const [audioBlob, setAudioBlob] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const finalTranscriptRef = useRef("");

  // Check microphone permission and initialize on component mount
  useEffect(() => {
    initializeComponent();

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Recognition cleanup:", e);
        }
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Reset state when question changes
  useEffect(() => {
    resetQuestionState();
  }, [testDetail._id]);

  const initializeComponent = async () => {
    setIsLoading(true);
    await checkMicrophonePermission();
    await initializeSpeechRecognition();
    setIsLoading(false);
  };

  const resetQuestionState = () => {
    setIsRecording(false);
    setRecordedText("");
    setIsListening(false);
    setScore(null);
    setTimeLeft(30);
    setTestPhase("ready");
    setAudioBlob(null);
    setShowResults(false);
    setIsProcessing(false);
    finalTranscriptRef.current = "";

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Recognition stop error:", e);
      }
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (testPhase === "recording" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && testPhase === "recording") {
      stopRecording();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, testPhase]);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophonePermission("granted");
      // Stop the stream immediately
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Microphone permission error:", error);
      setMicrophonePermission("denied");
    }
  };

  const initializeSpeechRecognition = async () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.error("Speech recognition not supported");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript;
      setRecordedText(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setMicrophonePermission("denied");
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);

      // Auto-restart if still recording
      if (testPhase === "recording") {
        try {
          setTimeout(() => {
            if (recognitionRef.current && testPhase === "recording") {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (error) {
          console.error("Failed to restart recognition:", error);
        }
      }
    };
  };

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophonePermission("granted");
      await initializeSpeechRecognition();
    } catch (error) {
      setMicrophonePermission("denied");
      alert(
        "Microphone access denied. Please enable microphone access in your browser settings."
      );
    }
  };

  const playExampleAudio = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(testDetail.text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    if (microphonePermission !== "granted") {
      await requestMicrophonePermission();
      return;
    }

    try {
      setTestPhase("recording");
      setTimeLeft(30);
      setRecordedText("");
      finalTranscriptRef.current = "";
      setIsRecording(true);
      setIsProcessing(false);

      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(100);

      // Start speech recognition
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error("Error starting speech recognition:", error);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Failed to start recording. Please check your microphone and try again."
      );
      setTestPhase("ready");
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording...");
    setIsRecording(false);
    setIsListening(false);
    setTestPhase("completed");
    setIsProcessing(true);

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }

    // Stop media recorder
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error("Error stopping media recorder:", error);
      }
    }

    // Wait a bit for final transcription
    setTimeout(() => {
      const finalText = finalTranscriptRef.current.trim();
      setRecordedText(finalText);

      const calculatedScore = calculateSimilarityScore(
        testDetail.text,
        finalText
      );
      setScore(calculatedScore);
      setShowResults(true);
      setIsProcessing(false);

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(testDetail._id, calculatedScore, finalText);
      }
    }, 1000);
  };

  const playRecordedAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  const calculateSimilarityScore = (original, spoken) => {
    if (!spoken || !spoken.trim()) {
      return 0;
    }

    const originalWords = original
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const spokenWords = spoken
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);

    if (originalWords.length === 0) return 0;

    let exactMatches = 0;
    let partialMatches = 0;

    originalWords.forEach((originalWord) => {
      const exactMatch = spokenWords.find(
        (spokenWord) => spokenWord === originalWord
      );

      if (exactMatch) {
        exactMatches++;
      } else {
        const partialMatch = spokenWords.find((spokenWord) => {
          return (
            spokenWord.includes(originalWord) ||
            originalWord.includes(spokenWord) ||
            levenshteinDistance(originalWord, spokenWord) <= 2
          );
        });

        if (partialMatch) {
          partialMatches++;
        }
      }
    });

    // Calculate scores
    const exactScore = (exactMatches / originalWords.length) * 100;
    const partialScore = (partialMatches / originalWords.length) * 30;

    // Length factor
    const lengthRatio = spokenWords.length / originalWords.length;
    const lengthFactor = lengthRatio > 1.5 || lengthRatio < 0.5 ? 0.8 : 1;

    const finalScore = Math.round((exactScore + partialScore) * lengthFactor);
    return Math.max(0, Math.min(100, finalScore));
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const handleNext = () => {
    if (hasNext) {
      onNext();
    } else {
      onBack(); // Go back to test selection if this was the last question
    }
  };

  const handleQuit = () => {
    setShowQuitModal(true);
  };

  const confirmQuit = () => {
    onBack();
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Initializing Speech Test
            </h3>
            <p className="text-gray-600">
              Setting up microphone and speech recognition...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                Question {questionNumber} of {totalQuestions}
              </div>
              <div className="text-lg font-medium text-gray-600">
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
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
                style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {testDetail.condition}
            </h2>

            {/* Test Text */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <p className="text-xl text-gray-900 leading-relaxed font-medium">
                "{testDetail.text}"
              </p>
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
                  <span>
                    <FiVolume2 />
                  </span>
                  <span>Listen to Sample</span>
                </button>
              </div>
              <button
                onClick={startRecording}
                className="px-8 py-3 bg-yellow-400 text-white rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Start Recording
              </button>
              <p className="text-sm text-gray-500">
                You'll have 30 seconds to speak
              </p>
            </div>
          )}

          {/* Recording State */}
          {testPhase === "recording" && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="font-semibold">RECORDING...</span>
                </div>
              </div>

              {/* Audio Waveform Animation */}
              <div className="flex justify-center space-x-1 mb-6">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-600 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 30 + 10}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>

              {/* Live Transcription */}
              {recordedText && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                  <p className="text-blue-800">
                    <strong>Live transcription:</strong> "{recordedText}"
                  </p>
                </div>
              )}

              <button
                onClick={stopRecording}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Stop Recording
              </button>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing your recording...</p>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="bg-green-50 rounded-xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Recording completed!
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
                    <span className="text-3xl text-yellow-500">
                      <FiAward />
                    </span>
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
                  <span>
                    <FiVolume2 />
                  </span>
                  <span>Sample</span>
                </button>

                <button
                  onClick={playRecordedAudio}
                  disabled={!audioBlob}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <span>
                    <FiActivity />
                  </span>
                  <span>Your recording</span>
                </button>

                <button
                  onClick={resetTest}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Try Again
                </button>

                <button
                  onClick={hasNext ? onNext : onBack}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  {hasNext ? "Next Question" : "Complete Test"}
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
