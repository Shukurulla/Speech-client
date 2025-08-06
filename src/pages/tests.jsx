import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SpeechTest from "../components/SpeechTest";
import TestService from "../service/test.service";
import GradeService from "../service/grade.service";
import LessonService from "../service/lesson.service";
import {
  FiBookOpen,
  FiCamera,
  FiMessageSquare,
  FiPaperclip,
} from "react-icons/fi";

const Tests = () => {
  const { isLoading } = useSelector((state) => state.category);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTestDetail, setSelectedTestDetail] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [grades, setGrades] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [allTests, setAllTests] = useState([]);
  const [testDetails, setTestDetails] = useState([]);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchGrades();
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

  const fetchGrades = async () => {
    try {
      const response = await GradeService.getAllGrades();
      if (response.status === "success") {
        setGrades(response.data);
        if (response.data.length > 0) {
          setSelectedGrade(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchLessons = async () => {
    if (!selectedGrade) return;

    try {
      const response = await LessonService.getLessonsByGrade(selectedGrade._id);
      if (response.status === "success") {
        setLessons(response.data);
        if (response.data.length > 0) {
          setSelectedLesson(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const fetchTests = async () => {
    if (!selectedLesson) return;

    try {
      const response = await TestService.getAllTests();
      if (response.status === "success") {
        // Filter tests by lesson (assuming tests now have lessonId)
        const lessonTests = response.data.filter(
          (test) => test.lessonId === selectedLesson._id
        );
        setAllTests(lessonTests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  const fetchTestDetails = async (testId) => {
    try {
      const response = await TestService.getTestById(testId);
      if (response.status === "success") {
        setTestDetails(response.data.testItems);
        return response.data.testItems;
      }
    } catch (error) {
      console.error("Error fetching test details:", error);
      return [];
    }
  };

  const handleSelectTest = async (test) => {
    setSelectedTest(test);
    const details = await fetchTestDetails(test._id);
    setCurrentDetailIndex(0);
  };

  const handleSelectTestDetail = (detail, index) => {
    setSelectedTestDetail(detail);
    setCurrentDetailIndex(index);
  };

  const handleBackToGrades = () => {
    setSelectedGrade(null);
    setSelectedLesson(null);
    setSelectedTest(null);
    setSelectedTestDetail(null);
    setLessons([]);
    setAllTests([]);
    setTestDetails([]);
    setCurrentDetailIndex(0);
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setSelectedTest(null);
    setSelectedTestDetail(null);
    setAllTests([]);
    setTestDetails([]);
    setCurrentDetailIndex(0);
  };

  const handleBackToTests = () => {
    setSelectedTest(null);
    setSelectedTestDetail(null);
    setTestDetails([]);
    setCurrentDetailIndex(0);
  };

  const handleBackToTestDetails = () => {
    setSelectedTestDetail(null);
  };

  const handleNextDetail = () => {
    if (currentDetailIndex < testDetails.length - 1) {
      const nextIndex = currentDetailIndex + 1;
      setCurrentDetailIndex(nextIndex);
      setSelectedTestDetail(testDetails[nextIndex]);
    } else {
      // If no more details, go back to test list
      handleBackToTests();
    }
  };

  // Show individual speech test
  if (selectedTestDetail) {
    return (
      <div>
        <SpeechTest
          testDetail={selectedTestDetail}
          onNext={handleNextDetail}
          onBack={handleBackToTestDetails}
          hasNext={currentDetailIndex < testDetails.length - 1}
        />
      </div>
    );
  }

  // Show test details list
  if (selectedTest && testDetails.length > 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleBackToTests}
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
          Back to Tests
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedTest.title}
          </h1>
          <p className="text-lg text-gray-600">
            {selectedGrade?.name} - {selectedLesson?.title}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testDetails.map((detail, index) => (
            <TestDetailCard
              key={detail._id}
              detail={detail}
              index={index + 1}
              onSelect={() => handleSelectTestDetail(detail, index)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Show tests list for selected lesson
  if (selectedLesson && allTests.length >= 0) {
    return (
      <div className="max-w-7xl mx-auto">
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedLesson.title} - Tests
          </h1>
          <p className="text-lg text-gray-600">
            {selectedGrade?.name} - Lesson {selectedLesson.orderNumber}
          </p>
        </div>

        {allTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                onSelectTest={() => handleSelectTest(test)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <FiPaperclip />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tests available
            </h3>
            <p className="text-gray-600">
              Tests for this lesson haven't been created yet.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Show lessons list for selected grade
  if (selectedGrade && lessons.length >= 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleBackToGrades}
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
          Back to Grades
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedGrade.name} - Lessons
          </h1>
          <p className="text-lg text-gray-600">Choose a lesson to practice</p>
        </div>

        {lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                onSelectLesson={() => setSelectedLesson(lesson)}
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

  // Show grades list (main view)
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
        <div className="flex-1 mb-6 lg:mb-0">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            My Tests
          </h1>
          <p className="text-lg text-gray-600">
            Choose your grade level to start practicing and improve your
            speaking skills!
          </p>
        </div>
        <div className="ml-8 hidden lg:block">
          <div className="w-64 h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center relative">
            <div className="text-white text-6xl">📚</div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-green-400 rounded-md rotate-12"></div>
          </div>
        </div>
      </div>

      {/* Grades Grid */}
      {grades.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {grades.map((grade) => (
            <GradeCard
              key={grade._id}
              grade={grade}
              onSelectGrade={() => setSelectedGrade(grade)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No grades available
          </h3>
          <p className="text-gray-600">
            Please contact your administrator to set up grade levels.
          </p>
        </div>
      )}
    </div>
  );
};

const GradeCard = ({ grade, onSelectGrade }) => {
  return (
    <div
      onClick={onSelectGrade}
      className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <span className="text-3xl">📚</span>
        </div>
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors"
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

      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {grade.name}
      </h3>

      {grade.description && (
        <p className="text-gray-600 mb-4">{grade.description}</p>
      )}

      <div className="flex items-center text-blue-600 font-medium">
        <span>View Lessons</span>
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
  );
};

const LessonCard = ({ lesson, onSelectLesson }) => {
  return (
    <div
      onClick={onSelectLesson}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
          <span className="text-green-600 text-xl font-bold">
            {lesson.orderNumber}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {lesson.audioFiles && lesson.audioFiles.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              🎵 {lesson.audioFiles.length}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
        {lesson.title}
      </h3>

      {lesson.description && (
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {lesson.description}
        </p>
      )}

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center text-green-600 font-medium text-sm">
          <span>Start Practice</span>
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

const TestCard = ({ test, onSelectTest }) => {
  const getCategoryIcon = (categoryTitle) => {
    switch (categoryTitle) {
      case "Read Aloud":
        return <FiMic />;
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
      onClick={onSelectTest}
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

const TestDetailCard = ({ detail, index, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
          {index}
        </div>
        <span className="text-sm text-gray-500 font-medium">
          Question {index}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {detail.condition}
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
        {detail.text}
      </p>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center text-blue-600 font-medium text-sm">
          <span>Start Question</span>
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

export default Tests;
