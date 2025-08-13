import React, { useState, useRef, useEffect } from "react";
import { FiPlay, FiPause, FiVolume2, FiCheck, FiAward } from "react-icons/fi";

const ListeningTest = ({
  testDetail,
  onNext,
  onBack,
  hasNext,
  onComplete,
  questionNumber = 1,
  totalQuestions = 1,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [testPhase, setTestPhase] = useState("ready"); // ready, listening, answering, completed
  const [playCount, setPlayCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const utteranceRef = useRef(null);

  useEffect(() => {
    // Initialize speech synthesis
    if ("speechSynthesis" in window) {
      utteranceRef.current = new SpeechSynthesisUtterance();
      utteranceRef.current.lang = "en-US";
      utteranceRef.current.rate = 0.8;
      utteranceRef.current.pitch = 1;
      utteranceRef.current.volume = 1;
    }

    return () => {
      // Cleanup
      if (utteranceRef.current && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Reset state when question changes
  useEffect(() => {
    resetQuestionState();
  }, [testDetail._id]);

  const resetQuestionState = () => {
    setUserAnswer("");
    setIsCompleted(false);
    setScore(null);
    setTestPhase("ready");
    setPlayCount(0);
    setShowResults(false);
    setIsPlaying(false);
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  };

  const playAudio = () => {
    if (!utteranceRef.current || playCount >= 1) return; // Only allow one play

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    utteranceRef.current.text = testDetail.text;

    utteranceRef.current.onstart = () => {
      setIsPlaying(true);
      setTestPhase("listening");
    };

    utteranceRef.current.onend = () => {
      setIsPlaying(false);
      setPlayCount(1); // Mark as played
      setTestPhase("answering");
    };

    utteranceRef.current.onerror = () => {
      setIsPlaying(false);
      setTestPhase("ready");
    };

    speechSynthesis.speak(utteranceRef.current);
  };

  const stopAudio = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      alert("Please write what you heard before submitting.");
      return;
    }

    const calculatedScore = calculateSimilarityScore(
      testDetail.text,
      userAnswer
    );
    setScore(calculatedScore);
    setTestPhase("completed");
    setIsCompleted(true);
    setShowResults(true);

    // Call onComplete callback if provided
    if (onComplete) {
      onComplete(testDetail._id, calculatedScore, userAnswer);
    }
  };

  const calculateSimilarityScore = (original, userInput) => {
    if (!userInput || !userInput.trim()) {
      return 0;
    }

    const originalWords = original
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const userWords = userInput
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);

    if (originalWords.length === 0) return 0;

    let exactMatches = 0;
    let partialMatches = 0;

    originalWords.forEach((originalWord) => {
      const exactMatch = userWords.find(
        (userWord) => userWord === originalWord
      );

      if (exactMatch) {
        exactMatches++;
      } else {
        const partialMatch = userWords.find((userWord) => {
          return (
            userWord.includes(originalWord) ||
            originalWord.includes(userWord) ||
            levenshteinDistance(originalWord, userWord) <= 2
          );
        });

        if (partialMatch) {
          partialMatches++;
        }
      }
    });

    const exactScore = (exactMatches / originalWords.length) * 100;
    const partialScore = (partialMatches / originalWords.length) * 30;
    const lengthRatio = userWords.length / originalWords.length;
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
    // Clean up any ongoing processes
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    // Call the onBack function to return to test selection
    onBack();
  };

  return (
    <>
      {/* Quit Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Are you sure you want to quit this test?
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Your progress will be lost and you'll return to the test
              selection.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowQuitModal(false)}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmQuit}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Yes, Quit
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
            </div>
            <button
              onClick={handleQuit}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Quit
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {testDetail.condition}
            </h2>

            {/* Instructions */}
            {testPhase === "ready" && (
              <div className="bg-blue-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                <div className="text-blue-800">
                  <h3 className="font-semibold mb-2">Instructions:</h3>
                  <ul className="text-sm space-y-1 text-left">
                    <li>• Click "Play Audio" to listen to the text</li>
                    <li>• You can only listen once, so pay attention!</li>
                    <li>• Write exactly what you hear in the text box</li>
                    <li>• Click submit when you're done</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Audio Controls */}
          {(testPhase === "ready" || testPhase === "listening") && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <button
                  onClick={isPlaying ? stopAudio : playAudio}
                  disabled={playCount >= 1 && !isPlaying}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                    playCount >= 1 && !isPlaying
                      ? "bg-gray-400 cursor-not-allowed"
                      : isPlaying
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
                  <span className="text-lg">
                    {isPlaying
                      ? "Stop Audio"
                      : playCount >= 1
                      ? "Audio Played"
                      : "Play Audio"}
                  </span>
                </button>
              </div>

              {testPhase === "listening" && isPlaying && (
                <div className="flex justify-center space-x-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-8 bg-blue-600 rounded-full animate-pulse"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                      }}
                    ></div>
                  ))}
                </div>
              )}

              {playCount >= 1 && testPhase !== "listening" && (
                <p className="text-sm text-gray-600">
                  Audio has been played. Now write what you heard below.
                </p>
              )}
            </div>
          )}

          {/* Answer Input */}
          {testPhase === "answering" && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-900 mb-3">
                  Write what you heard:
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type exactly what you heard..."
                  rows={4}
                  autoFocus
                />
              </div>

              <div className="text-center">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim()}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    userAnswer.trim()
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 cursor-not-allowed text-gray-500"
                  }`}
                >
                  Submit Answer
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="bg-green-50 rounded-xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Question completed!
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Original Text:
                  </h4>
                  <p className="text-gray-700 bg-white p-4 rounded-lg border">
                    {testDetail.text}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Your Answer:
                  </h4>
                  <p className="text-gray-700 bg-white p-4 rounded-lg border">
                    {userAnswer || "No answer provided"}
                  </p>
                </div>
              </div>

              {score !== null && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center space-x-3 bg-white rounded-xl p-4 border">
                    <span className="text-3xl text-blue-500">
                      <FiAward />
                    </span>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {score}/100
                      </div>
                      <div className="text-sm text-gray-600">
                        Listening Score
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  {hasNext ? "Next Question" : "Complete Test"}
                </button>
              </div>
            </div>
          )}

          {/* Start Test */}
          {testPhase === "ready" && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Click the button above to start this listening question.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ListeningTest;
