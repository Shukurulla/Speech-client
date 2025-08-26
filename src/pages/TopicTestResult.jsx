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
} from "react-icons/fi";
import axios from "../service/api";
import { toast } from "react-hot-toast";

const TopicSpeaking = () => {
  const { gradeId, lessonNumber } = useParams();
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [topicTest, setTopicTest] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [browserSupported, setBrowserSupported] = useState(true);
  const timerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingStarted, setRecordingStarted] = useState(false);

  console.log("GradeId:", gradeId);
  console.log("LessonNumber:", lessonNumber);

  useEffect(() => {
    // Check browser support
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setBrowserSupported(false);
      toast.error("Your browser does not support speech recognition");
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.maxAlternatives = 1;

    // Speech recognition sozlamalari
    recognitionRef.current.onstart = () => {
      console.log("Speech recognition service has started");
    };

    recognitionRef.current.onspeechstart = () => {
      console.log("Speech has been detected");
    };

    recognitionRef.current.onspeechend = () => {
      console.log("Speech has stopped being detected");
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      // Barcha natijalarni ko'rib chiqish
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript = transcript;
        }
      }

      // Matnni yangilash
      if (finalTranscript || interimTranscript) {
        setSpokenText((prev) => {
          // Agar final transcript bo'lsa, uni qo'shamiz
          if (finalTranscript) {
            return prev + finalTranscript;
          }
          // Aks holda, oxirgi interim transcript'ni ko'rsatamiz
          return prev;
        });
      }
    };

    recognitionRef.current.onerror = (event) => {
      // no-speech xatoligi normal holat - e'tiborsiz qoldirish
      if (event.error === "no-speech") {
        console.log("No speech detected - waiting for speech...");
        return; // Hech narsa qilmaymiz, recognition avtomatik davom etadi
      }

      console.error("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        toast.error(
          "Microphone access denied. Please allow microphone access and try again."
        );
        setIsRecording(false);
      } else if (event.error === "network") {
        toast.error("Network error. Please check your connection.");
        setIsRecording(false);
      } else if (event.error === "aborted") {
        console.log("Speech recognition aborted");
      } else if (event.error === "audio-capture") {
        toast.error("No microphone found. Please check your microphone.");
        setIsRecording(false);
      } else if (event.error === "service-not-allowed") {
        toast.error("Speech recognition service not available.");
        setIsRecording(false);
      }
      // Boshqa xatoliklar uchun hech narsa qilmaymiz
    };

    recognitionRef.current.onend = () => {
      console.log(
        "Recognition ended, isRecording:",
        isRecording,
        "isPaused:",
        isPaused
      );

      // Agar hali ham yozib olish davom etayotgan bo'lsa, qayta boshlash
      if (isRecording && !isPaused) {
        setTimeout(() => {
          try {
            if (recognitionRef.current && isRecording) {
              recognitionRef.current.start();
              console.log("Recognition restarted");
            }
          } catch (error) {
            if (error.message.includes("already started")) {
              console.log("Recognition already running");
            } else {
              console.error("Failed to restart recognition:", error);
            }
          }
        }, 100);
      }
    };

    fetchTopicTest();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Recognition cleanup error:", e);
        }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gradeId, lessonNumber]);

  useEffect(() => {
    if (isRecording && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleStop();
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
  }, [isRecording, isPaused, timeLeft]);

  const fetchTopicTest = async () => {
    try {
      console.log(
        "Fetching topic test for:",
        `/topic-test/grade/${gradeId}/lesson/${lessonNumber}`
      );
      const { data } = await axios.get(
        `/topic-test/grade/${gradeId}/lesson/${lessonNumber}`
      );
      console.log("Topic test data:", data);

      if (data.status === "success" && data.data) {
        setTopicTest(data.data);
        setTimeLeft(data.data.duration || 60);
      } else {
        toast.error("No topic test found for this lesson");
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (error) {
      console.error("Error fetching topic test:", error);
      toast.error("Failed to load topic test");
      setTimeout(() => navigate(-1), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    if (!browserSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("Microphone access granted");

      setSpokenText("");
      setIsRecording(true);
      setIsPaused(false);
      setRecordingStarted(true);

      // Recognition'ni boshlash
      try {
        recognitionRef.current.start();
        console.log("Recognition start command sent");
        toast.success("Recording started. Speak clearly into your microphone.");
      } catch (error) {
        if (error.message && error.message.includes("already started")) {
          console.log("Recognition already running");
          // Agar allaqachon ishlayotgan bo'lsa, avval to'xtatib, keyin qayta boshlaymiz
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
            console.log("Recognition restarted");
          }, 100);
        } else {
          console.error("Failed to start recognition:", error);
          toast.error("Failed to start speech recognition");
          setIsRecording(false);
        }
      }
    } catch (error) {
      console.error("Failed to access microphone:", error);
      toast.error(
        "Failed to access microphone. Please check your permissions and make sure no other app is using the microphone."
      );
      setIsRecording(false);
      setRecordingStarted(false);
    }
  };

  const handleStop = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Stop recognition error:", e);
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handlePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setTimeout(() => {
        try {
          recognitionRef.current.start();
          toast.success("Recording resumed");
        } catch (error) {
          if (error.message.includes("already started")) {
            console.log("Recognition already running");
          } else {
            console.error("Failed to resume recognition:", error);
          }
        }
      }, 100);
    } else {
      setIsPaused(true);
      try {
        recognitionRef.current.stop();
        toast.success("Recording paused");
      } catch (error) {
        console.log("Error pausing recognition:", error);
      }
    }
  };

  const handleReset = () => {
    handleStop();
    setSpokenText("");
    setTimeLeft(topicTest?.duration || 60);
    setRecordingStarted(false);
    toast.success("Recording reset");
  };

  const handleSubmit = async () => {
    if (!spokenText.trim()) {
      toast.error("Please record your response first");
      return;
    }

    const wordCount = spokenText.trim().split(/\s+/).length;
    if (wordCount < 20) {
      toast.error(
        "Your response is too short. Please speak at least 20 words."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post("/topic-test/evaluate", {
        topicTestId: topicTest._id,
        gradeId,
        lessonNumber: parseInt(lessonNumber),
        spokenText: spokenText.trim(),
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
    return spokenText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
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

  // Browser not supported
  if (!browserSupported) {
    return (
      <ResponsiveLayout
        activePage={
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-red-50 rounded-xl p-8 text-center">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Browser Not Supported
              </h2>
              <p className="text-gray-600 mb-4">
                Your browser doesn't support speech recognition. Please use
                Chrome, Edge, or Safari.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go Back
              </button>
            </div>
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
              <div className="text-3xl font-bold text-gray-800">
                {getWordCount()}
              </div>
              <p className="text-sm text-gray-600 mt-1">Words Spoken</p>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="mb-8">
            <div className="flex justify-center gap-3">
              {!isRecording && !recordingStarted ? (
                <button
                  onClick={handleStart}
                  className="px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all transform hover:scale-105 flex items-center gap-3 shadow-lg"
                >
                  <FiMic className="text-2xl" />
                  <span className="font-semibold">Start Speaking</span>
                </button>
              ) : isRecording ? (
                <>
                  <button
                    onClick={handlePause}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 flex items-center gap-2"
                  >
                    {isPaused ? <FiMic /> : <FiMicOff />}
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    onClick={handleStop}
                    className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FiMicOff />
                    Stop Recording
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStart}
                    className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center gap-2"
                  >
                    <FiMic />
                    Record Again
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FiRefreshCw />
                    Reset
                  </button>
                </>
              )}
            </div>

            {isRecording && !isPaused && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="font-medium">Recording in progress...</span>
                </div>
              </div>
            )}
          </div>

          {/* Spoken Text Display */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Your Response:</h4>
              {spokenText && (
                <span className="text-sm text-gray-500">
                  {getWordCount()} words
                </span>
              )}
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[200px] bg-gray-50">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {spokenText || (
                  <span className="text-gray-400 italic">
                    Your spoken text will appear here as you speak...
                  </span>
                )}
              </p>
            </div>
            {getWordCount() > 0 && getWordCount() < 20 && (
              <p className="text-sm text-yellow-600 mt-2">
                ⚠️ Minimum 20 words required. Keep speaking!
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
              disabled={isSubmitting || !spokenText || getWordCount() < 20}
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

  return <ResponsiveLayout activePage={<PageContent />} activeTab="Grades" />;
};

export default TopicSpeaking;
