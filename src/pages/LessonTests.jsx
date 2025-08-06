import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TestService from "../service/test.service";
import ResponsiveLayout from "../components/Layout";
import { toast } from "react-hot-toast";
import {
  FiBookOpen,
  FiCamera,
  FiCheck,
  FiMessageSquare,
  FiMic,
  FiPaperclip,
} from "react-icons/fi";

const LessonTests = () => {
  const { lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const lesson = location.state?.lesson;
  const grade = location.state?.grade;
  const completed = location.state?.completed;
  const score = location.state?.score;
  const correctAnswers = location.state?.correctAnswers;
  const totalQuestions = location.state?.totalQuestions;

  useEffect(() => {
    if (lessonId) {
      fetchTests();
    }

    // Show success message if test was completed
    if (completed && score !== undefined) {
      const percentage =
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 0;
      toast.success(
        `Test completed! Score: ${score}% (${correctAnswers}/${totalQuestions} correct)`,
        { duration: 5000 }
      );
    }
  }, [lessonId, completed, score, correctAnswers, totalQuestions]);

  const fetchTests = async () => {
    try {
      const response = await TestService.getAllTests();
      if (response.status === "success") {
        // Filter tests by lesson ID
        const lessonTests = response.data.filter(
          (test) => test.lessonId === lessonId
        );
        setTests(lessonTests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSelect = (test) => {
    navigate(`/test/${test._id}`, {
      state: { test, lesson, grade },
    });
  };

  const handleBackToLessons = () => {
    navigate(`/grade/${grade?._id}`, { state: { grade } });
  };

  return (
    <ResponsiveLayout
      activePage={<LessonTestsContent />}
      activeTab="Dashboard"
    />
  );

  function LessonTestsContent() {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToLessons}
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
          Back to Lessons
        </button>

        {/* Success Banner */}
        {completed && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-green-800">
                  <FiCheck /> Test Completed Successfully!
                </h3>
                <div className="mt-2 text-green-700">
                  <p>
                    <strong>Final Score:</strong> {score}%
                  </p>
                  <p>
                    <strong>Questions Answered:</strong> {correctAnswers} out of{" "}
                    {totalQuestions} correct
                  </p>
                  <p className="text-sm mt-1 opacity-90">
                    {score >= 90
                      ? "Excellent work! 🏆"
                      : score >= 80
                      ? "Great job! 🌟"
                      : score >= 70
                      ? "Good effort! 👍"
                      : score >= 60
                      ? "Keep practicing! 📈"
                      : "Don't give up! Try again! 💪"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {lesson?.title || "Lesson"} - Tests
          </h1>
          <p className="text-lg text-gray-600">
            {grade?.name} - Lesson {lesson?.orderNumber}
          </p>
        </div>

        {/* Tests Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                onSelect={() => handleTestSelect(test)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tests available
            </h3>
            <p className="text-gray-600 mb-4">
              Tests for this lesson haven't been created yet.
            </p>
            <p className="text-sm text-blue-600">
              Please contact your teacher to add tests to this lesson.
            </p>
          </div>
        )}
      </div>
    );
  }
};

const TestCard = ({ test, onSelect }) => {
  const getCategoryIcon = (categoryTitle) => {
    switch (categoryTitle) {
      case "Read Aloud":
        return <FiMic color="black" />;
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

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
          <span className="text-2xl">
            {getCategoryIcon(test.category.title)}
          </span>
        </div>
        {test.difficulty && (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
              test.difficulty
            )}`}
          >
            {test.difficulty}
          </span>
        )}
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
        {test.title}
      </h3>

      <p className="text-gray-600 text-sm mb-4">{test.category.title}</p>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center text-purple-600 font-medium text-sm">
          <span>Start Test</span>
          <svg
            className="w-4 h-4 ml-1"
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
        </div>
      </div>
    </div>
  );
};

export default LessonTests;
