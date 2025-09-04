import axios from "../service/api";
import React, { useState, useEffect } from "react";
import {
  FiBook,
  FiHeadphones,
  FiMic,
  FiPlay,
  FiCheck,
  FiClock,
  FiAward,
  FiArrowRight,
  FiArrowLeft,
  FiHome,
} from "react-icons/fi";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import SpeechTest from "../components/SpeechTest";
import ListeningTest from "../components/ListeningTest";

const MockTest = () => {
  const [mockTest, setMockTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testPhase, setTestPhase] = useState("loading"); // loading, overview, testing, completed
  const [testResults, setTestResults] = useState([]);
  const [testStartTime, setTestStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { gradeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchMockTest();
  }, [gradeId]);

  const fetchMockTest = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/mock-test/grade/${gradeId}`);

      if (data.status === "success" && data.data) {
        setMockTest(data.data);
        setTestPhase("overview");
      } else {
        toast.error("Mock test not found for this grade");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching mock test:", error);
      toast.error("Failed to load mock test");
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const startMockTest = () => {
    if (!mockTest || !mockTest.questions || mockTest.questions.length === 0) {
      toast.error("No questions available in this mock test");
      return;
    }

    setTestPhase("testing");
    setTestStartTime(Date.now());
    setCurrentQuestionIndex(0);
    setTestResults([]);
  };

  const handleQuestionComplete = (questionId, score, userAnswer) => {
    const currentQuestion = mockTest.questions[currentQuestionIndex];

    const result = {
      questionId: currentQuestion.testDetailId._id,
      lessonNumber: currentQuestion.lessonNumber,
      questionType: currentQuestion.questionType,
      userAnswer: userAnswer || "",
      correctAnswer: currentQuestion.testDetailId.text || "",
      isCorrect: score >= 70,
      score: Math.round(score),
      timeSpent: Math.round((Date.now() - testStartTime) / 1000),
    };

    // Update results array
    setTestResults((prev) => {
      const filtered = prev.filter((r) => r.questionId !== questionId);
      return [...filtered, result];
    });

    // Auto-proceed to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < mockTest.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        completeMockTest();
      }
    }, 500);
  };

  const handleNext = () => {
    if (currentQuestionIndex < mockTest.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      completeMockTest();
    }
  };

  const handleQuitTest = () => {
    if (
      window.confirm(
        "Are you sure you want to quit the test? Your progress will be lost."
      )
    ) {
      navigate(-1);
    }
  };

  const completeMockTest = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const totalTimeSpent = Math.round((Date.now() - testStartTime) / 1000);

      // Submit results to backend
      const { data } = await axios.post("/mock-test/submit", {
        mockTestId: mockTest._id,
        answers: testResults,
        totalTimeSpent,
      });

      if (data.status === "success") {
        toast.success("Mock test completed successfully!");

        // Navigate to result page
        navigate(`/mock-test/result/${data.data._id}`, {
          state: { resultData: data.data },
        });
      }
    } catch (error) {
      console.error("Error submitting mock test:", error);
      toast.error("Failed to submit test results");

      // Show local results even if submission fails
      setTestPhase("completed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // No mock test found
  if (!mockTest) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Mock Test Available
            </h2>
            <p className="text-gray-600 mb-6">
              Mock test for this grade hasn't been created yet.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test Overview Screen
  if (testPhase === "overview") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{mockTest.title}</h1>
            <p className="text-blue-100">
              {mockTest.description ||
                "Complete assessment covering all lessons"}
            </p>
          </div>

          {/* Test Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiBook className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {mockTest.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiClock className="text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {mockTest.timeLimit}
                    </div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiAward className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {mockTest.passingScore}%
                    </div>
                    <div className="text-sm text-gray-600">Pass Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Structure */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Test Structure
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FiMic className="text-blue-600" />
                  <span className="text-gray-700">
                    {
                      mockTest.questions.filter(
                        (q) => q.questionType === "speech"
                      ).length
                    }{" "}
                    Speaking Questions
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiHeadphones className="text-purple-600" />
                  <span className="text-gray-700">
                    {
                      mockTest.questions.filter(
                        (q) => q.questionType === "listening"
                      ).length
                    }{" "}
                    Listening Questions
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-2">
                Important Instructions:
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>
                  • Ensure you have a working microphone for speaking tests
                </li>
                <li>• Find a quiet place to complete the test</li>
                <li>• You cannot pause once the test begins</li>
                <li>• Each question will be evaluated automatically</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Lessons
              </button>
              <button
                onClick={startMockTest}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Start Mock Test
                <FiArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Testing Phase - Show actual test components
  if (testPhase === "testing" && mockTest.questions[currentQuestionIndex]) {
    const currentQuestion = mockTest.questions[currentQuestionIndex];
    const testDetail = currentQuestion.testDetailId;

    // Prepare test detail data
    const testDetailData = {
      _id: testDetail._id,
      condition: testDetail.condition,
      text: testDetail.text,
      lessonNumber: currentQuestion.lessonNumber,
      lessonTitle:
        currentQuestion.lessonId?.title ||
        `Lesson ${currentQuestion.lessonNumber}`,
    };

    // Choose component based on question type
    const TestComponent =
      currentQuestion.questionType === "listening" ? ListeningTest : SpeechTest;

    return (
      <div className="min-h-screen bg-gray-50 py-6">
        {/* Progress Header */}
        <div className="max-w-4xl mx-auto px-6 mb-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Mock Test Progress
                </span>
                <span className="text-sm text-gray-500">
                  {currentQuestion.lessonId?.title ||
                    `Lesson ${currentQuestion.lessonNumber}`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {currentQuestion.questionType === "listening" ? (
                  <FiHeadphones className="text-purple-600" />
                ) : (
                  <FiMic className="text-blue-600" />
                )}
                <span className="text-sm capitalize">
                  {currentQuestion.questionType}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / mockTest.questions.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Test Component */}
        <TestComponent
          testDetail={testDetailData}
          onNext={handleNext}
          onBack={handleQuitTest}
          hasNext={currentQuestionIndex < mockTest.questions.length - 1}
          onComplete={handleQuestionComplete}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={mockTest.questions.length}
        />
      </div>
    );
  }

  // Submitting state
  if (isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900">
            Submitting your test results...
          </h3>
        </div>
      </div>
    );
  }

  // Local Completed Screen (fallback if submission fails)
  if (testPhase === "completed") {
    const totalScore =
      testResults.length > 0
        ? Math.round(
            testResults.reduce((sum, r) => sum + r.score, 0) /
              testResults.length
          )
        : 0;
    const passed = totalScore >= mockTest.passingScore;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div
            className={`p-8 text-white ${
              passed
                ? "bg-gradient-to-r from-green-600 to-emerald-600"
                : "bg-gradient-to-r from-red-600 to-orange-600"
            }`}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAward
                  className={`text-3xl ${
                    passed ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
              <h1 className="text-3xl font-bold mb-2">Mock Test Completed!</h1>
              <p className="text-xl">
                {passed ? "Congratulations! You passed!" : "Keep practicing!"}
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="text-3xl font-bold text-gray-900">
                {totalScore}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() =>
                  navigate(`/grade/${gradeId}`, {
                    state: location.state,
                  })
                }
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Lessons
              </button>
              <button
                onClick={() => {
                  setTestPhase("overview");
                  setTestResults([]);
                  setCurrentQuestionIndex(0);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Retake Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MockTest;
