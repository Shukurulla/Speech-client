import React, { useState, useEffect } from "react";
import {
  FiBook,
  FiBookOpen,
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiClock,
  FiTarget,
  FiActivity,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [grades, setGrades] = useState([]);
  const [gradeStats, setGradeStats] = useState({});
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Mock user data
  const user = { firstname: "Student" };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data for demonstration
      setGrades([
        {
          _id: "1",
          name: "8th Grade",
          description: "Foundation level English speaking skills",
        },
        {
          _id: "2",
          name: "9th Grade",
          description: "Intermediate English speaking and listening",
        },
      ]);

      setGradeStats({
        1: {
          lessonCount: 12,
          testCount: 24,
          avgScore: 78,
          completedLessons: 8,
          progress: 67,
        },
        2: {
          lessonCount: 15,
          testCount: 30,
          avgScore: 85,
          completedLessons: 5,
          progress: 33,
        },
      });

      setUserStats({
        totalTests: 45,
        averageScore: 81,
        bestScore: 95,
        totalTime: 2400, // in seconds
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSelect = (grade) => {
    navigate(`/grade/${grade._id}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.firstname || "Student";

    if (hour < 12) {
      return `Good morning, ${firstName}!`;
    } else if (hour < 18) {
      return `Good afternoon, ${firstName}!`;
    } else {
      return `Good evening, ${firstName}!`;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <div className="row items-center justify-between">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <h1 className="text-4xl font-[500] text-[#083156] mb-2 leading-tight">
              {getGreeting()}
            </h1>
            <h2 className="text-2xl font-[400] text-[#083156] mb-4 leading-tight">
              Ready to improve your speaking skills?
            </h2>
            <p className="text-lg text-[#3D4D5C] mb-6 leading-relaxed">
              Choose your grade level and start practicing with our interactive
              lessons and tests.
            </p>

            {/* Quick Stats */}
            {userStats && (
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg px-4 py-2 flex items-center gap-2">
                  <FiTarget className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {userStats.totalTests || 0} tests taken
                  </span>
                </div>
                <div className="bg-green-50 rounded-lg px-4 py-2 flex items-center gap-2">
                  <FiAward className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {Math.round(userStats.averageScore) || 0}% average score
                  </span>
                </div>
                {userStats.bestScore > 0 && (
                  <div className="bg-yellow-50 rounded-lg px-4 py-2 flex items-center gap-2">
                    <FiTrendingUp className="text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {userStats.bestScore}% best score
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => alert("View My Progress")}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              View My Progress
            </button>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 py-3 flex items-center justify-center">
            <div className="w-64 h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center relative">
              <div className="text-white text-6xl">🎤</div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-green-400 rounded-md rotate-12"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Section */}
      <div className="mb-8">
        <h2 className="text-4xl font-[500] text-[#083156] mb-4 leading-tight">
          Choose Your Grade Level
        </h2>
        <p className="text-lg text-[#3D4D5C] mb-6 leading-relaxed">
          Select your grade to access lessons, practice exercises, and speaking
          tests.
        </p>

        {grades.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {grades.map((grade) => (
              <EnhancedGradeCard
                key={grade._id}
                grade={grade}
                stats={gradeStats[grade._id]}
                onSelect={() => handleGradeSelect(grade)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No grades available
            </h3>
            <p className="text-gray-600">
              Please contact your administrator to set up grade levels.
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {userStats && userStats.totalTests > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FiActivity className="text-blue-600 text-xl" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {userStats.totalTests}
              </div>
              <div className="text-sm text-gray-500">Tests Completed</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FiTarget className="text-green-600 text-xl" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(userStats.averageScore)}%
              </div>
              <div className="text-sm text-gray-500">Average Score</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FiAward className="text-yellow-600 text-xl" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {userStats.bestScore}%
              </div>
              <div className="text-sm text-gray-500">Best Score</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FiClock className="text-purple-600 text-xl" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((userStats.totalTime || 0) / 60)}
              </div>
              <div className="text-sm text-gray-500">Minutes Practiced</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EnhancedGradeCard = ({ grade, stats, onSelect }) => {
  const getProgressColor = (progress) => {
    if (progress >= 80) return "text-green-600 bg-green-100";
    if (progress >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-blue-600 bg-blue-100";
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <span className="text-3xl text-gray-700">
            <FiBookOpen />
          </span>
        </div>
        <div className="text-right">
          {stats && stats.progress > 0 && (
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(
                stats.progress
              )}`}
            >
              {stats.progress}% Complete
            </div>
          )}
        </div>
      </div>

      {/* Grade Info */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {grade.name}
        </h3>
        {grade.description && (
          <p className="text-gray-600 text-sm mb-4">{grade.description}</p>
        )}
      </div>

      {/* Stats */}
      {stats ? (
        <div className="space-y-4">
          {/* Progress Bar */}
          {stats.progress > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm text-gray-600">
                  {stats.completedLessons}/{stats.lessonCount} lessons
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FiBook className="text-gray-600 mr-1" size={16} />
              </div>
              <div className="font-semibold text-gray-900">
                {stats.lessonCount}
              </div>
              <div className="text-xs text-gray-500">Lessons</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FiUsers className="text-gray-600 mr-1" size={16} />
              </div>
              <div className="font-semibold text-gray-900">
                {stats.testCount}
              </div>
              <div className="text-xs text-gray-500">Tests</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FiTrendingUp className="text-gray-600 mr-1" size={16} />
              </div>
              <div
                className={`font-semibold ${
                  stats.avgScore > 0
                    ? getScoreColor(stats.avgScore)
                    : "text-gray-400"
                }`}
              >
                {stats.avgScore > 0 ? `${stats.avgScore}%` : "—"}
              </div>
              <div className="text-xs text-gray-500">Avg Score</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <div className="animate-pulse">Loading stats...</div>
        </div>
      )}

      {/* Action */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
          <span>
            {stats && stats.completedLessons > 0
              ? "Continue Learning"
              : "Start Learning"}
          </span>
          <svg
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
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

export default Dashboard;
