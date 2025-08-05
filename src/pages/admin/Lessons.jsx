import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import axios from "../../service/api";
import { toast } from "react-hot-toast";

const AdminLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gradeId: "",
    orderNumber: "",
  });
  const [audioFiles, setAudioFiles] = useState([]);

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchLessons();
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
      console.error("Error fetching grades:", error);
    }
  };

  const fetchLessons = async () => {
    if (!selectedGrade) return;

    try {
      setIsLoading(true);
      const { data } = await axios.get(`/lesson/grade/${selectedGrade}`);
      setLessons(data.data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("description", formData.description);
    formDataObj.append("gradeId", formData.gradeId || selectedGrade);
    if (formData.orderNumber) {
      formDataObj.append("orderNumber", formData.orderNumber);
    }

    // Add audio files
    audioFiles.forEach((file) => {
      formDataObj.append("audioFiles", file);
    });

    try {
      if (editingLesson) {
        await axios.put(`/lesson/${editingLesson._id}`, formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Lesson updated successfully");
      } else {
        await axios.post("/lesson", formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Lesson created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchLessons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setEditingLesson(null);
    setFormData({ title: "", description: "", gradeId: "", orderNumber: "" });
    setAudioFiles([]);
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      gradeId: lesson.gradeId,
      orderNumber: lesson.orderNumber.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (lessonId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this lesson? All audio files will be removed."
      )
    ) {
      try {
        await axios.delete(`/lesson/${lessonId}`);
        toast.success("Lesson deleted successfully");
        fetchLessons();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete lesson");
      }
    }
  };

  const handleDeleteAudioFile = async (lessonId, audioId) => {
    if (window.confirm("Are you sure you want to delete this audio file?")) {
      try {
        await axios.delete(`/lesson/${lessonId}/audio/${audioId}`);
        toast.success("Audio file deleted successfully");
        fetchLessons();
      } catch (error) {
        toast.error("Failed to delete audio file");
      }
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lessons Management
            </h1>
            <p className="text-gray-600">Manage lessons and audio materials</p>
          </div>
          <button
            onClick={openCreateModal}
            disabled={!selectedGrade}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add Lesson
          </button>
        </div>

        {/* Grade Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Select Grade:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {grades.map((grade) => (
                <option key={grade._id} value={grade._id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : lessons.length > 0 ? (
            lessons.map((lesson) => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDeleteAudio={handleDeleteAudioFile}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No lessons found
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first lesson for this grade.
              </p>
              <button
                onClick={openCreateModal}
                disabled={!selectedGrade}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Add Lesson
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <LessonModal
            lesson={editingLesson}
            formData={formData}
            setFormData={setFormData}
            audioFiles={audioFiles}
            setAudioFiles={setAudioFiles}
            grades={grades}
            selectedGrade={selectedGrade}
            onSubmit={handleSubmit}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </AdminLayout>
  );
};
const DictionaryModal = ({ setState, setFormData, lesson }) => {
  const [uz, setUz] = useState("");
  const [en, setEn] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `/lesson/${lesson._id}/create-dictionary`,
        { uz, en }
      );
      if (data.status == "success") {
        setState("");
        toast.success("Dictionary added successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English *
              </label>
              <input
                type="text"
                value={en}
                onChange={(e) => setEn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="English"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uzbek *
              </label>
              <input
                type="text"
                value={uz}
                onChange={(e) => setUz(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Uzbek"
                required
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div
              onClick={() => setState("")}
              className="flex-1 px-4 py-2 border text-center cursor-pointer border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {"Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LessonCard = ({ lesson, onEdit, onDelete, onDeleteAudio }) => {
  const [showAudioFiles, setShowAudioFiles] = useState(false);
  const [dictionaryModal, setDictionaryModal] = useState("");

  useEffect(() => {
    console.log(dictionaryModal);
  }, [dictionaryModal]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        {dictionaryModal ? (
          <DictionaryModal setState={setDictionaryModal} lesson={lesson} />
        ) : (
          ""
        )}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-xl font-bold">
              {lesson.orderNumber}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {lesson.title}
            </h3>
            {lesson.description && (
              <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className="text-gray-600 px-2 rounded-md border"
            onClick={() => setDictionaryModal(true)}
          >
            Aa
          </button>
          <button
            onClick={() => onEdit(lesson)}
            className="text-blue-600 hover:text-blue-700 p-2"
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
            onClick={() => onDelete(lesson._id)}
            className="text-red-600 hover:text-red-700 p-2"
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

      {/* Audio Files */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            Audio Files ({lesson.audioFiles?.length || 0})
          </span>
          <button
            onClick={() => setShowAudioFiles(!showAudioFiles)}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            {showAudioFiles ? "Hide" : "Show"}
          </button>
        </div>

        {showAudioFiles && (
          <div className="space-y-2">
            {lesson.audioFiles?.length > 0 ? (
              lesson.audioFiles.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-600">🎵</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <audio controls className="h-8">
                      <source src={file.url} />
                    </audio>
                    <button
                      onClick={() => onDeleteAudio(lesson._id, file._id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete audio"
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
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No audio files
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const LessonModal = ({
  lesson,
  formData,
  setFormData,
  audioFiles,
  setAudioFiles,
  grades,
  selectedGrade,
  onSubmit,
  onClose,
}) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAudioFiles([...audioFiles, ...files]);
  };

  const removeFile = (index) => {
    setAudioFiles(audioFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {lesson ? "Edit Lesson" : "Create Lesson"}
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

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Lesson title"
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
                  setFormData({ ...formData, orderNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Auto-generated if empty"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <select
              value={formData.gradeId || selectedGrade}
              onChange={(e) =>
                setFormData({ ...formData, gradeId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
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
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio Files
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              accept="audio/*"
              multiple
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: MP3, WAV, OGG, M4A, AAC (Max 50MB per file)
            </p>

            {audioFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Selected files:
                </p>
                {audioFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-600">🎵</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700 p-1"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
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
};

export default AdminLessons;
