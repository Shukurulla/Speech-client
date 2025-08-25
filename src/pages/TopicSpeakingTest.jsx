import React, { useState, useRef, useEffect } from "react";
import {
  FiMic,
  FiStopCircle,
  FiPlay,
  FiSend,
  FiMessageCircle,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiVolume2,
  FiRefreshCw,
} from "react-icons/fi";

const TopicSpeakingTest = ({ lessonRange, topic, onComplete, onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [testPhase, setTestPhase] = useState("preparation"); // preparation, recording, review, analyzing, feedback
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds to speak
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const finalTranscriptRef = useRef("");

  // Sample topic data (would come from API)
  const sampleTopic = topic || {
    title: "Environmental Protection",
    description:
      "Discuss the importance of environmental protection and what individuals can do to help preserve our planet.",
    keywords: [
      "environment",
      "pollution",
      "recycling",
      "climate",
      "nature",
      "conservation",
    ],
    lessonRange: lessonRange || "Lessons 16-20",
    preparationTime: 30, // seconds
    speakingTime: 60, // seconds
  };

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
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

  useEffect(() => {
    if (
      (testPhase === "preparation" || testPhase === "recording") &&
      timeLeft > 0
    ) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (testPhase === "preparation") {
        setTestPhase("recording");
        setTimeLeft(sampleTopic.speakingTime);
      } else if (testPhase === "recording" && isRecording) {
        stopRecording();
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, testPhase]);

  const initializeSpeechRecognition = () => {
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
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);

      if (testPhase === "recording" && isRecording) {
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

  const startPreparation = () => {
    setTestPhase("preparation");
    setTimeLeft(sampleTopic.preparationTime);
  };

  const startRecording = async () => {
    try {
      setTestPhase("recording");
      setTimeLeft(sampleTopic.speakingTime);
      setRecordedText("");
      finalTranscriptRef.current = "";
      setIsRecording(true);

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
      setTestPhase("preparation");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsListening(false);
    setTestPhase("review");

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

    // Get final text
    const finalText = finalTranscriptRef.current.trim();
    setRecordedText(finalText);
  };

  const analyzeWithAI = async () => {
    setTestPhase("analyzing");
    setIsAnalyzing(true);

    try {
      // This would be an actual API call to your backend
      // which then calls OpenAI or another AI service
      const response = await fetch("/api/ai/analyze-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("speech-token")}`,
        },
        body: JSON.stringify({
          topic: sampleTopic.title,
          topicDescription: sampleTopic.description,
          keywords: sampleTopic.keywords,
          userSpeech: recordedText,
          lessonRange: sampleTopic.lessonRange,
        }),
      });

      const data = await response.json();

      // For now, using mock data
      const mockAnalysis = {
        relevanceScore: 85,
        grammarScore: 78,
        vocabularyScore: 82,
        fluencyScore: 75,
        overallScore: 80,
        feedback: {
          strengths: [
            "Good use of topic-related vocabulary",
            "Clear main ideas presented",
            "Logical structure in your response",
          ],
          improvements: [
            "Try to use more complex sentence structures",
            "Include more specific examples",
            "Work on pronunciation of technical terms",
          ],
          grammarIssues: [
            "Subject-verb agreement in 2 instances",
            "Incorrect use of present perfect tense",
          ],
        },
        detailedAnalysis:
          "Your speech demonstrates a good understanding of the environmental protection topic. You mentioned key concepts like recycling and pollution control. However, you could enhance your response by providing more specific examples and using more sophisticated vocabulary related to environmental science.",
      };

      setAiAnalysis(mockAnalysis);
      setTestPhase("feedback");

      // Save the result
      saveTestResult(mockAnalysis);
    } catch (error) {
      console.error("Error analyzing speech:", error);
      alert("Failed to analyze speech. Please try again.");
      setTestPhase("review");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveTestResult = async (analysis) => {
    try {
      // Save to backend
      const result = {
        topic: sampleTopic,
        userSpeech: recordedText,
        analysis: analysis,
        timestamp: new Date().toISOString(),
      };

      // This would be an API call
      console.log("Saving result:", result);

      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error("Error saving result:", error);
    }
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

  const resetTest = () => {
    setTestPhase("preparation");
    setTimeLeft(sampleTopic.preparationTime);
    setRecordedText("");
    setAiAnalysis(null);
    finalTranscriptRef.current = "";
    setAudioBlob(null);
  };

  // Preparation Phase
  if (testPhase === "preparation") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-1">Topic Speaking Test</h1>
            <p className="text-purple-100">{sampleTopic.lessonRange}</p>
          </div>

          {/* Timer */}
          <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-yellow-900">
                Preparation Time
              </span>
              <div className="flex items-center space-x-2">
                <FiClock className="text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-900">
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Topic Content */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {sampleTopic.title}
              </h2>
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {sampleTopic.description}
                </p>
              </div>

              {/* Keywords */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">
                  Key Points to Consider:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sampleTopic.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Instructions:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • You have {sampleTopic.preparationTime} seconds to prepare
                  </li>
                  <li>
                    • Speak for {sampleTopic.speakingTime} seconds on the topic
                  </li>
                  <li>
                    • Your speech will be analyzed by AI for relevance and
                    quality
                  </li>
                  <li>• Try to use vocabulary from recent lessons</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startRecording}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FiMic className="mr-2" />
                Start Speaking Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Recording Phase
  if (testPhase === "recording") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-1">Recording Your Speech</h1>
            <p className="text-red-100">{sampleTopic.title}</p>
          </div>

          {/* Timer */}
          <div className="bg-red-50 border-b border-red-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-semibold">RECORDING</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiClock className="text-red-600" />
                <span className="text-2xl font-bold text-red-900">
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Live Transcription */}
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Speech (Live Transcription):
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 min-h-[200px] max-h-[300px] overflow-y-auto">
                <p className="text-gray-700 leading-relaxed">
                  {recordedText ||
                    "Start speaking... Your words will appear here..."}
                </p>
              </div>
            </div>

            {/* Word Count */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-50 rounded-lg px-4 py-2">
                <span className="text-blue-900 font-medium">
                  Word Count:{" "}
                  {recordedText.split(" ").filter((w) => w.length > 0).length}
                </span>
              </div>
            </div>

            {/* Stop Button */}
            <button
              onClick={stopRecording}
              className="w-full px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FiStopCircle className="mr-2" size={24} />
              Stop Recording
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review Phase
  if (testPhase === "review") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-1">Review Your Speech</h1>
            <p className="text-blue-100">{sampleTopic.title}</p>
          </div>

          <div className="p-8">
            {/* Recorded Text */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Recorded Speech:
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 max-h-[300px] overflow-y-auto">
                <p className="text-gray-700 leading-relaxed">
                  {recordedText || "No speech recorded. Please try again."}
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {recordedText.split(" ").filter((w) => w.length > 0).length}
                </div>
                <div className="text-sm text-blue-600">Words</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-900">
                  {Math.round(
                    recordedText.split(" ").filter((w) => w.length > 0).length /
                      (sampleTopic.speakingTime / 60)
                  )}
                </div>
                <div className="text-sm text-purple-600">Words/Min</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-900">
                  {sampleTopic.speakingTime - timeLeft}s
                </div>
                <div className="text-sm text-green-600">Duration</div>
              </div>
            </div>

            {/* Audio Playback */}
            {audioBlob && (
              <div className="mb-6">
                <button
                  onClick={playRecordedAudio}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors flex items-center justify-center"
                >
                  <FiVolume2 className="mr-2" />
                  Play Your Recording
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={resetTest}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <FiRefreshCw className="mr-2" />
                Try Again
              </button>
              <button
                onClick={analyzeWithAI}
                disabled={
                  !recordedText ||
                  recordedText.split(" ").filter((w) => w.length > 0).length <
                    10
                }
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FiSend className="mr-2" />
                Analyze with AI
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analyzing Phase
  if (testPhase === "analyzing") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-12 text-center">
            <div className="animate-pulse mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <FiMessageCircle className="text-purple-600 text-3xl" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Analyzing Your Speech
            </h2>
            <p className="text-gray-600 mb-6">
              Our AI is evaluating your speech for relevance, grammar, and
              vocabulary...
            </p>
            <div className="flex justify-center space-x-2">
              <div
                className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "200ms" }}
              ></div>
              <div
                className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "400ms" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Feedback Phase
  if (testPhase === "feedback" && aiAnalysis) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  AI Analysis Complete
                </h1>
                <p className="text-green-100">{sampleTopic.title}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {aiAnalysis.overallScore}%
                </div>
                <div className="text-green-100">Overall Score</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {aiAnalysis.relevanceScore}%
                </div>
                <div className="text-sm text-gray-600">Relevance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {aiAnalysis.grammarScore}%
                </div>
                <div className="text-sm text-gray-600">Grammar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {aiAnalysis.vocabularyScore}%
                </div>
                <div className="text-sm text-gray-600">Vocabulary</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {aiAnalysis.fluencyScore}%
                </div>
                <div className="text-sm text-gray-600">Fluency</div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                Analysis Summary:
              </h3>
              <p className="text-blue-800 leading-relaxed">
                {aiAnalysis.detailedAnalysis}
              </p>
            </div>

            {/* Strengths */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FiCheckCircle className="text-green-600 mr-2" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {aiAnalysis.feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FiAlertCircle className="text-orange-600 mr-2" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {aiAnalysis.feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Grammar Issues */}
            {aiAnalysis.feedback.grammarIssues.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Grammar Notes:
                </h3>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <ul className="space-y-1 text-sm text-yellow-800">
                    {aiAnalysis.feedback.grammarIssues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Lessons
              </button>
              <button
                onClick={resetTest}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Try Another Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TopicSpeakingTest;
