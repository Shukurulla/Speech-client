// src/pages/TopicTestResult.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ResponsiveLayout from "../components/Layout";
import axios from "../service/api";
import { toast } from "react-hot-toast";
import {
  FiAward,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiMessageSquare,
  FiBook,
  FiArrowLeft,
  FiRefreshCw,
  FiHome,
} from "react-icons/fi";

const TopicTestResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.resultData || null);
  const [isLoading, setIsLoading] = useState(!result);

  useEffect(() => {
    // If we don't have result data from navigation state, fetch it
    if (!result && resultId) {
      fetchResult();
    }
  }, [resultId]);

  const fetchResult = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/topic-test/result/${resultId}`);

      if (data.status === "success" && data.data) {
        setResult(data.data);
      } else {
        toast.error("Result not found");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching result:", error);
      toast.error("Failed to load test result");
      // Don't auto-navigate, let user decide
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 70) return "bg-blue-50 border-blue-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getGradeEmoji = (score) => {
    if (score >= 90) return "🌟";
    if (score >= 80) return "⭐";
    if (score >= 70) return "👍";
    if (score >= 60) return "✅";
    return "💪";
  };

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

  if (!result) {
    return (
      <ResponsiveLayout
        activePage={
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <FiAlertCircle className="text-red-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Result Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn't find your test result. Please try again.
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        }
        activeTab="Dashboard"
      />
    );
  }

  const evaluation = result.aiEvaluation || {};
  const overallScore = evaluation.overallScore || 0;

  const PageContent = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div
          className={`p-8 text-white ${
            overallScore >= 70
              ? "bg-gradient-to-r from-green-600 to-emerald-600"
              : overallScore >= 50
              ? "bg-gradient-to-r from-yellow-600 to-orange-600"
              : "bg-gradient-to-r from-red-600 to-pink-600"
          }`}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">{getGradeEmoji(overallScore)}</div>
            <h1 className="text-3xl font-bold mb-2">Topic Test Results</h1>
            <p className="text-xl opacity-90">
              Lesson {result.lessonNumber} - Speaking Test
            </p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center">
              <div
                className={`text-6xl font-bold ${getScoreColor(overallScore)}`}
              >
                {overallScore}
              </div>
              <div className="text-2xl text-gray-600 ml-2">/100</div>
            </div>
            <p className="text-gray-600 mt-2">Overall Score</p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <ScoreCard
              title="Relevance"
              score={evaluation.relevanceScore || 0}
              icon={<FiMessageSquare />}
              color="purple"
            />
            <ScoreCard
              title="Grammar"
              score={evaluation.grammarScore || 0}
              icon={<FiBook />}
              color="blue"
            />
            <ScoreCard
              title="Fluency"
              score={evaluation.fluencyScore || 0}
              icon={<FiTrendingUp />}
              color="green"
            />
            <ScoreCard
              title="Vocabulary"
              score={evaluation.vocabularyScore || 0}
              icon={<FiAward />}
              color="yellow"
            />
          </div>

          {/* Feedback */}
          {evaluation.feedback && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                AI Feedback
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {evaluation.feedback}
                </p>
              </div>
            </div>
          )}

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            {evaluation.strengths && evaluation.strengths.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FiCheckCircle className="text-green-600 mr-2" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {evaluation.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {evaluation.improvements && evaluation.improvements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FiAlertCircle className="text-orange-600 mr-2" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {evaluation.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-600 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Your Response */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Your Response
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {result.spokenText || "No response recorded"}
              </p>
              {result.wordCount && (
                <p className="text-sm text-gray-500 mt-2">
                  Word count: {result.wordCount} | Duration:{" "}
                  {result.duration ? `${result.duration} seconds` : "N/A"}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FiHome className="mr-2" />
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(-2)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <FiArrowLeft className="mr-2" />
              Back to Lessons
            </button>
            <button
              onClick={() => {
                // Navigate back to topic test with retry
                navigate(
                  `/topic-speaking/${result.gradeId}/${result.lessonNumber}`,
                  {
                    replace: true,
                  }
                );
              }}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FiRefreshCw className="mr-2" />
              Try Again
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

// Score Card Component
const ScoreCard = ({ title, score, icon, color }) => {
  const colors = {
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]} mb-2`}
      >
        {icon}
      </div>
      <div className={`text-2xl font-bold ${getScoreClass(score)}`}>
        {score}%
      </div>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
};

export default TopicTestResult;
