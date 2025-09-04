import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ResponsiveLayout from "../components/Layout";
import axios from "../service/api";
import { toast } from "react-hot-toast";
import {
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiHome,
  FiRotateCcw,
  FiBarChart,
} from "react-icons/fi";

const MockTestResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.resultData || null);
  const [isLoading, setIsLoading] = useState(!result);

  useEffect(() => {
    if (!result && resultId) {
      fetchResult();
    }
  }, [resultId]);

  const fetchResult = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/mock-test/result/${resultId}`);

      if (data.status === "success" && data.data) {
        setResult(data.data);
      } else {
        toast.error("Result not found");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching result:", error);
      toast.error("Failed to load test result");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90)
      return { level: "Excellent", emoji: "🏆", color: "text-green-600" };
    if (score >= 80)
      return { level: "Very Good", emoji: "⭐", color: "text-green-600" };
    if (score >= 70)
      return { level: "Good", emoji: "👍", color: "text-blue-600" };
    if (score >= 60)
      return { level: "Satisfactory", emoji: "👌", color: "text-yellow-600" };
    return { level: "Needs Improvement", emoji: "💪", color: "text-red-600" };
  };

  if (isLoading) {
    return (
      <ResponsiveLayout
        activePage={
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
        activeTab="MockTests"
      />
    );
  }

  if (!result) {
    return (
      <ResponsiveLayout
        activePage={
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <FiXCircle className="text-red-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Result Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn't find your test result. Please try again.
              </p>
              <button
                onClick={() => navigate("/mock-tests")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Mock Tests
              </button>
            </div>
          </div>
        }
        activeTab="MockTests"
      />
    );
  }

  const performance = getPerformanceLevel(result.totalScore);

  return (
    <ResponsiveLayout
      activePage={
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div
              className={`p-8 text-white ${
                result.passed
                  ? "bg-gradient-to-r from-green-600 to-emerald-600"
                  : "bg-gradient-to-r from-red-600 to-orange-600"
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{performance.emoji}</div>
                <h1 className="text-3xl font-bold mb-2">Mock Test Results</h1>
                <p className="text-xl opacity-90">
                  {result.mockTestId?.title || "Mock Test"}
                </p>
                <div className="mt-2 opacity-75">
                  <span>{result.gradeId?.name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Main Results */}
            <div className="p-8">
              {/* Score Display */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center mb-4">
                  <div
                    className={`text-6xl font-bold ${getScoreColor(
                      result.totalScore
                    )}`}
                  >
                    {result.totalScore}
                  </div>
                  <div className="text-2xl text-gray-600 ml-2">/100</div>
                </div>
                <div
                  className={`text-xl font-semibold ${performance.color} mb-2`}
                >
                  {performance.level}
                </div>
                <div
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    result.passed
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.passed ? "PASSED" : "FAILED"}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiCheckCircle className="text-blue-600 text-xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.correctAnswers}
                  </div>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiXCircle className="text-purple-600 text-xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.wrongAnswers}
                  </div>
                  <p className="text-sm text-gray-600">Wrong Answers</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiClock className="text-green-600 text-xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(result.totalTimeSpent / 60)}
                  </div>
                  <p className="text-sm text-gray-600">Minutes Used</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiTrendingUp className="text-yellow-600 text-xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round((result.correctAnswers / 20) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiBarChart className="mr-2" />
                  Question-by-Question Results
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {result.answers?.map((answer, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        answer.isCorrect
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                              answer.isCorrect
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {answer.isCorrect ? "✓" : "✗"}
                          </div>
                          <div>
                            <span className="font-medium">
                              Lesson {answer.lessonNumber}
                            </span>
                            <span className="text-sm text-gray-500 ml-2 capitalize">
                              ({answer.questionType})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              answer.score >= 80
                                ? "text-green-600"
                                : answer.score >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {answer.score}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Summary */}
              <div className="mb-8">
                <div
                  className={`rounded-lg p-6 border-2 ${getScoreBg(
                    result.totalScore
                  )}`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Performance Summary
                  </h3>
                  <div className="space-y-2">
                    {result.totalScore >= 80 && (
                      <p className="text-green-800">
                        🎉 Outstanding performance! You have demonstrated
                        excellent mastery of the material across all lessons.
                      </p>
                    )}
                    {result.totalScore >= 60 && result.totalScore < 80 && (
                      <p className="text-yellow-800">
                        👍 Good work! You're showing solid understanding. Focus
                        on the areas where you scored lower to improve further.
                      </p>
                    )}
                    {result.totalScore < 60 && (
                      <p className="text-red-800">
                        💪 Keep practicing! Review the lessons where you had
                        difficulties and try again when you feel more confident.
                      </p>
                    )}
                    <div className="mt-4 text-sm text-gray-600">
                      <strong>Completion Time:</strong>{" "}
                      {Math.round(result.totalTimeSpent / 60)} minutes out of{" "}
                      {result.mockTestId?.timeLimit || 60} minutes allowed
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/mock-tests")}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FiHome className="mr-2" />
                  Back to Mock Tests
                </button>
                <button
                  onClick={() => navigate(`/mock-test/${result.gradeId._id}`)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <FiRotateCcw className="mr-2" />
                  Retake Test
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      activeTab="MockTests"
    />
  );
};

export default MockTestResult;
