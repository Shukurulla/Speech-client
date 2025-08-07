import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import axios from "../../service/api";
import { toast } from "react-hot-toast";
import {
  FiBook,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronRight,
  FiMusic,
  FiPaperclip,
} from "react-icons/fi";

const AdminGrades = () => {
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGrades, setExpandedGrades] = useState(new Set());
  const [gradeLessons, setGradeLessons] = useState({});
  const [gradeTests, setGradeTests] = useState({});
  const [showModals, setShowModals] = useState({
    grade: false,
    lesson: false,
    test: false,
    dictionary: false,
  });
  const [editingItems, setEditingItems] = useState({
    grade: null,
    lesson: null,
    test: null,
  });
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [categories, setCategories] = useState([]);

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
    type: "speech", // speech or listening
  });

  useEffect(() => {
    fetchGrades();
    fetchCategories();
  }, []);

  const fetchGrades = async () => {
    try {
      const { data } = await axios.get("/grade");
      setGrades(data.data);
    } catch (error) {
      toast.error("Failed to load grades");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/category/list");
      setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchLessons = async (gradeId) => {
    if (gradeLessons[gradeId]) return;

    try {
      const { data } = await axios.get(`/lesson/grade/${gradeId}`);
      setGradeLessons((prev) => ({ ...prev, [gradeId]: data.data }));

      // Fetch tests for each lesson
      data.data.forEach((lesson) => fetchTestsForLesson(lesson._id));
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const fetchTestsForLesson = async (lessonId) => {
    try {
      const { data } = await axios.get("/test/all");
      const lessonTests = data.data.filter(
        (test) => test.lessonId === lessonId
      );
      setGradeTests((prev) => ({ ...prev, [lessonId]: lessonTests }));
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  const toggleGradeExpand = (gradeId) => {
    const newExpanded = new Set(expandedGrades);
    if (newExpanded.has(gradeId)) {
      newExpanded.delete(gradeId);
    } else {
      newExpanded.add(gradeId);
      fetchLessons(gradeId);
    }
    setExpandedGrades(newExpanded);
  };

  // Grade CRUD
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItems.grade) {
        await axios.put(`/grade/${editingItems.grade._id}`, gradeForm);
        toast.success("Grade updated successfully");
      } else {
        await axios.post("/grade", gradeForm);
        toast.success("Grade created successfully");
      }
      closeModals();
      fetchGrades();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const deleteGrade = async (gradeId) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await axios.delete(`/grade/${gradeId}`);
        toast.success("Grade deleted successfully");
        fetchGrades();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete grade");
      }
    }
  };

  // Lesson CRUD
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", lessonForm.title);
    formData.append("description", lessonForm.description);
    formData.append("gradeId", selectedGrade._id);
    if (lessonForm.orderNumber) {
      formData.append("orderNumber", lessonForm.orderNumber);
    }
    lessonForm.audioFiles.forEach((file) => {
      formData.append("audioFiles", file);
    });

    try {
      if (editingItems.lesson) {
        await axios.put(`/lesson/${editingItems.lesson._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Lesson updated successfully");
      } else {
        await axios.post("/lesson", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Lesson created successfully");
      }
      closeModals();
      // Refresh lessons for this grade
      delete gradeLessons[selectedGrade._id];
      fetchLessons(selectedGrade._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const deleteLesson = async (lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await axios.delete(`/lesson/${lessonId}`);
        toast.success("Lesson deleted successfully");
        // Refresh lessons
        delete gradeLessons[selectedGrade._id];
        fetchLessons(selectedGrade._id);
      } catch (error) {
        toast.error("Failed to delete lesson");
      }
    }
  };

  // Test CRUD
  const handleTestSubmit = async (e) => {
    e.preventDefault();
    const testData = {
      ...testForm,
      lessonId: selectedLesson._id,
      gradeId: selectedGrade._id,
    };

    try {
      if (editingItems.test) {
        await axios.put(`/test/${editingItems.test._id}`, testData);
        toast.success("Test updated successfully");
      } else {
        await axios.post("/test/create", testData);
        toast.success("Test created successfully");
      }
      closeModals();
      fetchTestsForLesson(selectedLesson._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const deleteTest = async (testId) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        await axios.delete(`/test/${testId}`);
        toast.success("Test deleted successfully");
        fetchTestsForLesson(selectedLesson._id);
      } catch (error) {
        toast.error("Failed to delete test");
      }
    }
  };

  // Modal management
  const openGradeModal = (grade = null) => {
    setEditingItems((prev) => ({ ...prev, grade }));
    setGradeForm(
      grade
        ? { name: grade.name, description: grade.description || "" }
        : { name: "", description: "" }
    );
    setShowModals((prev) => ({ ...prev, grade: true }));
  };

  const openLessonModal = (grade, lesson = null) => {
    setSelectedGrade(grade);
    setEditingItems((prev) => ({ ...prev, lesson }));
    setLessonForm(
      lesson
        ? {
            title: lesson.title,
            description: lesson.description || "",
            orderNumber: lesson.orderNumber.toString(),
            audioFiles: [],
          }
        : {
            title: "",
            description: "",
            orderNumber: "",
            audioFiles: [],
          }
    );
    setShowModals((prev) => ({ ...prev, lesson: true }));
  };

  const openTestModal = (grade, lesson, test = null) => {
    setSelectedGrade(grade);
    setSelectedLesson(lesson);
    setEditingItems((prev) => ({ ...prev, test }));
    setTestForm(
      test
        ? {
            title: test.title,
            categoryId: test.category._id,
            difficulty: test.difficulty || "medium",
            type: test.type || "speech",
          }
        : {
            title: "",
            categoryId: "",
            difficulty: "medium",
            type: "speech",
          }
    );
    setShowModals((prev) => ({ ...prev, test: true }));
  };

  const closeModals = () => {
    setShowModals({
      grade: false,
      lesson: false,
      test: false,
      dictionary: false,
    });
    setEditingItems({ grade: null, lesson: null, test: null });
    setSelectedGrade(null);
    setSelectedLesson(null);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Grades Management
            </h1>
            <p className="text-gray-600">
              Manage grades, lessons, and tests in one place
            </p>
          </div>
          <button
            onClick={() => openGradeModal()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FiPlus /> Add Grade
          </button>
        </div>

        {/* Grades List */}
        <div className="space-y-4">
          {grades.map((grade) => (
            <GradeAccordion
              key={grade._id}
              grade={grade}
              isExpanded={expandedGrades.has(grade._id)}
              onToggle={() => toggleGradeExpand(grade._id)}
              lessons={gradeLessons[grade._id] || []}
              tests={gradeTests}
              onEditGrade={() => openGradeModal(grade)}
              onDeleteGrade={() => deleteGrade(grade._id)}
              onAddLesson={() => openLessonModal(grade)}
              onEditLesson={(lesson) => openLessonModal(grade, lesson)}
              onDeleteLesson={deleteLesson}
              onAddTest={(lesson) => openTestModal(grade, lesson)}
              onEditTest={(lesson, test) => openTestModal(grade, lesson, test)}
              onDeleteTest={deleteTest}
            />
          ))}
        </div>

        {/* Modals */}
        {showModals.grade && (
          <GradeModal
            grade={editingItems.grade}
            formData={gradeForm}
            setFormData={setGradeForm}
            onSubmit={handleGradeSubmit}
            onClose={closeModals}
          />
        )}

        {showModals.lesson && (
          <LessonModal
            lesson={editingItems.lesson}
            formData={lessonForm}
            setFormData={setLessonForm}
            selectedGrade={selectedGrade}
            onSubmit={handleLessonSubmit}
            onClose={closeModals}
          />
        )}

        {showModals.test && (
          <TestModal
            test={editingItems.test}
            formData={testForm}
            setFormData={setTestForm}
            categories={categories}
            selectedGrade={selectedGrade}
            selectedLesson={selectedLesson}
            onSubmit={handleTestSubmit}
            onClose={closeModals}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Grade Accordion Component
const GradeAccordion = ({
  grade,
  isExpanded,
  onToggle,
  lessons,
  tests,
  onEditGrade,
  onDeleteGrade,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddTest,
  onEditTest,
  onDeleteTest,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Grade Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiBook className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {grade.name}
              </h3>
              {grade.description && (
                <p className="text-gray-600 text-sm">{grade.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{lessons.length} lessons</span>
                <span>
                  {
                    Object.values(tests)
                      .flat()
                      .filter((t) => t.gradeId === grade._id).length
                  }{" "}
                  tests
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAddLesson()}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
            >
              <FiPlus size={14} /> Lesson
            </button>
            <button
              onClick={onEditGrade}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={onDeleteGrade}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6">
          {lessons.length > 0 ? (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <LessonItem
                  key={lesson._id}
                  lesson={lesson}
                  tests={tests[lesson._id] || []}
                  onEdit={() => onEditLesson(lesson)}
                  onDelete={() => onDeleteLesson(lesson._id)}
                  onAddTest={() => onAddTest(lesson)}
                  onEditTest={(test) => onEditTest(lesson, test)}
                  onDeleteTest={onDeleteTest}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiBook className="mx-auto text-4xl mb-2 opacity-50" />
              <p>No lessons yet. Create your first lesson!</p>
              <button
                onClick={() => onAddLesson()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Lesson
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Lesson Item Component
const LessonItem = ({
  lesson,
  tests,
  onEdit,
  onDelete,
  onAddTest,
  onEditTest,
  onDeleteTest,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <FiChevronDown size={16} />
            ) : (
              <FiChevronRight size={16} />
            )}
          </button>
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 font-bold text-sm">
              {lesson.orderNumber}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{tests.length} tests</span>
              {lesson.audioFiles?.length > 0 && (
                <span className="flex items-center gap-1">
                  <FiMusic size={12} /> {lesson.audioFiles.length}
                </span>
              )}
              {lesson.dictionaries?.length > 0 && (
                <span>{lesson.dictionaries.length} words</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onAddTest}
            className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs hover:bg-purple-200 transition-colors flex items-center gap-1"
          >
            <FiPlus size={12} /> Test
          </button>
          <button
            onClick={onEdit}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 ml-8 space-y-2">
          {tests.length > 0 ? (
            tests.map((test) => (
              <div
                key={test._id}
                className="bg-white rounded p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <FiPaperclip className="text-purple-600" />
                  <div>
                    <span className="font-medium text-sm">{test.title}</span>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{test.category.title}</span>
                      <span className="px-1 py-0.5 bg-gray-100 rounded">
                        {test.difficulty}
                      </span>
                      {test.type && (
                        <span className="px-1 py-0.5 bg-blue-100 text-blue-600 rounded">
                          {test.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEditTest(test)}
                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <FiEdit2 size={12} />
                  </button>
                  <button
                    onClick={() => onDeleteTest(test._id)}
                    className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">
              No tests yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Modal Components
const GradeModal = ({ grade, formData, setFormData, onSubmit, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          {grade ? "Edit Grade" : "Create Grade"}
        </h2>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="e.g., 8-sinf, 9-sinf"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
          />
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
            {grade ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const LessonModal = ({
  lesson,
  formData,
  setFormData,
  selectedGrade,
  onSubmit,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          {lesson ? "Edit Lesson" : "Create Lesson"} - {selectedGrade?.name}
        </h2>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Number
            </label>
            <input
              type="number"
              value={formData.orderNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  orderNumber: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="1"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio Files
          </label>
          <input
            type="file"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                audioFiles: Array.from(e.target.files),
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            accept="audio/*"
            multiple
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: MP3, WAV, OGG, M4A, AAC (Max 50MB per file)
          </p>
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
            {lesson ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const TestModal = ({
  test,
  formData,
  setFormData,
  categories,
  selectedGrade,
  selectedLesson,
  onSubmit,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          {test ? "Edit Test" : "Create Test"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {selectedGrade?.name} - {selectedLesson?.title}
        </p>
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
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="speech">Speech Test</option>
            <option value="listening">Listening Test</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
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
              setFormData((prev) => ({ ...prev, difficulty: e.target.value }))
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

export default AdminGrades;
