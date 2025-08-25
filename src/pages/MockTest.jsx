import React, { useState, useEffect } from "react";
import {
  FiBook,
  FiHeadphones,
  FiMic,
  FiPlay,
  FiCheck,
  FiClock,
  FiAward,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";

const MockTest = ({ gradeId, onComplete, onBack }) => {
  const [mockTestQuestions, setMockTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testPhase, setTestPhase] = useState("overview"); // overview, testing, completed
  const [testResults, setTestResults] = useState([]);
  const [testStartTime, setTestStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMockTestQuestions();
  }, [gradeId]);

  const fetchMockTestQuestions = async () => {
    try {
      setIsLoading(true);
      // Fetch mock test data - this would come from your API
      // For now, using mock data
      const mockData = generateMockTestData();
      setMockTestQuestions(mockData);
    } catch (error) {
      console.error("Error fetching mock test:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockTestData = () => {
    // This would be replaced with actual API call
    const questions = [];
    for (let i = 1; i <= 20; i++) {
      questions.push({
        id: i,
        lessonNumber: i,
        lessonTitle: `Lesson ${i}`,
        type: i % 2 === 0 ? "listening" : "speech",
        question: {
          condition: i % 2 === 0 
            ? "Listen carefully and write what you hear"
            : "Read the following text aloud",
          text: `This is sample text for lesson ${i}. Practice your ${i % 2 === 0 ? 'listening' : 'speaking'} skills.`,
        }
      });
    }
    return questions;
  };

  const startMockTest = () => {
    setTestPhase("testing");
    setTestStartTime(Date.now());
    setCurrentQuestionIndex(0);
    setTestResults([]);
  };

  const handleQuestionComplete = (questionId, score, userAnswer) => {
    const result = {
      questionId,
      score,
      userAnswer,
      timestamp: Date.now(),
    };

    setTestResults(prev => [...prev, result]);

    if (currentQuestionIndex < mockTestQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeMockTest();
    }
  };

  const completeMockTest = () => {
    const totalScore = testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length;
    const timeTaken = Math.round((Date.now() - testStartTime) / 1000);

    setTestPhase("completed");
    
    if (onComplete) {
      onComplete({
        score: Math.round(totalScore),
        timeTaken,
        totalQuestions: mockTestQuestions.length,
        results: testResults,
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < mockTestQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Test Overview Screen
  if (testPhase === "overview") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Mock Test</h1>
            <p className="text-blue-100">
              Complete assessment covering all 20 lessons
            </p>
          </div>

          {/* Test Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiBook className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">20</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiClock className="text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">40</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiAward className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">80%</div>
                    <div className="text-sm text-gray-600">Pass Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Structure */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Test Structure
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FiMic className="text-blue-600" />
                  <span className="text-gray-700">10 Speaking Questions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiHeadphones className="text-purple-600" />
                  <span className="text-gray-700">10 Listening Questions</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-2">
                Important Instructions:
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Ensure you have a working microphone for speaking tests</li>
                <li>• Find a quiet place to complete the test</li>
                <li>• You cannot pause once the test begins</li>
                <li>• Each question is taken from your completed lessons</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Lessons
              </button>
              <button
                onClick={startMockTest}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Start Mock Test
                <FiArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test Completed Screen
  if (testPhase === "completed") {
    const totalScore = testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length;
    const passed = totalScore >= 80;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`p-8 text-white ${passed ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-orange-600'}`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAward className={`text-3xl ${passed ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Mock Test Completed!
              </h1>
              <p className="text-xl">
                {passed ? 'Congratulations! You passed!' : 'Keep practicing!'}
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {Math.round(totalScore)}%
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {testResults.filter(r => r.score >= 70).length}/{mockTestQuestions.length}
                </div>
                <div className="text-sm text-gray-600">Questions Passed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {Math.round((Date.now() - testStartTime) / 60000)} min
                </div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>

            {/* Detailed Results by Lesson */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Results by Lesson
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      Lesson {mockTestQuestions[index]?.lessonNumber}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        result.score >= 80 ? 'bg-green-100 text-green-800' :
                        result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setTestPhase("overview");
                  setTestResults([]);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Retake Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Testing Phase - would show actual test components
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {mockTestQuestions.length}
            </span>
            <span className="text-sm text-gray-500">
              {mockTestQuestions[currentQuestionIndex]?.lessonTitle}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / mockTestQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {mockTestQuestions[currentQuestionIndex]?.type === "listening" 
              ? "Listening Test" 
              : "Speaking Test"}
          </h3>
          <p className="text-gray-600 mb-8">
            From: {mockTestQuestions[currentQuestionIndex]?.lessonTitle}
          </p>
          
          {/* This is where you'd render the actual SpeechTest or ListeningTest component */}
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-500">
              [Test Component Would Be Here]
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <FiArrowLeft className="mr-2" />
            Previous
          </button>
          
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            {currentQuestionIndex === mockTestQuestions.length - 1 ? "Complete Test" : "Next"}
            <FiArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockTest;