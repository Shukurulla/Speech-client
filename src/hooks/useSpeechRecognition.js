// src/hooks/useSpeechRecognition.js
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

const useSpeechRecognition = (options = {}) => {
  const {
    continuous = true,
    interimResults = true,
    language = "en-US",
    maxAlternatives = 3,
    onTranscript = () => {},
    onError = () => {},
    autoRestart = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [confidence, setConfidence] = useState(0);

  const recognitionRef = useRef(null);
  const isRestartingRef = useRef(false);
  const shouldListenRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const restartTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // Check browser support
  useEffect(() => {
    // Check for all possible implementations
    const hasSpeechRecognition = !!(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition
    );

    setIsSupported(hasSpeechRecognition);

    if (!hasSpeechRecognition) {
      console.error("Speech Recognition API not found. Browser info:", {
        userAgent: navigator.userAgent,
        SpeechRecognition: typeof window.SpeechRecognition,
        webkitSpeechRecognition: typeof window.webkitSpeechRecognition,
      });

      // Don't show error toast immediately, let component handle it
      setError(
        "Speech recognition is not supported. Please use Chrome, Edge, or Safari."
      );
    } else {
      console.log("✅ Speech Recognition API detected");
    }
  }, []);

  // Initialize recognition
  useEffect(() => {
    if (!isSupported) {
      console.warn("Speech Recognition not supported, skipping initialization");
      return;
    }

    // Get the correct SpeechRecognition constructor
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition constructor not found");
      return;
    }

    try {
      const recognition = new SpeechRecognition();

      // Configure recognition
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = maxAlternatives;

      console.log("Speech Recognition initialized with config:", {
        continuous,
        interimResults,
        language,
        maxAlternatives,
      });

      // Event handlers
      recognition.onstart = () => {
        console.log("🎤 Speech recognition started");
        setIsListening(true);
        setError(null);
        clearTimeout(restartTimeoutRef.current);

        // Start silence detection
        resetSilenceTimer();
      };

      recognition.onresult = (event) => {
        let interimText = "";
        let finalText = finalTranscriptRef.current;
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;
          const currentConfidence = result[0].confidence || 0.9;

          maxConfidence = Math.max(maxConfidence, currentConfidence);

          if (result.isFinal) {
            finalText += transcriptText + " ";
            console.log(
              `✅ Final: "${transcriptText}" (confidence: ${(
                currentConfidence * 100
              ).toFixed(1)}%)`
            );
          } else {
            interimText += transcriptText;
          }
        }

        // Update states
        finalTranscriptRef.current = finalText;
        setTranscript(finalText);
        setInterimTranscript(interimText);
        setConfidence(maxConfidence);

        // Callback with full text
        onTranscript(finalText + interimText, finalText, interimText);

        // Reset silence timer on speech
        resetSilenceTimer();
      };

      recognition.onerror = (event) => {
        console.error("❌ Speech recognition error:", event.error);

        const errorMessages = {
          "no-speech": "No speech detected. Please speak clearly.",
          "audio-capture":
            "Microphone not found. Please check your microphone.",
          "not-allowed":
            "Microphone permission denied. Please allow microphone access.",
          network: "Network error. Please check your internet connection.",
          aborted: "Speech recognition aborted.",
          "language-not-supported": `Language ${language} is not supported.`,
          "service-not-allowed":
            "Speech service not allowed. Please check browser permissions.",
        };

        const errorMessage =
          errorMessages[event.error] ||
          `Speech recognition error: ${event.error}`;
        setError(errorMessage);
        onError(event.error, errorMessage);

        // Handle specific errors
        if (event.error === "no-speech") {
          if (shouldListenRef.current && autoRestart) {
            console.log("🔄 Restarting after no-speech...");
            restartRecognition();
          }
        } else if (
          event.error === "audio-capture" ||
          event.error === "not-allowed"
        ) {
          setIsListening(false);
          shouldListenRef.current = false;
          toast.error(errorMessage);
        } else if (event.error === "network") {
          if (shouldListenRef.current && autoRestart) {
            console.log("🔄 Retrying after network error...");
            setTimeout(() => restartRecognition(), 2000);
          }
        }
      };

      recognition.onend = () => {
        console.log("🔚 Speech recognition ended");
        setIsListening(false);
        clearTimeout(silenceTimeoutRef.current);

        // Auto-restart if needed
        if (
          shouldListenRef.current &&
          autoRestart &&
          !isRestartingRef.current
        ) {
          console.log("🔄 Auto-restarting recognition...");
          restartRecognition();
        }
      };

      recognition.onaudiostart = () => {
        console.log("🔊 Audio capture started");
      };

      recognition.onaudioend = () => {
        console.log("🔇 Audio capture ended");
      };

      recognition.onspeechstart = () => {
        console.log("💬 Speech detected");
        resetSilenceTimer();
      };

      recognition.onspeechend = () => {
        console.log("🤐 Speech ended");
      };

      recognition.onnomatch = () => {
        console.log("❓ No match found");
      };

      recognitionRef.current = recognition;

      console.log("✅ Speech Recognition setup complete");
    } catch (error) {
      console.error("Failed to initialize Speech Recognition:", error);
      setIsSupported(false);
      setError("Failed to initialize speech recognition");
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        shouldListenRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Cleanup stop error:", e);
        }
        clearTimeout(restartTimeoutRef.current);
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [
    isSupported,
    continuous,
    interimResults,
    language,
    maxAlternatives,
    autoRestart,
    onTranscript,
    onError,
  ]);

  // Silence detection timer
  const resetSilenceTimer = useCallback(() => {
    clearTimeout(silenceTimeoutRef.current);

    // Restart after 3 seconds of silence
    silenceTimeoutRef.current = setTimeout(() => {
      if (shouldListenRef.current && autoRestart) {
        console.log("🔄 Restarting after silence...");
        restartRecognition();
      }
    }, 3000);
  }, [autoRestart]);

  // Restart recognition with debouncing
  const restartRecognition = useCallback(() => {
    if (isRestartingRef.current || !recognitionRef.current) return;

    isRestartingRef.current = true;
    clearTimeout(restartTimeoutRef.current);

    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.log("Stop error during restart:", e);
    }

    restartTimeoutRef.current = setTimeout(() => {
      if (shouldListenRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log("✅ Recognition restarted");
        } catch (e) {
          console.error("Start error during restart:", e);
          if (e.message.includes("already started")) {
            try {
              recognitionRef.current.stop();
              setTimeout(() => {
                recognitionRef.current.start();
              }, 100);
            } catch (restartError) {
              console.error("Restart recovery failed:", restartError);
            }
          }
        }
      }
      isRestartingRef.current = false;
    }, 250);
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported) {
      console.warn("Speech recognition not supported, cannot start");
      return false;
    }

    if (!recognitionRef.current) {
      console.error("Speech recognition not initialized");

      // Try to initialize it one more time
      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        window.mozSpeechRecognition ||
        window.msSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = continuous;
          recognition.interimResults = interimResults;
          recognition.lang = language;
          recognition.maxAlternatives = maxAlternatives;
          recognitionRef.current = recognition;
          console.log("Speech Recognition re-initialized on demand");
        } catch (err) {
          console.error("Failed to re-initialize:", err);
          return false;
        }
      } else {
        return false;
      }
    }

    // Request microphone permission first
    try {
      console.log("Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      console.log("✅ Microphone permission granted");
      stream.getTracks().forEach((track) => track.stop()); // Stop the test stream
    } catch (err) {
      console.error("❌ Microphone permission error:", err);
      toast.error(
        "Microphone permission denied. Please allow microphone access."
      );
      setError("Microphone permission denied");
      return false;
    }

    // Reset states
    setTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    setError(null);
    shouldListenRef.current = true;
    isRestartingRef.current = false;

    try {
      console.log("Starting speech recognition...");
      recognitionRef.current.start();
      console.log("✅ Speech recognition start command sent");
      return true;
    } catch (err) {
      console.error("❌ Failed to start recognition:", err);

      if (err.message && err.message.includes("already started")) {
        console.log("Recognition already started, stopping and restarting...");
        // If already started, stop and restart
        try {
          recognitionRef.current.stop();
          await new Promise((resolve) => setTimeout(resolve, 200));
          recognitionRef.current.start();
          console.log("✅ Recognition restarted successfully");
          return true;
        } catch (restartErr) {
          console.error("❌ Failed to restart:", restartErr);
          toast.error("Failed to start speech recognition");
          return false;
        }
      } else {
        toast.error("Failed to start speech recognition: " + err.message);
        return false;
      }
    }
  }, [isSupported, continuous, interimResults, language, maxAlternatives]);

  // Stop listening
  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    isRestartingRef.current = false;
    clearTimeout(restartTimeoutRef.current);
    clearTimeout(silenceTimeoutRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("🛑 Stopped speech recognition");
      } catch (err) {
        console.log("Stop error:", err);
      }
    }

    // Keep the interim transcript in final
    if (interimTranscript) {
      const finalText = finalTranscriptRef.current + " " + interimTranscript;
      setTranscript(finalText.trim());
      finalTranscriptRef.current = finalText.trim();
      setInterimTranscript("");
    }
  }, [interimTranscript]);

  // Reset/clear transcript
  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    setError(null);
    setConfidence(0);
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    // States
    transcript,
    interimTranscript,
    fullTranscript:
      transcript + (interimTranscript ? " " + interimTranscript : ""),
    isListening,
    isSupported,
    error,
    confidence,

    // Actions
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,

    // Utils
    hasTranscript: transcript.length > 0 || interimTranscript.length > 0,
    wordCount: (transcript + " " + interimTranscript)
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length,
  };
};

export default useSpeechRecognition;
