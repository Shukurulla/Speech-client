import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import TestResultService from "../service/testresult.service";
import ResponsiveLayout from "../components/Layout";
import {
  FiTrendingUp,
  FiAward,
  FiClock,
  FiTarget,
  FiActivity,
  FiCalendar,
  FiBook,
  FiHeadphones,
  FiMic,
  FiFilter,
  FiDownload,
} from "react-icons/fi";

const StudentResults = () => {
  const { user } = useSelector((state) => state.user);
  const [statistics, setStatistics] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedTestType, setSelectedTestType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterResults();
  }, [selectedTimeframe, selectedGrade, selectedTestType, allResults]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, resultsResponse] = await Promise.all([
        TestResultService.getMyStatistics(),
        TestResultService.getMyResults({ limit: 1000 }), // Get all results
      ]);

      if (statsResponse.status === "success") {
        setStatistics(statsResponse.data);
      }

      if (resultsResponse.status === "success") {
        setAllResults(resultsResponse.data.results || []);
        setRecentResults(resultsResponse.data.results?.slice(0, 10) || []);
        setTotalPages(resultsResponse.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...allResults];

    // Filter by timeframe
    if (selectedTimeframe !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (selectedTimeframe) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }

      filtered = filtered.filter(
        (result) => new Date(result.createdAt) >= filterDate
      );
    }

    // Filter by grade
    if (selectedGrade !== "all") {
      filtered = filtered.filter(
        (result) => result.gradeId?.name === selectedGrade
      );
    }

    // Filter by test type (based on test names or categories)
    if (selectedTestType !== "all") {
      filtered = filtered.filter((result) => {
        // You might need to adjust this based on how test types are stored
        // For now, we'll check if it's a speech or listening test based on common patterns
        const testTitle = result.testId?.title?.toLowerCase() || "";
        const lessonTitle = result.lessonId?.title?.toLowerCase() || "";

        if (selectedTestType === "speech") {
          return (
            testTitle.includes("speech") ||
            testTitle.includes("speaking") ||
            testTitle.includes("read") ||
            testTitle.includes("pronounc")
          );
        } else if (selectedTestType === "listening") {
          return (
            testTitle.includes("listening") ||
            testTitle.includes("hear") ||
            testTitle.includes("audio")
          );
        }
        return true;
      });
    }

    setRecentResults(filtered.slice(0, 20)); // Show top 20 filtered results
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90)
      return {
        level: "Excellent",
        color: "text-green-600",
        bg: "bg-green-100",
        icon: "🏆",
      };
    if (score >= 80)
      return {
        level: "Very Good",
        color: "text-blue-600",
        bg: "bg-blue-100",
        icon: "🌟",
      };
    if (score >= 70)
      return {
        level: "Good",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        icon: "👍",
      };
    if (score >= 60)
      return {
        level: "Average",
        color: "text-orange-600",
        bg: "bg-orange-100",
        icon: "📈",
      };
    return {
      level: "Needs Improvement",
      color: "text-red-600",
      bg: "bg-red-100",
      icon: "📚",
    };
  };

  const calculateProgress = () => {
    if (!allResults || allResults.length < 2) return 0;

    const recent = allResults.slice(0, 5);
    const older = allResults.slice(5, 10);

    if (older.length === 0) return 0;

    const recentAvg =
      recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.score, 0) / older.length;

    return Math.round(recentAvg - olderAvg);
  };

  const getScoreDistribution = () => {
    if (!recentResults || recentResults.length === 0) return {};

    const distribution = { excellent: 0, good: 0, average: 0, poor: 0 };

    recentResults.forEach((result) => {
      if (result.score >= 90) distribution.excellent++;
      else if (result.score >= 75) distribution.good++;
      else if (result.score >= 60) distribution.average++;
      else distribution.poor++;
    });

    return distribution;
  };

  const getMonthlyData = () => {
    if (!allResults) return [];

    const monthlyData = {};
    allResults.forEach((result) => {
      const month = new Date(result.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { scores: [], count: 0 };
      }
      monthlyData[month].scores.push(result.score);
      monthlyData[month].count++;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        avgScore: Math.round(
          data.scores.reduce((sum, score) => sum + score, 0) /
            data.scores.length
        ),
        testCount: data.count,
      }))
      .reverse()
      .slice(0, 6);
  };

  const getUniqueGrades = () => {
    const grades = new Set();
    allResults.forEach((result) => {
      if (result.gradeId?.name) {
        grades.add(result.gradeId.name);
      }
    });
    return Array.from(grades);
  };

  const exportResults = () => {
    TestResultService.exportToCSV(recentResults);
  };

  const getTestTypeIcon = (result) => {
    const testTitle = result.testId?.title?.toLowerCase() || "";
    if (
      testTitle.includes("listening") ||
      testTitle.includes("hear") ||
      testTitle.includes("audio")
    ) {
      return <FiHeadphones className="text-purple-600" />;
    }
    return <FiMic className="text-blue-600" />;
  };

  if (isLoading) {
    return (
      <ResponsiveLayout
        activePage={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
        activeTab="Results"
      />
    );
  }

  const progress = calculateProgress();
  const distribution = getScoreDistribution();
  const monthlyData = getMonthlyData();
  const overall = statistics?.overall || {};
  const performanceLevel = getPerformanceLevel(overall.averageScore || 0);
  const uniqueGrades = getUniqueGrades();

  return (
    <ResponsiveLayout
      activePage={
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Test Results
            </h1>
            <p className="text-lg text-gray-600">
              Track your progress and see how you're improving
            </p>
          </div>

          {/* Quick Stats - Always show even if no data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Tests"
              value={overall.totalTests || 0}
              icon={<FiActivity />}
              color="bg-blue-500"
              trend={null}
            />
            <StatCard
              title="Average Score"
              value={`${Math.round(overall.averageScore) || 0}%`}
              icon={<FiTarget />}
              color="bg-green-500"
              trend={
                progress > 0
                  ? `+${progress}%`
                  : progress < 0
                  ? `${progress}%`
                  : null
              }
            />
            <StatCard
              title="Best Score"
              value={`${overall.bestScore || 0}%`}
              icon={<FiAward />}
              color="bg-yellow-500"
              trend={null}
            />
            <StatCard
              title="Study Time"
              value={`${Math.round((overall.totalTime || 0) / 60)} min`}
              icon={<FiClock />}
              color="bg-purple-500"
              trend={null}
            />
          </div>

          {/* Check if user has any results */}
          {allResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                No test results yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't taken any tests yet. Start learning and practicing
                to see your progress here!
              </p>
              <button
                onClick={() => (window.location.href = "/grades")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Take Your First Test
              </button>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiFilter />
                    Filter Results
                  </h3>
                  <button
                    onClick={exportResults}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiDownload size={16} />
                    Export CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Period
                    </label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Time</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="3months">Last 3 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade Level
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Grades</option>
                      {uniqueGrades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Type
                    </label>
                    <select
                      value={selectedTestType}
                      onChange={(e) => setSelectedTestType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="speech">Speech Tests</option>
                      <option value="listening">Listening Tests</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Overview */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Performance Overview
                      </h3>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${performanceLevel.bg} ${performanceLevel.color}`}
                      >
                        {performanceLevel.icon} {performanceLevel.level}
                      </div>
                    </div>

                    {monthlyData.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Month</span>
                          <span>Average Score</span>
                        </div>
                        {monthlyData.map((data, index) => (
                          <div
                            key={data.month}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="font-medium">{data.month}</span>
                              <span className="text-sm text-gray-500">
                                ({data.testCount} tests)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${data.avgScore}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-900 min-w-[3rem]">
                                {data.avgScore}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FiActivity className="mx-auto text-4xl mb-2 opacity-50" />
                        <p>No performance data for the selected period.</p>
                      </div>
                    )}
                  </div>

                  {/* Score Distribution */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Score Distribution ({recentResults.length} results)
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {distribution.excellent || 0}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          Excellent
                        </div>
                        <div className="text-xs text-gray-500">90-100%</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {distribution.good || 0}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          Good
                        </div>
                        <div className="text-xs text-gray-500">75-89%</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {distribution.average || 0}
                        </div>
                        <div className="text-sm text-yellow-600 font-medium">
                          Average
                        </div>
                        <div className="text-xs text-gray-500">60-74%</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {distribution.poor || 0}
                        </div>
                        <div className="text-sm text-red-600 font-medium">
                          Needs Work
                        </div>
                        <div className="text-xs text-gray-500">0-59%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar - Achievements & Tips */}
                <div className="space-y-8">
                  {/* Achievements */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Achievements
                    </h3>
                    <div className="space-y-3">
                      {overall.totalTests >= 1 && (
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            🎯
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              First Test
                            </div>
                            <div className="text-sm text-gray-500">
                              Completed your first test
                            </div>
                          </div>
                        </div>
                      )}

                      {overall.totalTests >= 10 && (
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            🏃‍♂️
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Getting Started
                            </div>
                            <div className="text-sm text-gray-500">
                              Completed 10 tests
                            </div>
                          </div>
                        </div>
                      )}

                      {overall.bestScore >= 90 && (
                        <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            🏆
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Excellence
                            </div>
                            <div className="text-sm text-gray-500">
                              Scored 90% or higher
                            </div>
                          </div>
                        </div>
                      )}

                      {progress >= 10 && (
                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            📈
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Improving
                            </div>
                            <div className="text-sm text-gray-500">
                              Great progress trend
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Tips */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      💡 Tips for Improvement
                    </h3>
                    <div className="space-y-3 text-sm">
                      {overall.averageScore < 60 && (
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <p>
                            Focus on listening carefully and practice basic
                            vocabulary
                          </p>
                        </div>
                      )}

                      {overall.averageScore >= 60 &&
                        overall.averageScore < 80 && (
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <p>
                              Work on pronunciation accuracy and speaking rhythm
                            </p>
                          </div>
                        )}

                      {overall.averageScore >= 80 && (
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <p>
                            Challenge yourself with harder tests to maintain
                            progress
                          </p>
                        </div>
                      )}

                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p>
                          Practice regularly - consistency is key to improvement
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p>
                          Listen to your recordings and compare with the
                          original
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Results Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Test Results ({recentResults.length} results)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                          Lesson
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                          Grade
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                          Score
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                          Questions
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                          Time
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentResults.map((result) => (
                        <tr key={result._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getTestTypeIcon(result)}
                              <span className="text-sm font-medium">
                                {result.testId?.title
                                  ?.toLowerCase()
                                  .includes("listening")
                                  ? "Listening"
                                  : "Speech"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {result.lessonId?.title || "Unknown Lesson"}
                              </div>
                              <div className="text-sm text-gray-500">
                                Attempt #{result.attemptNumber || 1}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {result.gradeId?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                result.score >= 90
                                  ? "bg-green-100 text-green-800"
                                  : result.score >= 75
                                  ? "bg-blue-100 text-blue-800"
                                  : result.score >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {result.score}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {result.correctAnswers}/{result.totalQuestions}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {Math.round(result.timeTaken / 60)}m{" "}
                            {result.timeTaken % 60}s
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(result.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      }
      activeTab="Results"
    />
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  trend.startsWith("+")
                    ? "bg-green-100 text-green-600"
                    : trend.startsWith("-")
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {trend}
              </span>
            )}
          </div>
        </div>
        <div
          className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
