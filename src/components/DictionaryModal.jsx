// src/components/DictionaryModal.jsx
import React, { useState, useEffect } from "react";
import axios from "../service/api";
import { toast } from "react-hot-toast";
import {
  FiBook,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiVolume2,
  FiGlobe,
} from "react-icons/fi";

const DictionaryModal = ({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  onSuccess,
}) => {
  const [dictionaries, setDictionaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newWord, setNewWord] = useState({ en: "", uz: "" });
  const [editingId, setEditingId] = useState(null);
  const [editWord, setEditWord] = useState({ en: "", uz: "" });

  useEffect(() => {
    if (isOpen && lessonId) {
      fetchDictionaries();
    }
  }, [isOpen, lessonId]);

  const fetchDictionaries = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/lesson/${lessonId}/dictionaries`);
      if (data.status === "success") {
        setDictionaries(data.data.dictionaries || []);
      }
    } catch (error) {
      console.error("Error fetching dictionaries:", error);
      toast.error("Failed to load words");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.en.trim() || !newWord.uz.trim()) {
      toast.error("Please fill in both English and Uzbek words");
      return;
    }

    try {
      const { data } = await axios.post(
        `/lesson/${lessonId}/create-dictionary`,
        newWord
      );
      if (data.status === "success") {
        setNewWord({ en: "", uz: "" });
        fetchDictionaries();
        toast.success("Word added successfully!");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error adding word:", error);
      toast.error("Failed to add word");
    }
  };

  const handleUpdateWord = async (dictionaryId) => {
    if (!editWord.en.trim() || !editWord.uz.trim()) {
      toast.error("Please fill in both English and Uzbek words");
      return;
    }

    try {
      const { data } = await axios.put(
        `/lesson/${lessonId}/dictionary/${dictionaryId}`,
        editWord
      );
      if (data.status === "success") {
        setEditingId(null);
        setEditWord({ en: "", uz: "" });
        fetchDictionaries();
        toast.success("Word updated successfully!");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error updating word:", error);
      toast.error("Failed to update word");
    }
  };

  const handleDeleteWord = async (dictionaryId) => {
    if (!window.confirm("Are you sure you want to delete this word?")) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `/lesson/${lessonId}/dictionary/${dictionaryId}`
      );
      if (data.status === "success") {
        fetchDictionaries();
        toast.success("Word deleted successfully!");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error deleting word:", error);
      toast.error("Failed to delete word");
    }
  };

  const startEditing = (dict) => {
    setEditingId(dict._id);
    setEditWord({ en: dict.en, uz: dict.uz });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditWord({ en: "", uz: "" });
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FiBook className="text-gray-600" /> Dictionary Management
              </h2>
              <p className="mt-1 text-gray-600">Lesson: {lessonTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {/* Add New Word Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FiPlus /> Add New Word
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiGlobe className="inline mr-1" /> English
                </label>
                <input
                  type="text"
                  value={newWord.en}
                  onChange={(e) =>
                    setNewWord({ ...newWord, en: e.target.value })
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleAddWord()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter English word"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🇺🇿 Uzbek
                </label>
                <input
                  type="text"
                  value={newWord.uz}
                  onChange={(e) =>
                    setNewWord({ ...newWord, uz: e.target.value })
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleAddWord()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="O'zbekcha tarjima"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddWord}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <FiPlus /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Dictionary List */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Dictionary Words ({dictionaries.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : dictionaries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiBook size={48} className="mx-auto mb-3 opacity-50" />
                <p>No words added yet</p>
                <p className="text-sm mt-1">Add your first word above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dictionaries.map((dict, index) => (
                  <div
                    key={dict._id || index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {editingId === dict._id ? (
                      // Edit Mode
                      <div className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={editWord.en}
                          onChange={(e) =>
                            setEditWord({ ...editWord, en: e.target.value })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="English word"
                        />
                        <span className="text-gray-500">→</span>
                        <input
                          type="text"
                          value={editWord.uz}
                          onChange={(e) =>
                            setEditWord({ ...editWord, uz: e.target.value })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="O'zbekcha tarjima"
                        />
                        <button
                          onClick={() => handleUpdateWord(dict._id)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title="Save"
                        >
                          <FiSave />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          title="Cancel"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex justify-between items-center">
                        <div className="flex-1 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-lg">
                              {dict.en}
                            </span>
                            <button
                              onClick={() => speak(dict.en)}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                              title="Listen to pronunciation"
                            >
                              <FiVolume2 />
                            </button>
                          </div>
                          <span className="text-gray-500">→</span>
                          <span className="text-purple-700 font-medium text-lg">
                            {dict.uz}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(dict)}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteWord(dict._id)}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Total words: {dictionaries.length}
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DictionaryModal;
