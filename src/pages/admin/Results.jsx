import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import axios from "../../service/api";
import { toast } from "react-hot-toast";

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [grades, setGrades] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    gradeId: "",
    lessonId: "",
    minScore: "",
    maxScore: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchGrades();
    fetchResults();
  }, []);

  useEffect(() => {
    if (filters.gradeId) {
      fetchLessons();
    }
  }, [filters.gradeId]);

  useEffect(() => {
    fetchResults();
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchResults();
  }, [currentPage]);

  const fetchGrades = async () => {
    try {
      const { data } = await axios.get("/grade");
      setGrades(data.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchLessons = async () => {
    if (!filters.gradeId) return;

    try {
      const { data } = await axios.get(`/lesson/grade/${filters.gradeId}`);
      setLessons(data.data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "") delete params[key];
      });

      const { data } = await axios.get("/admin/results", { params });
      setResults(data.data.results);
      setTotalPages(data.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to load test results");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "gradeId" && { lessonId: "" }), // Reset lesson when grade changes
    }));
  };

  const clearFilters = () => {
    setFilters({
      gradeId: "",
      lessonId: "",
      minScore: "",
      maxScore: "",
      startDate: "",
      endDate: "",
    });
  };

  const exportResults = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (params[key] === "") delete params[key];
      });

      const { data } = await axios.get("/admin/export/results", { params });

      // Convert to CSV and download
      const csvContent = convertToCSV(data.data);
      downloadCSV(csvContent, "test-results.csv");

      toast.success("Results exported successfully");
    } catch (error) {
      console.error("Error exporting results:", error);
      toast.error("Failed to export results");
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    return [headers, ...rows].join("\n");
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Results
            </h1>
            <p className="text-gray-600">
              View and analyze student test results
            </p>
          </div>
          <button
            onClick={exportResults}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <select
                value={filters.gradeId}
                onChange={(e) => handleFilterChange("gradeId", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Grades</option>
                {grades.map((grade) => (
                  <option key={grade._id} value={grade._id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson
              </label>
              <select
                value={filters.lessonId}
                onChange={(e) => handleFilterChange("lessonId", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={!filters.gradeId}
              >
                <option value="">All Lessons</option>
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.orderNumber}. {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Score
                </label>
                <input
                  type="number"
                  value={filters.minScore}
                  onChange={(e) =>
                    handleFilterChange("minScore", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Score
                </label>
                <input
                  type="number"
                  value={filters.maxScore}
                  onChange={(e) =>
                    handleFilterChange("maxScore", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="100"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Student
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Grade
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Lesson
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Score
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Questions
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Time
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Attempt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : results.length > 0 ? (
                  results.map((result) => (
                    <tr key={result._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-sm">
                              {result.userId?.firstname?.[0]}
                              {result.userId?.lastname?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {result.userId?.firstname}{" "}
                              {result.userId?.lastname}
                            </p>
                            <p className="text-sm text-gray-500">
                              {result.userId?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {result.gradeId?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {result.lessonId?.title || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(
                            result.score
                          )}`}
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
                      <td className="px-6 py-4 text-gray-600">
                        #{result.attemptNumber}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No test results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-red-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? "bg-red-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Summary */}
        {results.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Results"
              value={results.length}
              icon="📊"
              color="bg-blue-500"
            />
            <StatCard
              title="Average Score"
              value={`${Math.round(
                results.reduce((sum, r) => sum + r.score, 0) / results.length
              )}%`}
              icon="📈"
              color="bg-green-500"
            />
            <StatCard
              title="Highest Score"
              value={`${Math.max(...results.map((r) => r.score))}%`}
              icon="🏆"
              color="bg-yellow-500"
            />
            <StatCard
              title="Success Rate"
              value={`${Math.round(
                (results.filter((r) => r.score >= 60).length / results.length) *
                  100
              )}%`}
              icon="✅"
              color="bg-purple-500"
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center">
        <div
          className={`${color} w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg mr-3`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminResults;
