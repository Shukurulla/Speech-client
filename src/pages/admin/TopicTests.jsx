// src/pages/admin/TopicTests.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import axios from "../../service/api";
import { toast } from "react-hot-toast";
import {
  FiMic,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiPercent,
  FiFileText,
} from "react-icons/fi";

const AdminTopicTests = () => {
  const [topicTests, setTopicTests] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    afterLesson: 5,
    topic: "",
    prompt: "",
    duration: 60,
    criteria: {
      relevance: 30,
      grammar: 25,
      fluency: 25,
      vocabulary: 20,
    },
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchTopicTests();
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

  const fetchTopicTests = async () => {
    if (!selectedGrade) return;

    try {
      setIsLoading(true);
      const { data } = await axios.get(`/topic-test/grade/${selectedGrade}`);
      setTopicTests(data.data || []);
    } catch (error) {
      console.error("Error fetching topic tests:", error);
      setTopicTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.topic || !formData.prompt) {
      toast.error("Please fill in all required fields");
      return;
    }

    const totalWeight = Object.values(formData.criteria).reduce(
      (sum, val) => sum + val,
      0
    );
    if (totalWeight !== 100) {
      toast.error("Criteria weights must sum to 100%");
      return;
    }

    try {
      const data = {
        ...formData,
        gradeId: selectedGrade,
      };

      if (editingTest) {
        await axios.put(`/topic-test/${editingTest._id}`, data);
        toast.success("Topic test updated successfully");
      } else {
        await axios.post("/topic-test/create", data);
        toast.success("Topic test created successfully");
      }

      fetchTopicTests();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (testId) => {
    if (window.confirm("Are you sure you want to delete this topic test?")) {
      try {
        await axios.delete(`/topic-test/${testId}`);
        toast.success("Topic test deleted successfully");
        fetchTopicTests();
      } catch (error) {
        toast.error("Failed to delete topic test");
      }
    }
  };

  const openModal = (lessonNumber, test = null) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        afterLesson: test.afterLesson,
        topic: test.topic,
        prompt: test.prompt,
        duration: test.duration,
        criteria: test.criteria,
      });
    } else {
      setEditingTest(null);
      setFormData({
        afterLesson: lessonNumber,
        topic: "",
        prompt: "",
        duration: 60,
        criteria: {
          relevance: 30,
          grammar: 25,
          fluency: 25,
          vocabulary: 20,
        },
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTest(null);
    setFormData({
      afterLesson: 5,
      topic: "",
      prompt: "",
      duration: 60,
      criteria: {
        relevance: 30,
        grammar: 25,
        fluency: 25,
        vocabulary: 20,
      },
    });
  };

  const handleCriteriaChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [field]: numValue,
      },
    }));
  };

  const selectedGradeName =
    grades.find((g) => g._id === selectedGrade)?.name || "";

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Topic Speaking Tests
            </h1>
            <p className="text-gray-600">
              Manage speaking topics for every 5 lessons
            </p>
          </div>
        </div>

        {/* Grade Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Grade:
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {grades.map((grade) => (
              <option key={grade._id} value={grade._id}>
                {grade.name}
              </option>
            ))}
          </select>
          {selectedGradeName && (
            <p className="mt-2 text-sm text-gray-600">
              Managing topic tests for: <strong>{selectedGradeName}</strong>
            </p>
          )}
        </div>

        {/* Topic Tests Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[5, 10, 15, 20].map((lessonNumber) => {
              const test = topicTests.find(
                (t) => t.afterLesson === lessonNumber
              );
              return (
                <div
                  key={lessonNumber}
                  className="bg-white rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        After Lesson {lessonNumber}
                      </h3>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiMic className="text-blue-600" />
                      </div>
                    </div>

                    {test ? (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {test.topic}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {test.prompt}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <FiClock />
                          <span>{test.duration} seconds</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(lessonNumber, test)}
                            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(test._id)}
                            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <FiTrash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-gray-400 text-4xl mb-3">
                          <FiFileText />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          No topic test configured
                        </p>
                        <button
                          onClick={() => openModal(lessonNumber)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiPlus />
                          Add Topic Test
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingTest ? "Edit" : "Add"} Topic Test - Lesson{" "}
                  {formData.afterLesson}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Topic */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic Title *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., My Favorite Hobby"
                    required
                  />
                </div>

                {/* Prompt */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt / Instructions *
                  </label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) =>
                      setFormData({ ...formData, prompt: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Describe your favorite hobby. Explain what it is, why you enjoy it, and how often you do it..."
                    required
                  />
                </div>

                {/* Duration */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="30"
                    max="300"
                    required
                  />
                </div>

                {/* Evaluation Criteria */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Evaluation Criteria (Total must equal 100%)
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="flex-1 text-sm text-gray-600">
                        Relevance:
                      </label>
                      <input
                        type="number"
                        value={formData.criteria.relevance}
                        onChange={(e) =>
                          handleCriteriaChange("relevance", e.target.value)
                        }
                        className="w-20 px-3 py-1 border border-gray-300 rounded"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 text-sm text-gray-600">
                        Grammar:
                      </label>
                      <input
                        type="number"
                        value={formData.criteria.grammar}
                        onChange={(e) =>
                          handleCriteriaChange("grammar", e.target.value)
                        }
                        className="w-20 px-3 py-1 border border-gray-300 rounded"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 text-sm text-gray-600">
                        Fluency:
                      </label>
                      <input
                        type="number"
                        value={formData.criteria.fluency}
                        onChange={(e) =>
                          handleCriteriaChange("fluency", e.target.value)
                        }
                        className="w-20 px-3 py-1 border border-gray-300 rounded"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 text-sm text-gray-600">
                        Vocabulary:
                      </label>
                      <input
                        type="number"
                        value={formData.criteria.vocabulary}
                        onChange={(e) =>
                          handleCriteriaChange("vocabulary", e.target.value)
                        }
                        className="w-20 px-3 py-1 border border-gray-300 rounded"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    Total:{" "}
                    {Object.values(formData.criteria).reduce(
                      (sum, val) => sum + val,
                      0
                    )}
                    %
                    {Object.values(formData.criteria).reduce(
                      (sum, val) => sum + val,
                      0
                    ) !== 100 && (
                      <span className="text-red-600 ml-2">Must equal 100%</span>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingTest ? "Update" : "Create"} Topic Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTopicTests;
