import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SpeechTest from "../components/SpeechTest";
import TestService from "../service/test.service";

const Tests = () => {
  const { isLoading } = useSelector((state) => state.category);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTestDetail, setSelectedTestDetail] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [allTests, setAllTests] = useState([]);
  const [testDetails, setTestDetails] = useState([]);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchAllTests();
  }, []);

  const fetchAllTests = async () => {
    try {
      const response = await TestService.getAllTests();
      if (response.status === "success") {
        setAllTests(response.data);
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

  const testCategories = [
    {
      id: 1,
      title: "Read Aloud",
      icon: "🎤",
      description: "Practice reading text aloud with proper pronunciation",
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: 2,
      title: "Read, then Speak",
      icon: "📖",
      description: "Read text and then speak about it",
      color: "bg-green-50 text-green-600",
    },
    {
      id: 3,
      title: "Speaking Sample",
      icon: "💬",
      description: "Practice speaking with sample prompts",
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: 4,
      title: "Speak about the Photo",
      icon: "📷",
      description: "Describe what you see in photos",
      color: "bg-orange-50 text-orange-600",
    },
    {
      id: 5,
      title: "Listen, then Speak",
      icon: "👂",
      description: "Listen to audio and respond appropriately",
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  const filteredTests =
    activeCategory === "All"
      ? allTests
      : allTests.filter((test) => test.category.title === activeCategory);

  const handleSelectTest = async (test) => {
    setSelectedTest(test);
    const details = await fetchTestDetails(test._id);
    setCurrentDetailIndex(0);
  };

  const handleSelectTestDetail = (detail, index) => {
    setSelectedTestDetail(detail);
    setCurrentDetailIndex(index);
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
            Category: {selectedTest.category.title}
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
        <div className="flex-1 mb-6 lg:mb-0">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            My Tests
          </h1>
          <p className="text-lg text-gray-600">
            Practice speaking, take the test, and see your result, improve
            fluency, vocabulary, and confidence!
          </p>
        </div>
        <div className="ml-8 hidden lg:block">
          {/* Illustration */}
          <div className="w-64 h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center relative">
            <div className="text-white text-6xl">📊</div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-green-400 rounded-md rotate-12"></div>
          </div>
        </div>
      </div>

      {/* Test Categories Filter */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Test section</h2>
        <p className="text-gray-600 mb-6">
          Improve your speaking skill practicing each question type.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === "All"
                ? "bg-yellow-400 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {testCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.title)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === category.title
                  ? "bg-yellow-400 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => {
          const categoryInfo =
            testCategories.find((cat) => cat.title === test.category.title) ||
            testCategories[0];
          return (
            <TestCard
              key={test._id}
              test={test}
              categoryInfo={categoryInfo}
              onSelectTest={() => handleSelectTest(test)}
            />
          );
        })}
      </div>
    </div>
  );
};

const TestCard = ({ test, categoryInfo, onSelectTest }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${categoryInfo.color} rounded-xl flex items-center justify-center text-2xl`}
        >
          {categoryInfo.icon}
        </div>
        <span className="text-sm text-gray-500 font-medium">0/6</span>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {test.title}
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {categoryInfo.description}
      </p>

      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={onSelectTest}
          className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors flex items-center"
        >
          Start Practice
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
        </button>
      </div>
    </div>
  );
};

const TestDetailCard = ({ detail, index, onSelect }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
          {index}
        </div>
        <span className="text-sm text-gray-500 font-medium">Test {index}</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {detail.condition}
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
        {detail.text}
      </p>

      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={onSelect}
          className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors flex items-center"
        >
          Start Test
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
        </button>
      </div>
    </div>
  );
};

export default Tests;
