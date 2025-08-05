import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TestService from "../service/test.service";
import TestResultService from "../service/testresult.service";
import SpeechTest from "../components/SpeechTest";
import ResponsiveLayout from "../components/Layout";

const TestQuestions = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [testDetails, setTestDetails] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionsList, setShowQuestionsList] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [testStartTime, setTestStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const test = location.state?.test;
  const lesson = location.state?.lesson;
  const grade = location.state?.grade;

  useEffect(() => {
    if (testId) {
      fetchTestDetails();
      setTestStartTime(Date.now());
    }
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      const response = await TestService.getTestById(testId);
      if (response.status === "success") {
        setTestDetails(response.data.testItems);
      }
    } catch (error) {
      console.error("Error fetching test details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
    setShowQuestionsList(false);
  };

  const handleBackToQuestions = () => {
    setShowQuestionsList(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testDetails.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Test completed, submit results
      submitTestResults();
    }
  };

  const handleQuestionComplete = (questionId, score, userAnswer) => {
    // Store individual question result
    const result = {
      questionId,
      userAnswer,
      correctAnswer: testDetails.find((q) => q._id === questionId)?.text || "",
      isCorrect: score >= 70, // Consider 70+ as correct
      score: Math.round(score),
    };

    setTestResults((prev) => {
      const filtered = prev.filter((r) => r.questionId !== questionId);
      return [...filtered, result];
    });
  };

  const submitTestResults = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Calculate test metrics
      const totalQuestions = testDetails.length;
      const correctAnswers = testResults.filter((r) => r.isCorrect).length;
      const totalScore = testResults.reduce(
        (sum, result) => sum + result.score,
        0
      );
      const averageScore =
        testResults.length > 0 ? totalScore / testResults.length : 0;
      const timeTaken = testStartTime
        ? Math.round((Date.now() - testStartTime) / 1000)
        : 0;

      // Prepare test result data
      const testResultData = {
        testId,
        lessonId: lesson._id,
        gradeId: grade._id,
        score: averageScore,
        totalQuestions,
        correctAnswers,
        timeTaken,
        answers: testResults,
        feedback: generateFeedback(
          averageScore,
          correctAnswers,
          totalQuestions
        ),
      };

      // Submit to backend
      await TestResultService.submitTestResult(testResultData);

      // Navigate back to tests list with success message
      navigate(`/lesson/${lesson._id}/tests`, {
        state: {
          lesson,
          grade,
          completed: true,
          score: Math.round(averageScore),
          correctAnswers,
          totalQuestions,
        },
      });
    } catch (error) {
      console.error("Error submitting test results:", error);
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

  const handleBackToTests = () => {
    navigate(`/lesson/${lesson._id}/tests`, {
      state: { lesson, grade },
    });
  };

  // Show individual question
  if (!showQuestionsList && testDetails[currentQuestionIndex]) {
    return (
      <SpeechTest
        testDetail={testDetails[currentQuestionIndex]}
        onNext={handleNextQuestion}
        onBack={handleBackToQuestions}
        hasNext={currentQuestionIndex < testDetails.length - 1}
        onComplete={handleQuestionComplete}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={testDetails.length}
      />
    );
  }

  // Show questions list
  return (
    <ResponsiveLayout
      activePage={<TestQuestionsContent />}
      activeTab="Dashboard"
    />
  );

  function TestQuestionsContent() {
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
          Back to Tests
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {test?.title || "Test Questions"}
          </h1>
          <p className="text-lg text-gray-600">
            {grade?.name} - {lesson?.title}
          </p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>📝 {testDetails.length} Questions</span>
            <span>📂 {test?.category?.title}</span>
            {test?.difficulty && (
              <span className="capitalize">🔥 {test.difficulty}</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {testResults.length > 0 && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm text-gray-500">
                {testResults.length} of {testDetails.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(testResults.length / testDetails.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Questions Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : testDetails.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testDetails.map((detail, index) => (
              <QuestionCard
                key={detail._id}
                question={detail}
                index={index + 1}
                onSelect={() => handleQuestionSelect(index)}
                isCompleted={testResults.some(
                  (r) => r.questionId === detail._id
                )}
                result={testResults.find((r) => r.questionId === detail._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">❓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No questions available
            </h3>
            <p className="text-gray-600">
              Questions for this test haven't been created yet.
            </p>
          </div>
        )}

        {/* Complete Test Button */}
        {testResults.length === testDetails.length &&
          testDetails.length > 0 && (
            <div className="mt-8 text-center">
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  All questions completed!
                </h3>
                <p className="text-green-600 mb-4">
                  You've answered all {testDetails.length} questions. Click
                  below to submit your test and see your results.
                </p>
                <button
                  onClick={submitTestResults}
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Test"
                  )}
                </button>
              </div>
            </div>
          )}
      </div>
    );
  }
};

const QuestionCard = ({ question, index, onSelect, isCompleted, result }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group relative ${
        isCompleted ? "ring-2 ring-green-500" : ""
      }`}
    >
      {isCompleted && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {result && (
            <div
              className={`mt-1 px-2 py-1 rounded text-xs font-medium ${getScoreColor(
                result.score
              )}`}
            >
              {result.score}%
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold group-hover:bg-blue-100 transition-colors ${
            isCompleted
              ? "bg-green-100 text-green-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {index}
        </div>
        <span className="text-sm text-gray-500 font-medium">
          Question {index}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {question.condition}
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
        {question.text}
      </p>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center text-blue-600 font-medium text-sm">
          <span>{isCompleted ? "Review Question" : "Start Question"}</span>
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TestQuestions;
