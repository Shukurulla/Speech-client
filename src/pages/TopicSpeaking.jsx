// src/pages/TopicSpeaking.jsx
import React, { useState, useEffect, useRef } from "react";
import ResponsiveLayout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiMic,
  FiMicOff,
  FiSend,
  FiRefreshCw,
  FiVolume2,
  FiEdit3,
  FiPause,
  FiPlay,
} from "react-icons/fi";
import axios from "../service/api";
import { toast } from "react-hot-toast";

const TopicSpeaking = () => {
  const { gradeId, lessonNumber } = useParams();
  const navigate = useNavigate();
  const [topicTest, setTopicTest] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualMode, setIsManualMode] = useState(false); // Manual typing mode
  const timerRef = useRef(null);

  // Speech recognition reference
  const recognitionRef = useRef(null);
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    fetchTopicTest();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopRecognition();
    };
  }, []);

  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, timeLeft]);

  const fetchTopicTest = async () => {
    try {
      const { data } = await axios.get(
        `/topic-test/grade/${gradeId}/lesson/${lessonNumber}`
      );

      if (data.status === "success" && data.data) {
        setTopicTest(data.data);
        setTimeLeft(data.data.duration || 60);
      } else {
        toast.error("No topic test found for this lesson");
        // Don't navigate immediately, give user time to see the message
        setTimeout(() => {
          navigate(`/lesson/${gradeId}/tests`, { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching topic test:", error);

      // More specific error handling
      if (error.response?.status === 404) {
        toast.error("Topic test not available for this lesson");
      } else {
        toast.error("Failed to load topic test");
      }

      // Navigate back after delay
      setTimeout(() => {
        navigate(-1, { replace: true });
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const speechToText = () => {
    try {
      if (!SpeechRecognition) {
        toast.error("Speech recognition not supported in your browser");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognitionRef.current = recognition;

      recognition.start();
      console.log("Recognition started");

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setFinalText((prev) => prev + " " + finalTranscript);
        }

        setInterimText(interimTranscript);
      };

      recognition.onspeechend = () => {
        console.log("Speech ended, restarting...");
        if (isRecording) {
          speechToText();
        }
      };

      recognition.onerror = (event) => {
        console.log("Recognition error:", event.error);

        if (event.error === "no-speech") {
          if (isRecording) {
            setTimeout(() => {
              if (isRecording && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  speechToText();
                }
              }
            }, 100);
          }
        } else if (event.error === "audio-capture") {
          toast.error("No microphone found. Please check your microphone.");
          stopRecording();
        } else if (event.error === "not-allowed") {
          toast.error("Microphone permission denied.");
          stopRecording();
        }
      };

      recognition.onend = () => {
        console.log("Recognition ended");
        if (isRecording) {
          setTimeout(() => {
            if (isRecording) {
              speechToText();
            }
          }, 100);
        }
      };
    } catch (error) {
      console.error("Error in speechToText:", error);
      toast.error("Failed to start speech recognition");
    }
  };

  const startRecording = () => {
    if (!SpeechRecognition) {
      toast.error(
        "Your browser doesn't support speech recognition. Please use Chrome or Edge."
      );
      return;
    }

    setFinalText("");
    setInterimText("");
    setIsRecording(true);
    setIsManualMode(false);

    speechToText();

    toast.success("Recording started. Start speaking!");
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (e) {
        console.log("Stop error:", e);
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (interimText) {
      setFinalText((prev) => prev + " " + interimText);
      setInterimText("");
    }

    stopRecognition();
    console.log("Recording stopped");
  };

  const handleReset = () => {
    stopRecording();
    setFinalText("");
    setInterimText("");
    setTimeLeft(topicTest?.duration || 60);
    setIsManualMode(false);
    toast.success("Reset completed");
  };

  const handleManualMode = () => {
    stopRecording();
    setIsManualMode(true);
    toast.info("Manual typing mode enabled. You can type your response.");
  };

  const handleTextChange = (e) => {
    setFinalText(e.target.value);
  };

  const handleSubmit = async () => {
    const fullText = (finalText + " " + interimText).trim();

    if (!fullText) {
      toast.error("Please record or type your response first");
      return;
    }

    const wordCount = fullText
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    if (wordCount < 20) {
      toast.error(
        `Your response is too short. You have ${wordCount} words, need at least 20.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post("/topic-test/evaluate", {
        topicTestId: topicTest._id,
        gradeId,
        lessonNumber: parseInt(lessonNumber),
        spokenText: fullText,
        duration: (topicTest?.duration || 60) - timeLeft,
      });

      toast.success("Test submitted successfully!");
      navigate(`/topic-test/result/${data.data._id}`);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error(error.response?.data?.message || "Failed to submit test");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getWordCount = () => {
    const fullText = (finalText + " " + interimText).trim();
    return fullText.split(/\s+/).filter((word) => word.length > 0).length;
  };

  const getDisplayText = () => {
    if (isManualMode) {
      return finalText;
    }
    return (
      <>
        {finalText}
        {interimText && (
          <span className="text-gray-500 italic"> {interimText}</span>
        )}
      </>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <ResponsiveLayout
        activePage={
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
        activeTab="Dashboard"
      />
    );
  }

  // Main content
  const PageContent = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Speaking Topic Test
              </h1>
              <p className="text-gray-600 mt-1">
                Lesson {lessonNumber} Topic Test
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Topic Display */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiVolume2 className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {topicTest?.topic || "Loading topic..."}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {topicTest?.prompt || "Loading prompt..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timer and Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div
                className={`text-3xl font-bold ${
                  timeLeft < 10 ? "text-red-600" : "text-gray-800"
                }`}
              >
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Time Remaining</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div
                className={`text-3xl font-bold ${
                  getWordCount() >= 20 ? "text-green-600" : "text-gray-800"
                }`}
              >
                {getWordCount()}
              </div>
              <p className="text-sm text-gray-600 mt-1">Words Spoken/Written</p>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="mb-8">
            <div className="flex justify-center gap-3">
              {!isRecording && !isManualMode ? (
                <>
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <FiMic className="text-xl" />
                    <span className="font-semibold">Start Speaking</span>
                  </button>
                  <button
                    onClick={handleManualMode}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <FiEdit3 className="text-xl" />
                    <span className="font-semibold">Type Instead</span>
                  </button>
                </>
              ) : isRecording ? (
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 flex items-center gap-2"
                >
                  <FiMicOff />
                  Stop Recording
                </button>
              ) : null}

              {(finalText || interimText || isManualMode) && !isRecording && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 flex items-center gap-2"
                >
                  <FiRefreshCw />
                  Reset
                </button>
              )}
            </div>

            {isRecording && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    Recording in progress... Speak clearly!
                  </span>
                </div>
              </div>
            )}

            {isManualMode && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                  <FiEdit3 />
                  <span className="font-medium">
                    Manual typing mode - Type your response below
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Response Text Area */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Your Response:</h4>
              {(finalText || interimText) && (
                <span className="text-sm text-gray-500">
                  {getWordCount()} words
                </span>
              )}
            </div>

            {isManualMode ? (
              <textarea
                value={finalText}
                onChange={handleTextChange}
                placeholder="Type your response here..."
                className="w-full border-2 border-gray-200 rounded-lg p-4 min-h-[200px] bg-white text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-blue-400 transition-colors"
                autoFocus
              />
            ) : (
              <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[200px] bg-gray-50">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {getDisplayText()}
                  {!finalText && !interimText && (
                    <span className="text-gray-400 italic">
                      Your spoken text will appear here as you speak...
                    </span>
                  )}
                </p>
              </div>
            )}

            {getWordCount() > 0 && getWordCount() < 20 && (
              <p className="text-sm text-yellow-600 mt-2">
                ⚠️ Minimum 20 words required. {isManualMode ? "Type" : "Speak"}{" "}
                more! ({20 - getWordCount()} more words needed)
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || getWordCount() < 20 || isRecording}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2 transition-all"
            >
              <FiSend />
              {isSubmitting ? "Evaluating..." : "Submit Test"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ResponsiveLayout activePage={<PageContent />} activeTab="Dashboard" />
  );
};

export default TopicSpeaking;
