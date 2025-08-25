// src/pages/TopicTestResult.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ResponsiveLayout from "../components/Layout";
import axios from "../service/api";
import {
  FiCheck,
  FiX,
  FiTrendingUp,
  FiMessageSquare,
  FiBookOpen,
  FiTarget,
  FiAward,
  FiRefreshCw,
} from "react-icons/fi";

const TopicTestResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      const { data } = await axios.get(`/topic-test/result/${resultId}`);
      setResult(data.data);
    } catch (error) {
      console.error("Failed to fetch result:", error);
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getGradeLabel = (score) => {
    if (score >= 90) return { label: "Excellent", color: "text-green-600" };
    if (score >= 80) return { label: "Very Good", color: "text-green-600" };
    if (score >= 70) return { label: "Good", color: "text-blue-600" };
    if (score >= 60) return { label: "Fair", color: "text-yellow-600" };
    return { label: "Needs Improvement", color: "text-red-600" };
  };

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!result) {
    return (
      <ResponsiveLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">Result not found</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  const overallScore = result.aiEvaluation?.overallScore || 0;
  const gradeInfo = getGradeLabel(overallScore);

  return (
    <ResponsiveLayout>
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Test Results
                </h1>
                <p className="text-gray-600 mt-1">
                  {result.topicTestId?.topic || "Speaking Test"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Lesson {result.lessonNumber}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(result.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Overall Score Card */}
            <div className="mb-8">
              <div
                className={`${getScoreBgColor(
                  overallScore
                )} rounded-xl p-8 text-center`}
              >
                <div className="mb-4">
                  <div
                    className={`text-7xl font-bold ${getScoreColor(
                      overallScore
                    )}`}
                  >
                    {overallScore}%
                  </div>
                  <p
                    className={`text-xl font-semibold mt-2 ${gradeInfo.color}`}
                  >
                    {gradeInfo.label}
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <FiAward className={`text-2xl ${gradeInfo.color}`} />
                    <span className="text-gray-700">Overall Performance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiTrendingUp />
                Detailed Evaluation
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ScoreCard
                  icon={<FiTarget />}
                  title="Relevance"
                  score={result.aiEvaluation?.relevanceScore || 0}
                  description="Topic adherence"
                />
                <ScoreCard
                  icon={<FiBookOpen />}
                  title="Grammar"
                  score={result.aiEvaluation?.grammarScore || 0}
                  description="Language accuracy"
                />
                <ScoreCard
                  icon={<FiMessageSquare />}
                  title="Fluency"
                  score={result.aiEvaluation?.fluencyScore || 0}
                  description="Speech flow"
                />
                <ScoreCard
                  icon={<FiBookOpen />}
                  title="Vocabulary"
                  score={result.aiEvaluation?.vocabularyScore || 0}
                  description="Word choice"
                />
              </div>
            </div>

            {/* AI Feedback */}
            {result.aiEvaluation?.feedback && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMessageSquare />
                  Personalized Feedback
                </h3>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <p className="text-gray-700 leading-relaxed">
                    {result.aiEvaluation.feedback}
                  </p>
                </div>
              </div>
            )}

            {/* Corrections */}
            {result.aiEvaluation?.corrections &&
              result.aiEvaluation.corrections.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Grammar Corrections
                  </h3>
                  <div className="space-y-3">
                    {result.aiEvaluation.corrections.map((correction, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <FiX className="text-red-500 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-red-600 line-through">
                              {correction.original}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 mt-2">
                          <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-green-600 font-medium">
                              {correction.corrected}
                            </span>
                          </div>
                        </div>
                        {correction.explanation && (
                          <p className="text-sm text-gray-600 mt-2 ml-7">
                            {correction.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Your Response */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Response
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {result.spokenText}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    Words:{" "}
                    {result.spokenText?.split(/\s+/).filter((w) => w).length ||
                      0}
                  </span>
                  <span>
                    Duration: {Math.floor((result.duration || 0) / 60)}:
                    {((result.duration || 0) % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() =>
                  navigate(
                    `/topic-speaking/${result.gradeId}/${result.lessonNumber}`
                  )
                }
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiRefreshCw />
                Try Again
              </button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tips for Improvement
          </h3>
          <div className="space-y-3">
            {overallScore < 60 && (
              <>
                <TipItem
                  icon="📚"
                  text="Practice speaking for at least 1 minute on various topics daily"
                />
                <TipItem
                  icon="🎯"
                  text="Focus on staying relevant to the given topic"
                />
                <TipItem
                  icon="📝"
                  text="Work on expanding your vocabulary through reading"
                />
              </>
            )}
            {overallScore >= 60 && overallScore < 80 && (
              <>
                <TipItem
                  icon="🗣️"
                  text="Try to speak more fluently without long pauses"
                />
                <TipItem
                  icon="📖"
                  text="Read English texts aloud to improve pronunciation"
                />
                <TipItem
                  icon="✨"
                  text="Use more varied vocabulary and expressions"
                />
              </>
            )}
            {overallScore >= 80 && (
              <>
                <TipItem
                  icon="🌟"
                  text="Excellent work! Keep practicing to maintain your level"
                />
                <TipItem
                  icon="🎭"
                  text="Try using more advanced vocabulary and complex sentences"
                />
                <TipItem
                  icon="🚀"
                  text="Challenge yourself with more difficult topics"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

// Score Card Component
const ScoreCard = ({ icon, title, score, description }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${getScoreColor(
          score
        )}`}
      >
        {icon}
      </div>
      <div
        className={`text-2xl font-bold ${getScoreColor(score).split(" ")[0]}`}
      >
        {score}%
      </div>
      <p className="text-sm font-medium text-gray-900 mt-1">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
};

// Tip Item Component
const TipItem = ({ icon, text }) => (
  <div className="flex items-start gap-3">
    <span className="text-2xl">{icon}</span>
    <p className="text-gray-700 flex-1">{text}</p>
  </div>
);

export default TopicTestResult;
