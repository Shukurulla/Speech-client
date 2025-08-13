import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import axios from "../../service/api";
import { toast } from "react-hot-toast";
import {
  FiBookOpen,
  FiCamera,
  FiMessageSquare,
  FiMic,
  FiPaperclip,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminTests = () => {
  const [tests, setTests] = useState([]);
  const [grades, setGrades] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testDetails, setTestDetails] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    difficulty: "medium",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchLessons();
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (selectedLesson) {
      fetchTests();
    }
  }, [selectedLesson]);

  const fetchInitialData = async () => {
    try {
      const [gradesRes, categoriesRes] = await Promise.all([
        axios.get("/grade"),
        axios.get("/category/list"),
      ]);

      setGrades(gradesRes.data.data);
      setCategories(categoriesRes.data.data);

      if (gradesRes.data.data.length > 0) {
        setSelectedGrade(gradesRes.data.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchLessons = async () => {
    if (!selectedGrade) return;

    try {
      const { data } = await axios.get(`/lesson/grade/${selectedGrade}`);
      setLessons(data.data);
      if (data.data.length > 0) {
        setSelectedLesson(data.data[0]._id);
      } else {
        setSelectedLesson("");
        setTests([]);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const fetchTests = async () => {
    if (!selectedLesson) return;

    try {
      setIsLoading(true);
      const { data } = await axios.get("/test/all");
      const filteredTests = data.data.filter(
        (test) => test.lessonId === selectedLesson
      );
      setTests(filteredTests);
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestDetails = async (testId) => {
    try {
      const { data } = await axios.get(`/test/${testId}`);
      if (data.status === "success") {
        setTestDetails(data.data.testItems || []);
      }
    } catch (error) {
      console.error("Error fetching test details:", error);
      setTestDetails([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const testData = {
      ...formData,
      lessonId: selectedLesson,
      gradeId: selectedGrade,
    };

    try {
      if (editingTest) {
        await axios.put(`/test/${editingTest._id}`, testData);
        toast.success("Test updated successfully");
      } else {
        await axios.post("/test/create", testData);
        toast.success("Test created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setEditingTest(null);
    setFormData({ title: "", categoryId: "", difficulty: "medium" });
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      categoryId: test.category._id,
      difficulty: test.difficulty || "medium",
    });
    setShowModal(true);
  };

  const handleDelete = async (testId) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        await axios.delete(`/test/${testId}`);
        toast.success("Test deleted successfully");
        fetchTests();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete test");
      }
    }
  };

  const handleManageDetails = async (test) => {
    setSelectedTest(test);
    await fetchTestDetails(test._id);
    setShowDetailsModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const selectedGradeName =
    grades.find((g) => g._id === selectedGrade)?.name || "";
  const selectedLessonName =
    lessons.find((l) => l._id === selectedLesson)?.title || "";

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tests Management
            </h1>
            <p className="text-gray-600">Manage speech tests for lessons</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openCreateModal}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add Speaking Test
            </button>
            <button
              onClick={() => navigate("/admin/tests/listening/create")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add Listening Test
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Grade:
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {grades.map((grade) => (
                  <option key={grade._id} value={grade._id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Lesson:
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={!selectedGrade || lessons.length === 0}
              >
                <option value="">Choose a lesson</option>
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.orderNumber}. {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedGrade && selectedLesson && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>Selected:</strong> {selectedGradeName} →{" "}
                {selectedLessonName}
              </p>
            </div>
          )}
        </div>

        {/* Tests List */}
        {selectedLesson ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : tests.length > 0 ? (
              tests.map((test) => (
                <TestCard
                  key={test._id}
                  test={test}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onManageDetails={handleManageDetails}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tests found
                </h3>
                <p className="text-gray-600 mb-4">
                  Create the first test for this lesson.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={openCreateModal}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Speaking Test
                  </button>
                  <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Listening Test
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a lesson
            </h3>
            <p className="text-gray-600">
              Choose a grade and lesson to manage tests.
            </p>
          </div>
        )}

        {/* Test Modal */}
        {showModal && (
          <TestModal
            test={editingTest}
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            onSubmit={handleSubmit}
            onClose={() => setShowModal(false)}
          />
        )}

        {/* Test Details Modal */}
        {showDetailsModal && (
          <TestDetailsModal
            test={selectedTest}
            testDetails={testDetails}
            onClose={() => setShowDetailsModal(false)}
            onRefresh={() => fetchTestDetails(selectedTest._id)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

const TestCard = ({ test, onEdit, onDelete, onManageDetails }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (categoryTitle) => {
    switch (categoryTitle) {
      case "Read Aloud":
        return <FiMic color="#222" />;
      case "Read, then Speak":
        return <FiBookOpen />;
      case "Speaking Sample":
        return <FiMessageSquare />;
      case "Speak about the Photo":
        return <FiCamera />;

      default:
        return <FiPaperclip />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">
            {getCategoryIcon(test.category.title)}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(test)}
            className="text-blue-600 hover:text-blue-700 p-1"
            title="Edit"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(test._id)}
            className="text-red-600 hover:text-red-700 p-1"
            title="Delete"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.title}</h3>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600">{test.category.title}</span>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
            test.difficulty
          )}`}
        >
          {test.difficulty || "medium"}
        </span>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        Created: {new Date(test.createdAt).toLocaleDateString()}
      </div>

      {/* Manage Questions Button */}
      <button
        onClick={() => onManageDetails(test)}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Manage Questions
      </button>
    </div>
  );
};

const TestModal = ({
  test,
  formData,
  setFormData,
  categories,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {test ? "Edit Test" : "Create Test"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter test title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {test ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TestDetailsModal = ({ test, testDetails, onClose, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [detailForm, setDetailForm] = useState({
    condition: "",
    text: "",
  });

  const handleAddDetail = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...detailForm,
        parentId: test._id,
      };

      if (editingDetail) {
        await axios.put(`/test-detail/edit/${editingDetail._id}`, payload);
        toast.success("Question updated successfully");
      } else {
        await axios.post("/test-detail/create", payload);
        toast.success("Question added successfully");
      }

      setShowAddModal(false);
      setEditingDetail(null);
      setDetailForm({ condition: "", text: "" });
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEditDetail = (detail) => {
    setEditingDetail(detail);
    setDetailForm({
      condition: detail.condition,
      text: detail.text,
    });
    setShowAddModal(true);
  };

  const handleDeleteDetail = async (detailId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.put(`/test-detail/delete/${detailId}`);
        toast.success("Question deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete question");
      }
    }
  };

  const openAddModal = () => {
    setEditingDetail(null);
    setDetailForm({ condition: "", text: "" });
    setShowAddModal(true);
  };

  return (
    <>
      {!showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Manage Questions: {test?.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add and manage speech test questions
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openAddModal}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Question
                  </button>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {testDetails.length > 0 ? (
                <div className="space-y-4">
                  {testDetails.map((detail, index) => (
                    <div
                      key={detail._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                              Question {index + 1}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {detail.condition}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            "{detail.text}"
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditDetail(detail)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Edit"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteDetail(detail._id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">❓</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No questions yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add the first question to this test.
                  </p>
                  <button
                    onClick={openAddModal}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Question
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingDetail ? "Edit Question" : "Add New Question"}
              </h3>
            </div>

            <form onSubmit={handleAddDetail} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruction/Condition *
                </label>
                <input
                  type="text"
                  value={detailForm.condition}
                  onChange={(e) =>
                    setDetailForm({ ...detailForm, condition: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Read aloud the following text"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the instruction that tells the student what to do
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text to Read/Speak *
                </label>
                <textarea
                  value={detailForm.text}
                  onChange={(e) =>
                    setDetailForm({ ...detailForm, text: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter the text that the student should read/speak..."
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the actual text the student will read and record
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {editingDetail ? "Update Question" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTests;
