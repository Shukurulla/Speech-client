import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import axios from "../../service/api";
import { toast } from "react-hot-toast";
import {
  FiHeadphones,
  FiPlus,
  FiTrash2,
  FiPlay,
  FiPause,
  FiSave,
  FiArrowLeft,
  FiVolume2,
  FiEdit2,
  FiCheck,
} from "react-icons/fi";

const AdminListeningTestCreator = () => {
  const [grades, setGrades] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Test form state
  const [testForm, setTestForm] = useState({
    title: "",
    categoryId: "",
    difficulty: "medium",
    type: "listening",
  });

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    condition: "",
    text: "",
    isPlaying: false,
  });

  // Preview state
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchLessons();
    }
  }, [selectedGrade]);

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
      toast.error("Failed to load data");
    }
  };

  const fetchLessons = async () => {
    if (!selectedGrade) return;

    try {
      const { data } = await axios.get(`/lesson/grade/${selectedGrade}`);
      setLessons(data.data);
      if (data.data.length > 0) {
        setSelectedLesson(data.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  // Text-to-speech functions
  const playText = (text) => {
    if ("speechSynthesis" in window) {
      // Stop any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setCurrentQuestion((prev) => ({ ...prev, isPlaying: true }));
      };

      utterance.onend = () => {
        setCurrentQuestion((prev) => ({ ...prev, isPlaying: false }));
      };

      speechSynthesis.speak(utterance);
    } else {
      toast.error("Speech synthesis not supported in this browser");
    }
  };

  const stopSpeech = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setCurrentQuestion((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  const previewTextSpeech = (text, questionIndex) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setPreviewQuestion(questionIndex);
        setIsPreviewPlaying(true);
      };

      utterance.onend = () => {
        setPreviewQuestion(null);
        setIsPreviewPlaying(false);
      };

      speechSynthesis.speak(utterance);
    } else {
      toast.error("Speech synthesis not supported");
    }
  };

  const stopPreviewSpeech = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setPreviewQuestion(null);
      setIsPreviewPlaying(false);
    }
  };

  // Question management
  const addQuestion = () => {
    if (!currentQuestion.condition.trim() || !currentQuestion.text.trim()) {
      toast.error("Please fill in both instruction and text fields");
      return;
    }

    const newQuestion = {
      id: Date.now(),
      condition: currentQuestion.condition,
      text: currentQuestion.text,
      createdAt: new Date(),
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setCurrentQuestion({ condition: "", text: "", isPlaying: false });
    toast.success("Question added successfully");
  };

  const removeQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    toast.success("Question removed");
  };

  const editQuestion = (question) => {
    setCurrentQuestion({
      condition: question.condition,
      text: question.text,
      isPlaying: false,
      editingId: question.id,
    });
  };

  const updateQuestion = () => {
    if (!currentQuestion.condition.trim() || !currentQuestion.text.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === currentQuestion.editingId
          ? {
              ...q,
              condition: currentQuestion.condition,
              text: currentQuestion.text,
            }
          : q
      )
    );

    setCurrentQuestion({ condition: "", text: "", isPlaying: false });
    toast.success("Question updated successfully");
  };

  const cancelEdit = () => {
    setCurrentQuestion({ condition: "", text: "", isPlaying: false });
  };

  // Save test
  const saveTest = async () => {
    if (!testForm.title.trim()) {
      toast.error("Please enter test title");
      return;
    }

    if (!testForm.categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!selectedLesson) {
      toast.error("Please select a lesson");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setIsLoading(true);

    try {
      // Create the test
      const testData = {
        ...testForm,
        lessonId: selectedLesson,
        gradeId: selectedGrade,
      };

      const testResponse = await axios.post("/test/create", testData);

      if (testResponse.data.status === "success") {
        const testId = testResponse.data.data._id;

        // Add questions to the test
        for (const question of questions) {
          await axios.post("/test-detail/create", {
            condition: question.condition,
            text: question.text,
            parentId: testId,
          });
        }

        toast.success("Listening test created successfully!");

        // Reset form
        setTestForm({
          title: "",
          categoryId: "",
          difficulty: "medium",
          type: "listening",
        });
        setQuestions([]);
        setCurrentQuestion({ condition: "", text: "", isPlaying: false });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create test");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedGradeName =
    grades.find((g) => g._id === selectedGrade)?.name || "";
  const selectedLessonName =
    lessons.find((l) => l._id === selectedLesson)?.title || "";

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Listening Test
              </h1>
              <p className="text-gray-600">
                Create interactive listening comprehension tests
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiHeadphones className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Test Setup */}
          <div className="lg:col-span-1 space-y-6">
            {/* Test Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Test Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    value={testForm.title}
                    onChange={(e) =>
                      setTestForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Unit 1 Listening Comprehension"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson
                  </label>
                  <select
                    value={selectedLesson}
                    onChange={(e) => setSelectedLesson(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!selectedGrade}
                  >
                    <option value="">Choose a lesson</option>
                    {lessons.map((lesson) => (
                      <option key={lesson._id} value={lesson._id}>
                        {lesson.orderNumber}. {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={testForm.categoryId}
                    onChange={(e) =>
                      setTestForm((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    value={testForm.difficulty}
                    onChange={(e) =>
                      setTestForm((prev) => ({
                        ...prev,
                        difficulty: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {selectedGrade && selectedLesson && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-purple-800 text-sm">
                    <strong>Target:</strong> {selectedGradeName} →{" "}
                    {selectedLessonName}
                  </p>
                </div>
              )}
            </div>

            {/* Test Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Test Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-semibold text-purple-600">
                    {questions.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Type:</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-sm font-medium">
                    Listening Test
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated time:</span>
                  <span className="text-gray-900">
                    {questions.length * 2} min
                  </span>
                </div>
              </div>

              <button
                onClick={saveTest}
                disabled={
                  isLoading ||
                  questions.length === 0 ||
                  !testForm.title ||
                  !testForm.categoryId
                }
                className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  isLoading ||
                  questions.length === 0 ||
                  !testForm.title ||
                  !testForm.categoryId
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave /> Save Test
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Question Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Builder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentQuestion.editingId
                  ? "Edit Question"
                  : "Add New Question"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instruction/Task *
                  </label>
                  <input
                    type="text"
                    value={currentQuestion.condition}
                    onChange={(e) =>
                      setCurrentQuestion((prev) => ({
                        ...prev,
                        condition: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Listen carefully and write what you hear"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This instruction will be shown to the student
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text to be read aloud *
                  </label>
                  <div className="relative">
                    <textarea
                      value={currentQuestion.text}
                      onChange={(e) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          text: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                      placeholder="Enter the text that will be converted to speech and played to the student..."
                      rows={4}
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() =>
                          currentQuestion.isPlaying
                            ? stopSpeech()
                            : playText(currentQuestion.text)
                        }
                        disabled={!currentQuestion.text.trim()}
                        className={`p-2 rounded-lg transition-colors ${
                          !currentQuestion.text.trim()
                            ? "text-gray-400 cursor-not-allowed"
                            : currentQuestion.isPlaying
                            ? "text-red-600 hover:bg-red-50"
                            : "text-purple-600 hover:bg-purple-50"
                        }`}
                        title={
                          currentQuestion.isPlaying ? "Stop" : "Preview audio"
                        }
                      >
                        {currentQuestion.isPlaying ? <FiPause /> : <FiPlay />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This text will be converted to speech using text-to-speech
                    technology
                  </p>
                </div>

                <div className="flex space-x-3">
                  {currentQuestion.editingId ? (
                    <>
                      <button
                        onClick={updateQuestion}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FiCheck /> Update Question
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={addQuestion}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FiPlus /> Add Question
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Test Questions ({questions.length})
                </h3>
                {questions.length > 0 && (
                  <button
                    onClick={stopPreviewSpeech}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Stop All Audio
                  </button>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiHeadphones className="mx-auto text-4xl mb-2 opacity-50" />
                  <p>No questions added yet</p>
                  <p className="text-sm">
                    Add your first listening question above
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {question.condition}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Added{" "}
                              {new Date(
                                question.createdAt
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              previewQuestion === index && isPreviewPlaying
                                ? stopPreviewSpeech()
                                : previewTextSpeech(question.text, index)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              previewQuestion === index && isPreviewPlaying
                                ? "text-red-600 hover:bg-red-50"
                                : "text-purple-600 hover:bg-purple-50"
                            }`}
                            title="Preview audio"
                          >
                            {previewQuestion === index && isPreviewPlaying ? (
                              <FiPause />
                            ) : (
                              <FiVolume2 />
                            )}
                          </button>
                          <button
                            onClick={() => editQuestion(question)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit question"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete question"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 leading-relaxed">
                        "{question.text}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminListeningTestCreator;
