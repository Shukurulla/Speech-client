// src/pages/Practice.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Practice = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Start your speaking journey today!
            </h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Join hundreds of students who have improved their speaking skills.
            </p>
            <button
              onClick={() => navigate("/tests")}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Explore
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              {/* 3D Isometric Illustration */}
              <div className="w-80 h-80 bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-3xl transform rotate-12 flex items-center justify-center shadow-2xl relative overflow-hidden">
                {/* Man illustration */}
                <div className="transform -rotate-12 flex flex-col items-center">
                  <div className="relative">
                    {/* Body */}
                    <div className="w-16 h-24 bg-blue-600 rounded-t-2xl rounded-b-lg"></div>
                    {/* Head */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-yellow-200 rounded-full"></div>
                    {/* Hair */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-10 h-6 bg-gray-800 rounded-t-full"></div>
                    {/* Megaphone */}
                    <div className="absolute -right-8 top-2 w-12 h-4 bg-white rounded-r-full flex items-center">
                      <div className="w-3 h-3 bg-gray-600 rounded-full ml-1"></div>
                    </div>
                    {/* Speech lines */}
                    <div className="absolute -right-16 top-0">
                      <div className="w-4 h-1 bg-white rounded mb-1 opacity-80"></div>
                      <div className="w-6 h-1 bg-white rounded mb-1 opacity-60"></div>
                      <div className="w-8 h-1 bg-white rounded opacity-40"></div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-white bg-opacity-30 rounded transform rotate-45"></div>
                <div className="absolute bottom-6 left-4 w-4 h-4 bg-white bg-opacity-20 rounded-full"></div>
                <div className="absolute top-1/2 left-2 w-3 h-3 bg-white bg-opacity-25 rounded transform rotate-12"></div>

                {/* Additional floating elements */}
                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-yellow-300 rounded-lg rotate-45"></div>
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-300 rounded-md rotate-12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Options Section */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Do you want to practice?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          No problem! Practice with our collection of reference materials and
          practice exercises.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Practice Test Card */}
          <div
            onClick={() => navigate("/tests")}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                <span className="text-2xl">🎤</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Take a practice test
                </h3>
                <div className="flex items-center text-blue-600 font-medium">
                  <span className="mr-1">PRACTICE FREE</span>
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Full Practice Card */}
          <div
            onClick={() => navigate("/tests")}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-100 transition-colors">
                <span className="text-2xl">📊</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Take a full practice
                </h3>
                <div className="flex items-center text-blue-600 font-medium">
                  <span className="mr-1">LEARN MORE</span>
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Targeted Practice
          </h3>
          <p className="text-gray-600 text-sm">
            Focus on specific speaking skills with our structured practice
            modules
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📈</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Track Progress
          </h3>
          <p className="text-gray-600 text-sm">
            Monitor your improvement with detailed scoring and feedback
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏆</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Achieve Goals
          </h3>
          <p className="text-gray-600 text-sm">
            Reach your speaking proficiency goals with personalized training
          </p>
        </div>
      </div>
    </div>
  );
};

export default Practice;
