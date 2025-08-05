import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import LessonService from "../service/lesson.service";
import ResponsiveLayout from "../components/Layout";

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
          <div className="">
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
            <div className="text-gray-400 text-6xl mb-4">📖</div>
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
  return (
    <div
      //   onClick={onSelect}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300  group"
    >
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
            <p className="text-gray-600 mt-3 text-sm leading-relaxed ">
              {lesson.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {lesson.audioFiles && lesson.audioFiles.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              🎵 {lesson.audioFiles.length}
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-gray-800 font-medium text-sm">
          <span>Audio files ({lesson.audioFiles.length})</span>
          <span
            className="cursor-pointer"
            onClick={() =>
              showAccType == "audios"
                ? setShowAccType(null)
                : setShowAccType("audios")
            }
          >
            Show
          </span>
        </div>
        {showAccType == "audios" && (
          <div className="space-y-2 mt-4">
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

export default GradeLessons;
