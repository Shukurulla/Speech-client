import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import LessonService from "../service/lesson.service";
import ResponsiveLayout from "../components/Layout";
import { FiBook, FiBookOpen, FiMusic, FiVolume2 } from "react-icons/fi";

const GradeLessons = () => {
  const { gradeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const grade = location.state?.grade;

  useEffect(() => {
    if (gradeId) {
      fetchLessons();
    }
  }, [gradeId]);

  const fetchLessons = async () => {
    try {
      const response = await LessonService.getLessonsByGrade(gradeId);
      if (response.status === "success") {
        setLessons(response.data);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    navigate(`/lesson/${lesson._id}/tests`, {
      state: { lesson, grade },
    });
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  return (
    <ResponsiveLayout
      activePage={<GradeLessonsContent />}
      activeTab="Dashboard"
    />
  );

  function GradeLessonsContent() {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToDashboard}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {grade?.name || "Grade"} - Lessons
          </h1>
          <p className="text-lg text-gray-600">
            Choose a lesson to start practicing and taking tests
          </p>
        </div>

        {/* Lessons Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : lessons.length > 0 ? (
          <div className="space-y-6">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                onSelect={() => handleLessonSelect(lesson)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <FiBookOpen />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No lessons available
            </h3>
            <p className="text-gray-600">
              Lessons for this grade haven't been created yet.
            </p>
          </div>
        )}
      </div>
    );
  }
};

const LessonCard = ({ lesson, onSelect }) => {
  const [showAccType, setShowAccType] = useState(null);
  const [showDictionary, setShowDictionary] = useState(false);

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <span className="text-green-600 text-xl font-bold">
                {lesson.orderNumber}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-green-600 transition-colors">
              {lesson.title}
            </h3>
          </div>
          {lesson.description && (
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              {lesson.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {lesson.audioFiles && lesson.audioFiles.length > 0 && (
            <span className="text-sm text-gray-500 flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
              <FiMusic /> {lesson.audioFiles.length}
            </span>
          )}
          {lesson.dictionaries && lesson.dictionaries.length > 0 && (
            <span className="text-sm text-gray-500 flex items-center gap-2 bg-purple-100 px-2 py-1 rounded">
              <FiBook /> {lesson.dictionaries.length}
            </span>
          )}
        </div>
      </div>

      {/* Dictionary Section */}
      {lesson.dictionaries && lesson.dictionaries.length > 0 && (
        <div className="mb-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-gray-800 font-medium text-sm">
            <span>Dictionary ({lesson.dictionaries.length} words)</span>
            <span
              className="cursor-pointer text-purple-600 hover:text-purple-700"
              onClick={() => setShowDictionary(!showDictionary)}
            >
              {showDictionary ? "Hide" : "Show"}
            </span>
          </div>
          {showDictionary && (
            <div className="mt-4">
              <div className="bg-purple-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lesson.dictionaries.map((dict, index) => (
                    <div
                      key={dict._id || index}
                      className="bg-white rounded-lg p-3 border border-purple-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-gray-900">
                            {dict.en}
                          </span>
                          <span className="text-gray-500 mx-2">→</span>
                          <span className="text-purple-700 font-medium">
                            {dict.uz}
                          </span>
                        </div>
                        <div
                          className="cursor-pointer text-gray-600"
                          onClick={() => speak(dict.en)}
                        >
                          <FiVolume2 />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio Files Section */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-gray-800 font-medium text-sm mb-3">
          <span>Audio files ({lesson.audioFiles?.length || 0})</span>
          <span
            className="cursor-pointer text-blue-600 hover:text-blue-700"
            onClick={() =>
              setShowAccType(showAccType === "audios" ? null : "audios")
            }
          >
            {showAccType === "audios" ? "Hide" : "Show"}
          </span>
        </div>
        {showAccType === "audios" && (
          <div className="space-y-2 mb-4">
            {lesson.audioFiles?.length > 0 ? (
              lesson.audioFiles.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-600">
                      <FiMusic size={20} />
                    </span>
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

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={onSelect}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            Start Tests
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeLessons;
