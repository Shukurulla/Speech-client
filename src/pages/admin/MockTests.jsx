// src/pages/admin/MockTests.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import axios from "../../service/api";
import { toast } from "react-hot-toast";
import {
  FiFileText,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiList,
} from "react-icons/fi";

const AdminMockTests = () => {
  const [mockTests, setMockTests] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: 60,
    passingScore: 60,
  });
  const [testResults, setTestResults] = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchMockTest();
    }
  }, [selectedGrade]);

  const fetchGrades = async () => {
    try {
      const { data } = await axios.get("/grade");
      setGrades(data.data);
      if (data.data.length > 0) {
        setSelectedGrade(data.data[0]._id);
      }
    } catch (error) {
      toast.error("Failed to load grades");
    }
  };

  const fetchMockTest = async () => {
    if (!selectedGrade) return;

    try {
      setIsLoading(true);
      const { data } = await axios.get(`/mock-test/grade/${selectedGrade}`);
      setMockTests(data.status === "success" ? [data.data] : []);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching mock test:", error);
      }
      setMockTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestResults = async (mockTestId) => {
    try {
      const { data } = await axios.get(`/mock-test/${mockTestId}/results`);
      setTestResults(data.data || []);
      setShowResultsModal(true);
    } catch (error) {
      toast.error("Failed to load test results");
    }
  };

  const handleGenerateMockTest = async () => {
    if (!selectedGrade) {
      toast.error("Please select a grade first");
      return;
    }

    setIsGenerating(true);
    try {
      const { data } = await axios.post(
        `/mock-test/generate/${selectedGrade}`,
        formData
      );
      toast.success("Mock test generated successfully!");
      fetchMockTest();
      closeModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate mock test"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteMockTest = async (testId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this mock test? All results will be lost."
      )
    ) {
      try {
        await axios.delete(`/mock-test/${testId}`);
        toast.success("Mock test deleted successfully");
        fetchMockTest();
      } catch (error) {
        toast.error("Failed to delete mock test");
      }
    }
  };

  const handleRegenerateMockTest = async () => {
    if (
      window.confirm(
        "This will create a new mock test with different questions. Continue?"
      )
    ) {
      setShowModal(true);
    }
  };

  const openModal = () => {
    setFormData({
      title: `Mock Test - ${new Date().toLocaleDateString()}`,
      description: "Comprehensive test covering all 20 lessons",
      timeLimit: 60,
      passingScore: 60,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      title: "",
      description: "",
      timeLimit: 60,
      passingScore: 60,
    });
  };

  const selectedGradeName =
    grades.find((g) => g._id === selectedGrade)?.name || "";
  const currentMockTest = mockTests[0];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mock Tests Management
            </h1>
            <p className="text-gray-600">
              Manage comprehensive tests with 20 questions (one from each
              lesson)
            </p>
          </div>
        </div>

        {/* Grade Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Grade:
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {grades.map((grade) => (
                  <option key={grade._id} value={grade._id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedGradeName && !currentMockTest && (
              <button
                onClick={openModal}
                className="ml-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <FiPlus />
                Generate Mock Test
              </button>
            )}
          </div>
          {selectedGradeName && (
            <p className="mt-2 text-sm text-gray-600">
              Managing mock test for: <strong>{selectedGradeName}</strong>
            </p>
          )}
        </div>

        {/* Mock Test Display */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : currentMockTest ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Test Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentMockTest.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {currentMockTest.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchTestResults(currentMockTest._id)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                  >
                    <FiList />
                    View Results
                  </button>
                  <button
                    onClick={handleRegenerateMockTest}
                    className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 flex items-center gap-1"
                  >
                    <FiRefreshCw />
                    Regenerate
                  </button>
                  <button
                    onClick={() => handleDeleteMockTest(currentMockTest._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-1"
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Test Details */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiFileText className="text-purple-600 text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentMockTest.totalQuestions || 20}
                  </div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiClock className="text-blue-600 text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentMockTest.timeLimit}
                  </div>
                  <p className="text-sm text-gray-600">Minutes</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiCheckCircle className="text-green-600 text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentMockTest.passingScore}%
                  </div>
                  <p className="text-sm text-gray-600">Passing Score</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiList className="text-yellow-600 text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentMockTest.isActive ? "Active" : "Inactive"}
                  </div>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>

              {/* Questions Preview */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Questions Distribution
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-3">
                    This mock test contains one question from each of the
                    following lessons:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded px-3 py-2 text-center text-sm font-medium text-gray-700 border border-gray-200"
                      >
                        Lesson {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Each time a student takes this test,
                  questions are presented in random order. The test
                  automatically saves progress and calculates scores based on
                  accuracy.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">
                <FiFileText />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Mock Test Available
              </h3>
              <p className="text-gray-600 mb-6">
                Generate a mock test to enable comprehensive assessment for this
                grade.
              </p>
              <button
                onClick={openModal}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
              >
                <FiPlus />
                Generate Mock Test
              </button>
            </div>
          </div>
        )}

        {/* Generate Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Generate Mock Test
                </h3>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Mock Test Title"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Test description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timeLimit: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="20"
                      max="180"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={formData.passingScore}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passingScore: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Important:</strong> This will automatically select
                    one question from each of the 20 lessons. Make sure all
                    lessons have at least one test question before generating.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isGenerating}
                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateMockTest}
                    disabled={isGenerating}
                    className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FiPlus />
                        Generate Test
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Modal */}
        {showResultsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Test Results
                  </h3>
                  <button
                    onClick={() => setShowResultsModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {testResults.length > 0 ? (
                  <div className="space-y-4">
                    {testResults.map((result) => (
                      <div key={result._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {result.userId?.firstName}{" "}
                              {result.userId?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(result.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold ${
                                result.passed
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {result.totalScore}%
                            </div>
                            <p className="text-sm text-gray-600">
                              {result.correctAnswers}/
                              {result.totalQuestions || 20} correct
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            Time: {Math.floor(result.totalTimeSpent / 60)}m
                          </span>
                          <span
                            className={`px-2 py-1 rounded ${
                              result.passed
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {result.passed ? "Passed" : "Failed"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No results yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMockTests;
