import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TestService from "../service/test.service";
import TestResultService from "../service/testresult.service";
import SpeechTest from "../components/SpeechTest";
import ListeningTest from "../components/ListeningTest";
import ResponsiveLayout from "../components/Layout";
import { toast } from "react-hot-toast";
import {
  FiBookOpen,
  FiCamera,
  FiMessageSquare,
  FiMic,
  FiPaperclip,
  FiHeadphones,
  FiCheck,
  FiAward,
  FiTrendingUp,
  FiClock,
  FiStar,
} from "react-icons/fi";

const LessonTests = () => {
  const { lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Test data states
  const [speechTests, setSpeechTests] = useState([]);
  const [listeningTests, setListeningTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Test history states
  const [testHistory, setTestHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Test execution states
  const [activeTestType, setActiveTestType] = useState(null); // 'speech' or 'listening'
  const [currentTestDetails, setCurrentTestDetails] = useState([]);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [testResults, setTestResults] = useState([]);
  const [testStartTime, setTestStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test completion states
  const [completedTests, setCompletedTests] = useState({
    speech: false,
    listening: false,
  });
  const [finalResults, setFinalResults] = useState({
    speech: null,
    listening: null,
  });

  const lesson = location.state?.lesson;
  const grade = location.state?.grade;

  useEffect(() => {
    if (lessonId) {
      fetchTests();
      fetchTestHistory();
    }
  }, [lessonId]);

  const fetchTests = async () => {
    try {
      const response = await TestService.getAllTests();
      if (response.status === "success") {
        // Filter tests by lesson and separate by type
        const lessonTests = response.data.filter(
          (test) => test.lessonId === lessonId
        );

        const speech = lessonTests.filter(
          (test) => !test.type || test.type === "speech"
        );
        const listening = lessonTests.filter(
          (test) => test.type === "listening"
        );

        setSpeechTests(speech);
        setListeningTests(listening);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await TestResultService.getMyResults({
        lessonId: lessonId,
        limit: 100, // Get all results for this lesson
      });

      if (response.status === "success") {
        setTestHistory(response.data.results);
      }
    } catch (error) {
      console.error("Error fetching test history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchTestDetails = async (tests) => {
    try {
      let allDetails = [];

      for (const test of tests) {
        const response = await TestService.getTestById(test._id);
        if (response.status === "success" && response.data.testItems) {
          // Add test metadata to each detail
          const detailsWithMeta = response.data.testItems.map((item) => ({
            ...item,
            testId: test._id,
            testTitle: test.title,
            testCategory: test.category,
          }));
          allDetails = [...allDetails, ...detailsWithMeta];
        }
      }

      return allDetails;
    } catch (error) {
      console.error("Error fetching test details:", error);
      return [];
    }
  };

  // Get test statistics for a specific test type
  const getTestTypeStats = (testType) => {
    const tests = testType === "speech" ? speechTests : listeningTests;
    const testIds = tests.map((t) => t._id);

    // Filter history for this test type
    const typeHistory = testHistory.filter((result) =>
      testIds.includes(result.testId)
    );

    if (typeHistory.length === 0) {
      return {
        hasHistory: false,
        lastScore: 0,
        bestScore: 0,
        totalAttempts: 0,
        lastAttemptDate: null,
        averageScore: 0,
        improvement: 0,
      };
    }

    // Sort by date to get latest
    const sortedHistory = typeHistory.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const lastResult = sortedHistory[0];
    const bestScore = Math.max(...typeHistory.map((r) => r.score));
    const averageScore = Math.round(
      typeHistory.reduce((sum, r) => sum + r.score, 0) / typeHistory.length
    );

    // Calculate improvement (compare first vs recent attempts)
    const improvement =
      typeHistory.length > 1
        ? lastResult.score - typeHistory[typeHistory.length - 1].score
        : 0;

    return {
      hasHistory: true,
      lastScore: lastResult.score,
      bestScore,
      totalAttempts: typeHistory.length,
      lastAttemptDate: lastResult.createdAt,
      averageScore,
      improvement,
      timeSpent: typeHistory.reduce((sum, r) => sum + (r.timeTaken || 0), 0),
    };
  };

  const startTestType = async (testType) => {
    const tests = testType === "speech" ? speechTests : listeningTests;

    if (tests.length === 0) {
      toast.error("No tests available for this type");
      return;
    }

    setActiveTestType(testType);
    setTestStartTime(Date.now());
    setCurrentDetailIndex(0);
    setTestResults([]);

    const details = await fetchTestDetails(tests);
    setCurrentTestDetails(details);
  };

  const handleQuestionComplete = (questionId, score, userAnswer) => {
    const currentDetail = currentTestDetails[currentDetailIndex];

    const result = {
      questionId,
      testId: currentDetail.testId,
      userAnswer,
      correctAnswer: currentDetail.text || "",
      isCorrect: score >= 70,
      score: Math.round(score),
      testTitle: currentDetail.testTitle,
      category: currentDetail.testCategory,
    };

    setTestResults((prev) => {
      const filtered = prev.filter((r) => r.questionId !== questionId);
      return [...filtered, result];
    });
  };

  const handleNextQuestion = () => {
    if (currentDetailIndex < currentTestDetails.length - 1) {
      setCurrentDetailIndex(currentDetailIndex + 1);
    } else {
      // Test type completed
      completeTestType();
    }
  };

  const handleBackToTests = () => {
    navigate(`/grade/${grade?._id}`, { state: { grade } });
  };

  const handleQuitTest = () => {
    setActiveTestType(null);
    setCurrentTestDetails([]);
    setCurrentDetailIndex(0);
    setTestResults([]);
    setTestStartTime(null);
  };

  const completeTestType = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Group results by test
      const testGroups = {};
      testResults.forEach((result) => {
        if (!testGroups[result.testId]) {
          testGroups[result.testId] = [];
        }
        testGroups[result.testId].push(result);
      });

      let overallScore = 0;
      let totalQuestions = testResults.length;
      let correctAnswers = testResults.filter((r) => r.isCorrect).length;

      // Submit results for each test
      for (const [testId, results] of Object.entries(testGroups)) {
        const testScore =
          results.reduce((sum, r) => sum + r.score, 0) / results.length;
        const timeTaken = testStartTime
          ? Math.round((Date.now() - testStartTime) / 1000)
          : 0;

        await TestResultService.submitTestResult({
          testId,
          lessonId: lesson._id,
          gradeId: grade._id,
          score: testScore,
          totalQuestions: results.length,
          correctAnswers: results.filter((r) => r.isCorrect).length,
          timeTaken,
          answers: results,
          feedback: generateFeedback(
            testScore,
            results.filter((r) => r.isCorrect).length,
            results.length
          ),
        });
      }

      // Calculate overall score for this test type
      overallScore =
        testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length;

      // Mark test type as completed
      setCompletedTests((prev) => ({
        ...prev,
        [activeTestType]: true,
      }));

      setFinalResults((prev) => ({
        ...prev,
        [activeTestType]: {
          score: Math.round(overallScore),
          correctAnswers,
          totalQuestions,
          timeTaken: testStartTime
            ? Math.round((Date.now() - testStartTime) / 1000)
            : 0,
        },
      }));

      // Reset test execution states
      setActiveTestType(null);
      setCurrentTestDetails([]);
      setCurrentDetailIndex(0);
      setTestResults([]);

      // Refresh test history to show new results
      await fetchTestHistory();

      toast.success(
        `${
          activeTestType === "speech" ? "Speech" : "Listening"
        } test completed! Score: ${Math.round(overallScore)}%`
      );
    } catch (error) {
      console.error("Error submitting test results:", error);
      toast.error("Failed to submit test results");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateFeedback = (score, correct, total) => {
    if (score >= 90) {
      return "Excellent work! You have mastered this material.";
    } else if (score >= 80) {
      return "Very good! You're doing great with minor areas to improve.";
    } else if (score >= 70) {
      return "Good job! Keep practicing to improve further.";
    } else if (score >= 60) {
      return "You're making progress. Focus on areas that need improvement.";
    } else {
      return "Keep practicing! Every attempt helps you learn and improve.";
    }
  };

  const resetTestType = (testType) => {
    setCompletedTests((prev) => ({
      ...prev,
      [testType]: false,
    }));
    setFinalResults((prev) => ({
      ...prev,
      [testType]: null,
    }));
  };

  // Show individual question
  if (activeTestType && currentTestDetails[currentDetailIndex]) {
    const TestComponent =
      activeTestType === "speech" ? SpeechTest : ListeningTest;

    return (
      <TestComponent
        testDetail={currentTestDetails[currentDetailIndex]}
        onNext={handleNextQuestion}
        onBack={handleQuitTest}
        hasNext={currentDetailIndex < currentTestDetails.length - 1}
        onComplete={handleQuestionComplete}
        questionNumber={currentDetailIndex + 1}
        totalQuestions={currentTestDetails.length}
      />
    );
  }

  // Show tests overview page
  return (
    <ResponsiveLayout
      activePage={<LessonTestsContent />}
      activeTab="Dashboard"
    />
  );

  function LessonTestsContent() {
    if (isLoading || isLoadingHistory) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    const speechStats = getTestTypeStats("speech");
    const listeningStats = getTestTypeStats("listening");

    return (
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToTests}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Lessons
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {lesson?.title || "Lesson"} - Tests
          </h1>
          <p className="text-lg text-gray-600">
            {grade?.name} - Lesson {lesson?.orderNumber}
          </p>
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <FiMic /> {speechTests.length} Speech Tests
            </span>
            <span className="flex items-center gap-2">
              <FiHeadphones /> {listeningTests.length} Listening Tests
            </span>
            <span className="flex items-center gap-2">
              <FiAward /> {testHistory.length} Total Attempts
            </span>
          </div>
        </div>

        {/* Test Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Speech Test Card */}
          <TestTypeCard
            type="speech"
            title="Speech Tests"
            description="Practice speaking by reading texts aloud and get scored on pronunciation accuracy"
            icon={<FiMic size={32} />}
            color="bg-blue-500"
            testCount={speechTests.length}
            isCompleted={completedTests.speech}
            result={finalResults.speech}
            stats={speechStats}
            onStart={() => startTestType("speech")}
            onReset={() => resetTestType("speech")}
            disabled={speechTests.length === 0}
          />

          {/* Listening Test Card */}
          <TestTypeCard
            type="listening"
            title="Listening Tests"
            description="Listen to audio and write what you hear to test your listening comprehension"
            icon={<FiHeadphones size={32} />}
            color="bg-purple-500"
            testCount={listeningTests.length}
            isCompleted={completedTests.listening}
            result={finalResults.listening}
            stats={listeningStats}
            onStart={() => startTestType("listening")}
            onReset={() => resetTestType("listening")}
            disabled={listeningTests.length === 0}
          />
        </div>

        {/* Overall Progress */}
        {(completedTests.speech || completedTests.listening) && (
          <div className="mt-12 bg-green-50 rounded-xl p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <FiAward className="text-white text-2xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                Great Job!
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {completedTests.speech && finalResults.speech && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <FiMic className="text-blue-500 text-xl mr-2" />
                      <span className="font-semibold">Speech Test</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {finalResults.speech.score}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {finalResults.speech.correctAnswers}/
                      {finalResults.speech.totalQuestions} correct
                    </div>
                  </div>
                )}

                {completedTests.listening && finalResults.listening && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <FiHeadphones className="text-purple-500 text-xl mr-2" />
                      <span className="font-semibold">Listening Test</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {finalResults.listening.score}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {finalResults.listening.correctAnswers}/
                      {finalResults.listening.totalQuestions} correct
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate("/results")}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-4"
                >
                  View Detailed Results
                </button>
                <button
                  onClick={handleBackToTests}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Tests Available */}
        {speechTests.length === 0 && listeningTests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tests available
            </h3>
            <p className="text-gray-600 mb-4">
              Tests for this lesson haven't been created yet.
            </p>
            <p className="text-sm text-blue-600">
              Please contact your teacher to add tests to this lesson.
            </p>
          </div>
        )}
      </div>
    );
  }
};

// Enhanced Test Type Card Component with Statistics
const TestTypeCard = ({
  type,
  title,
  description,
  icon,
  color,
  testCount,
  isCompleted,
  result,
  stats,
  onStart,
  onReset,
  disabled,
}) => {
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getImprovementDisplay = (improvement) => {
    if (improvement > 0) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <FiTrendingUp className="mr-1" size={12} />+{improvement}% improved
        </div>
      );
    } else if (improvement < 0) {
      return (
        <div className="flex items-center text-red-500 text-sm">
          <span className="mr-1">↓</span>
          {Math.abs(improvement)}% decreased
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-2 p-8 transition-all duration-300 ${
        disabled
          ? "border-gray-200 opacity-60"
          : stats.hasHistory || isCompleted
          ? "border-green-200 bg-gradient-to-br from-white to-green-50"
          : "border-gray-200 hover:border-blue-300 hover:shadow-lg"
      }`}
    >
      <div className="text-center">
        {/* Icon and Status */}
        <div className="relative inline-block mb-6">
          <div
            className={`w-20 h-20 ${
              disabled ? "bg-gray-400" : color
            } rounded-full flex items-center justify-center text-white transition-colors relative`}
          >
            {icon}
            {stats.hasHistory && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <FiStar className="text-white text-xs" />
              </div>
            )}
          </div>
          {isCompleted && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <FiCheck className="text-white text-sm" />
            </div>
          )}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {description}
        </p>

        {/* Test Info */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
            <span>
              {testCount} {testCount === 1 ? "test" : "tests"}
            </span>
            {stats.hasHistory && (
              <>
                <span>•</span>
                <span>{stats.totalAttempts} attempts</span>
              </>
            )}
          </div>

          {/* Statistics Display */}
          {stats.hasHistory && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div
                    className={`text-xl font-bold ${getScoreColor(
                      stats.lastScore
                    )}`}
                  >
                    {stats.lastScore}%
                  </div>
                  <div className="text-xs text-gray-500">Last Score</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {stats.bestScore}%
                  </div>
                  <div className="text-xs text-gray-500">Best Score</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Average: {stats.averageScore}%
                  </span>
                  {getImprovementDisplay(stats.improvement)}
                </div>

                {stats.lastAttemptDate && (
                  <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                    <FiClock className="mr-1" size={12} />
                    Last attempt:{" "}
                    {new Date(stats.lastAttemptDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Session Results Display */}
          {isCompleted && result && (
            <div className="bg-green-100 rounded-lg p-4 border border-green-200 mb-4">
              <div className="text-sm text-green-800 mb-2 font-medium">
                Recent Session:
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-xl font-bold text-green-600">
                    {result.score}%
                  </div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-lg font-semibold text-gray-900">
                    {result.correctAnswers}/{result.totalQuestions}
                  </div>
                  <div className="text-xs text-gray-500">Correct</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round(result.timeTaken / 60)}m
                  </div>
                  <div className="text-xs text-gray-500">Time</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isCompleted ? (
            <button
              onClick={onStart}
              disabled={disabled}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                disabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : `${color} hover:opacity-90 text-white`
              }`}
            >
              {disabled
                ? "No Tests Available"
                : stats.hasHistory
                ? `Retake ${title}`
                : `Start ${title}`}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center text-green-600 font-medium mb-2">
                <FiCheck className="mr-2" />
                Session Completed!
              </div>
              <button
                onClick={onReset}
                className="w-full py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonTests;
