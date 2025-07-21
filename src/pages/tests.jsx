import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CategoryService from "../service/category.service";
import SpeechTest from "../components/SpeechTest";

const Tests = () => {
  const { isLoading } = useSelector((state) => state.category);
  const [selectedTest, setSelectedTest] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    CategoryService.getCategories(dispatch);
  }, []);

  const testCategories = [
    {
      id: 1,
      title: "Read Aloud",
      icon: "🎤",
      description: "Practice reading text aloud with proper pronunciation",
      progress: "0/6",
      color: "bg-blue-50 text-blue-600",
      sampleTexts: [
        "The study of language is known as linguistics.",
        "Climate change is one of the most pressing challenges of our time.",
        "Technology has revolutionized the way we communicate and work.",
        "Education plays a crucial role in shaping future generations.",
        "Renewable energy sources are becoming increasingly important.",
        "Cultural diversity enriches our understanding of the world.",
      ],
    },
    {
      id: 2,
      title: "Read, then Speak",
      icon: "📖",
      description: "Read text and then speak about it",
      progress: "0/6",
      color: "bg-green-50 text-green-600",
      sampleTexts: [
        "Digital transformation in business requires adaptation and innovation.",
        "Sustainable development goals aim to create a better future for all.",
        "Artificial intelligence is reshaping various industries worldwide.",
        "Global healthcare systems face numerous challenges and opportunities.",
        "Space exploration continues to push the boundaries of human knowledge.",
        "Social media has transformed how we share information and connect.",
      ],
    },
    {
      id: 3,
      title: "Speaking Sample",
      icon: "💬",
      description: "Practice speaking with sample prompts",
      progress: "0/6",
      color: "bg-purple-50 text-purple-600",
      sampleTexts: [
        "Describe your favorite hobby and explain why you enjoy it.",
        "Talk about a memorable travel experience you've had.",
        "Discuss the benefits and challenges of remote work.",
        "Explain how technology has changed daily life in recent years.",
        "Describe an important decision you made and its consequences.",
        "Talk about environmental issues that concern you most.",
      ],
    },
    {
      id: 4,
      title: "Speak about the Photo",
      icon: "📷",
      description: "Describe what you see in photos",
      progress: "0/6",
      color: "bg-orange-50 text-orange-600",
      sampleTexts: [
        "Describe what you see in this urban cityscape photograph.",
        "Talk about the natural landscape shown in this image.",
        "Explain the activities happening in this busy marketplace scene.",
        "Describe the architectural features visible in this building.",
        "Discuss the weather conditions evident in this outdoor scene.",
        "Analyze the composition and elements in this artistic photograph.",
      ],
    },
    {
      id: 5,
      title: "Listen, then Speak",
      icon: "👂",
      description: "Listen to audio and respond appropriately",
      progress: "0/6",
      color: "bg-indigo-50 text-indigo-600",
      sampleTexts: [
        "Listen to the news report and summarize the main points.",
        "Respond to the question about your opinion on the topic discussed.",
        "Analyze the arguments presented in the audio clip.",
        "Provide your perspective on the issue mentioned in the recording.",
        "Explain how the audio content relates to current events.",
        "Discuss your thoughts on the speaker's main message.",
      ],
    },
  ];

  const filteredCategories =
    activeCategory === "All"
      ? testCategories
      : testCategories.filter((cat) => cat.title === activeCategory);

  const handleStartTest = (category, textIndex = 0) => {
    setSelectedTest({
      category,
      text: category.sampleTexts[textIndex],
      textIndex,
    });
  };

  const handleBackToTests = () => {
    setSelectedTest(null);
  };

  const handleNextText = () => {
    if (
      selectedTest &&
      selectedTest.textIndex < selectedTest.category.sampleTexts.length - 1
    ) {
      setSelectedTest({
        ...selectedTest,
        textIndex: selectedTest.textIndex + 1,
        text: selectedTest.category.sampleTexts[selectedTest.textIndex + 1],
      });
    }
  };

  if (selectedTest) {
    return (
      <div>
        <button
          onClick={handleBackToTests}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-700 font-medium"
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
        <SpeechTest
          testText={selectedTest.text}
          category={selectedTest.category}
          onNext={handleNextText}
          hasNext={
            selectedTest.textIndex <
            selectedTest.category.sampleTexts.length - 1
          }
        />
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
        {filteredCategories.map((category) => (
          <TestCard
            key={category.id}
            category={category}
            onStartTest={() => handleStartTest(category)}
          />
        ))}
      </div>
    </div>
  );
};

const TestCard = ({ category, onStartTest }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-2xl`}
        >
          {category.icon}
        </div>
        <span className="text-sm text-gray-500 font-medium">
          {category.progress}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {category.title}
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {category.description}
      </p>

      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={onStartTest}
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

export default Tests;
