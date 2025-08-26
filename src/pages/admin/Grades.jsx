// src/pages/admin/AdminGrades.jsx
import React, { useState, useEffect } from "react";
import GradeService from "../../service/grade.service";
import LessonService from "../../service/lesson.service";
import TestService from "../../service/test.service";
import CategoryService from "../../service/category.service";
import AdminLayout from "../../components/admin/AdminLayout";
import DictionaryModal from "../../components/DictionaryModal";
import { toast } from "react-hot-toast";
import {
  FiBook,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMusic,
  FiSettings,
  FiChevronRight,
  FiFolder,
  FiFileText,
  FiGlobe,
  FiX,
  FiUpload,
  FiHeadphones,
  FiMic,
} from "react-icons/fi";

const AdminGrades = () => {
  const [grades, setGrades] = useState([]);
  const [lessons, setLessons] = useState({});
  const [categories, setCategories] = useState([]);
  const [expandedGrade, setExpandedGrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Modal states
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedGradeForLesson, setSelectedGradeForLesson] = useState(null);
  const [selectedLessonForTest, setSelectedLessonForTest] = useState(null);

  // Form states
  const [gradeForm, setGradeForm] = useState({ name: "", description: "" });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    orderNumber: "",
    audioFiles: [],
  });
  const [testForm, setTestForm] = useState({
    title: "",
    categoryId: "",
    difficulty: "medium",
    type: "speech",
  });
  const [audioFiles, setAudioFiles] = useState([]);

  useEffect(() => {
    fetchGrades();
    fetchCategories();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await GradeService.getAllGrades();
      if (response.status === "success") {
        setGrades(response.data);
        for (const grade of response.data) {
          fetchLessons(grade._id);
        }
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (gradeId) => {
    try {
      const response = await LessonService.getLessonsByGrade(gradeId);
      if (response.status === "success") {
        setLessons((prev) => ({
          ...prev,
          [gradeId]: response.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await CategoryService.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Grade handlers
  const handleAddGrade = async () => {
    try {
      if (!gradeForm.name) {
        toast.error("Grade name is required");
        return;
      }
      await GradeService.createGrade(gradeForm);
      setShowAddGradeModal(false);
      setGradeForm({ name: "", description: "" });
      fetchGrades();
    } catch (error) {
      console.error("Error adding grade:", error);
    }
  };

  const handleUpdateGrade = async () => {
    try {
      if (!gradeForm.name) {
        toast.error("Grade name is required");
        return;
      }
      await GradeService.updateGrade(editingGrade._id, gradeForm);
      setEditingGrade(null);
      setGradeForm({ name: "", description: "" });
      fetchGrades();
    } catch (error) {
      console.error("Error updating grade:", error);
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await GradeService.deleteGrade(gradeId);
        fetchGrades();
      } catch (error) {
        console.error("Error deleting grade:", error);
      }
    }
  };

  // Lesson handlers
  const handleAddLesson = async () => {
    try {
      if (!lessonForm.title) {
        toast.error("Lesson title is required");
        return;
      }

      const formData = new FormData();
      formData.append("title", lessonForm.title);
      formData.append("description", lessonForm.description);
      formData.append("gradeId", selectedGradeForLesson);
      if (lessonForm.orderNumber) {
        formData.append("orderNumber", lessonForm.orderNumber);
      }

      audioFiles.forEach((file) => {
        formData.append("audioFiles", file);
      });

      await LessonService.createLesson(formData);
      setShowAddLessonModal(false);
      setLessonForm({
        title: "",
        description: "",
        orderNumber: "",
        audioFiles: [],
      });
      setAudioFiles([]);
      fetchLessons(selectedGradeForLesson);
      toast.success("Lesson created successfully!");
    } catch (error) {
      console.error("Error adding lesson:", error);
    }
  };

  const handleDeleteLesson = async (lessonId, gradeId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await LessonService.deleteLesson(lessonId);
        fetchLessons(gradeId);
        toast.success("Lesson deleted successfully!");
      } catch (error) {
        console.error("Error deleting lesson:", error);
      }
    }
  };

  // Test handlers
  const handleAddTest = async () => {
    try {
      if (!testForm.title || !testForm.categoryId) {
        toast.error("Please fill in all required fields");
        return;
      }

      const testData = {
        title: testForm.title,
        categoryId: testForm.categoryId,
        difficulty: testForm.difficulty,
        type: testForm.type,
        gradeId: selectedLessonForTest.gradeId,
        lessonId: selectedLessonForTest._id,
      };

      await TestService.createTest(testData);
      setShowAddTestModal(false);
      setTestForm({
        title: "",
        categoryId: "",
        difficulty: "medium",
        type: "speech",
      });
      toast.success("Test created successfully!");
    } catch (error) {
      console.error("Error adding test:", error);
    }
  };

  const handleAudioFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAudioFiles(files);
  };

  const openAddLessonModal = (gradeId) => {
    setSelectedGradeForLesson(gradeId);
    setShowAddLessonModal(true);
  };

  const openAddTestModal = (lesson, gradeId) => {
    setSelectedLessonForTest({ ...lesson, gradeId });
    setShowAddTestModal(true);
  };

  const openDictionaryModal = (lesson) => {
    setSelectedLesson(lesson);
    setShowDictionaryModal(true);
  };

  const toggleGradeExpand = (gradeId) => {
    setExpandedGrade(expandedGrade === gradeId ? null : gradeId);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Grades & Curriculum Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage grades, lessons, vocabulary, and tests
              </p>
            </div>
            <button
              onClick={() => setShowAddGradeModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus /> Add Grade
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          /* Grades List */
          <div className="space-y-6">
            {grades.map((grade) => (
              <div
                key={grade._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Grade Header */}
                <div
                  className="bg-gray-50 border-b border-gray-200 p-5 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleGradeExpand(grade._id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FiFolder className="text-gray-600" /> {grade.name}
                      </h2>
                      {grade.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {grade.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>{lessons[grade._id]?.length || 0} lessons</span>
                        <span>
                          {lessons[grade._id]?.reduce(
                            (acc, lesson) =>
                              acc + (lesson.dictionaries?.length || 0),
                            0
                          ) || 0}{" "}
                          total words
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGrade(grade);
                          setGradeForm({
                            name: grade.name,
                            description: grade.description,
                          });
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGrade(grade._id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                      <FiChevronRight
                        className={`text-gray-400 transition-transform ${
                          expandedGrade === grade._id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Lessons List - Expanded */}
                {expandedGrade === grade._id && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700 text-lg">
                        Lessons
                      </h3>
                      <button
                        onClick={() => openAddLessonModal(grade._id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <FiPlus /> Add Lesson
                      </button>
                    </div>

                    {lessons[grade._id]?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lessons[grade._id].map((lesson) => (
                          <div
                            key={lesson._id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                                    Lesson {lesson.orderNumber}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-gray-900">
                                  {lesson.title}
                                </h4>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  handleDeleteLesson(lesson._id, grade._id)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>

                            {/* Lesson Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <FiBook className="text-purple-600" />
                                <span>
                                  {lesson.dictionaries?.length || 0} words
                                </span>
                              </div>
                              {lesson.audioFiles?.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <FiMusic className="text-blue-600" />
                                  <span>{lesson.audioFiles.length} audio</span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => openDictionaryModal(lesson)}
                                className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                              >
                                <FiGlobe size={14} />
                                Dictionary
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FiFolder
                          size={48}
                          className="mx-auto mb-3 opacity-50"
                        />
                        <p>No lessons added yet</p>
                        <button
                          onClick={() => openAddLessonModal(grade._id)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add First Lesson
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {grades.length === 0 && (
              <div className="text-center py-12">
                <FiFolder size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No grades created yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first grade
                </p>
                <button
                  onClick={() => setShowAddGradeModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Grade
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Grade Modal */}
        {(showAddGradeModal || editingGrade) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingGrade ? "Edit Grade" : "Add New Grade"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddGradeModal(false);
                    setEditingGrade(null);
                    setGradeForm({ name: "", description: "" });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Name *
                  </label>
                  <input
                    type="text"
                    value={gradeForm.name}
                    onChange={(e) =>
                      setGradeForm({ ...gradeForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 8-sinf, 9-sinf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={gradeForm.description}
                    onChange={(e) =>
                      setGradeForm({
                        ...gradeForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter grade description..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddGradeModal(false);
                    setEditingGrade(null);
                    setGradeForm({ name: "", description: "" });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingGrade ? handleUpdateGrade : handleAddGrade}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingGrade ? "Update" : "Add"} Grade
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Lesson Modal */}
        {showAddLessonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Lesson</h2>
                <button
                  onClick={() => {
                    setShowAddLessonModal(false);
                    setLessonForm({
                      title: "",
                      description: "",
                      orderNumber: "",
                      audioFiles: [],
                    });
                    setAudioFiles([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lesson Title *
                    </label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter lesson title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Number
                    </label>
                    <input
                      type="number"
                      value={lessonForm.orderNumber}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          orderNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter lesson description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audio Files (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          MP3, WAV, OGG, M4A, AAC (MAX. 50MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="audio/*"
                        multiple
                        onChange={handleAudioFileChange}
                      />
                    </label>
                  </div>
                  {audioFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {audioFiles.length} file(s) selected
                      </p>
                      <ul className="text-xs text-gray-500 mt-1">
                        {audioFiles.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddLessonModal(false);
                    setLessonForm({
                      title: "",
                      description: "",
                      orderNumber: "",
                      audioFiles: [],
                    });
                    setAudioFiles([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLesson}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Lesson
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Test Modal */}
        {showAddTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Add Test to {selectedLessonForTest?.title}
                </h2>
                <button
                  onClick={() => {
                    setShowAddTestModal(false);
                    setTestForm({
                      title: "",
                      categoryId: "",
                      difficulty: "medium",
                      type: "speech",
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    value={testForm.title}
                    onChange={(e) =>
                      setTestForm({ ...testForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter test title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={testForm.categoryId}
                    onChange={(e) =>
                      setTestForm({ ...testForm, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="speech"
                        checked={testForm.type === "speech"}
                        onChange={(e) =>
                          setTestForm({ ...testForm, type: e.target.value })
                        }
                        className="mr-2"
                      />
                      <FiMic className="mr-1" />
                      Speech
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="listening"
                        checked={testForm.type === "listening"}
                        onChange={(e) =>
                          setTestForm({ ...testForm, type: e.target.value })
                        }
                        className="mr-2"
                      />
                      <FiHeadphones className="mr-1" />
                      Listening
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={testForm.difficulty}
                    onChange={(e) =>
                      setTestForm({ ...testForm, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddTestModal(false);
                    setTestForm({
                      title: "",
                      categoryId: "",
                      difficulty: "medium",
                      type: "speech",
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Test
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dictionary Modal */}
        {selectedLesson && (
          <DictionaryModal
            isOpen={showDictionaryModal}
            onClose={() => {
              setShowDictionaryModal(false);
              setSelectedLesson(null);
              grades.forEach((grade) => fetchLessons(grade._id));
            }}
            lessonId={selectedLesson._id}
            lessonTitle={selectedLesson.title}
            onSuccess={() => {
              grades.forEach((grade) => fetchLessons(grade._id));
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminGrades;
