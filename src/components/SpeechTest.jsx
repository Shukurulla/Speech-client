import React, { useState, useRef, useEffect } from "react";

const SpeechTest = ({
  testText = "The study of language is known as linguistics.",
  category = null,
  onNext = null,
  hasNext = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [testPhase, setTestPhase] = useState("ready"); // ready, recording, completed
  const [audioBlob, setAudioBlob] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setRecordedText(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
    }
  }, []);

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

  // Text-to-Speech for sample
  const playExampleAudio = () => {
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  // Start recording
  const startRecording = async () => {
    try {
      setTestPhase("recording");
      setTimeLeft(15);
      setRecordedText("");
      setIsRecording(true);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }

      // Start audio recording for playback
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    setIsListening(false);
    setTestPhase("completed");

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Calculate score
    const calculatedScore = calculateSimilarityScore(testText, recordedText);
    setScore(calculatedScore);
    setShowResults(true);
  };

  // Play recorded audio
  const playRecordedAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // Calculate similarity score
  const calculateSimilarityScore = (original, spoken) => {
    if (!spoken.trim()) return 0;

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

    // Consider pronunciation and fluency factors
    const accuracyScore = (matches / totalWords) * 100;
    const lengthFactor = Math.min(spokenWords.length / totalWords, 1);
    const finalScore = Math.round(accuracyScore * lengthFactor);

    return Math.min(finalScore, 100);
  };

  const resetTest = () => {
    setTestPhase("ready");
    setRecordedText("");
    setScore(null);
    setTimeLeft(15);
    setAudioBlob(null);
    setShowResults(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-8 py-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Speech Practice Test
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Recording Available</span>
            </div>
          </div>
          <button
            onClick={resetTest}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Quit
          </button>
        </div>
      </div>

      {/* Timer */}
      {testPhase === "recording" && (
        <div className="bg-blue-50 px-8 py-4 border-b">
          <div className="flex items-center justify-center">
            <div className="text-3xl font-bold text-blue-600">
              0:{timeLeft.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Record yourself saying the statement below.
          </h2>

          {/* Character illustration */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">👨‍🎓</span>
            </div>
          </div>

          {/* Test Text */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <p className="text-xl text-gray-900 leading-relaxed font-medium">
              "{testText}"
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
                <span>🔊</span>
                <span>Sample</span>
              </button>
              <button
                onClick={startRecording}
                className="px-8 py-3 bg-yellow-400 text-white rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Recording now
              </button>
            </div>
          </div>
        )}

        {/* Recording State */}
        {testPhase === "recording" && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
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
              {/* Original Text */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Expected Text:
                </h4>
                <p className="text-gray-700 bg-white p-4 rounded-lg border">
                  {testText}
                </p>
              </div>

              {/* Recorded Text */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Your Recording:
                </h4>
                <p className="text-gray-700 bg-white p-4 rounded-lg border">
                  {recordedText || "No speech detected"}
                </p>
              </div>
            </div>

            {/* Score */}
            {score !== null && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-3 bg-white rounded-xl p-4 border">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {score}/100
                    </div>
                    <div className="text-sm text-gray-600">Accuracy Score</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
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
                onClick={resetTest}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechTest;
