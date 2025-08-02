import React from "react";
import { useNavigate } from "react-router-dom";
import { HeroImage } from "../assets";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <div className="row items-center justify-between">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <h1 className="text-4xl font-[500] text-[#083156]  mb-4 leading-tight">
              Start your speaking journey today!
            </h1>
            <p className="text-lg text-[#3D4D5C] mb-6 leading-relaxed">
              Join hundreds of students who have improved their speaking skills.
            </p>
            <button
              onClick={() => navigate("/tests")}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Explore
            </button>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 py-3 flex items-center justify-center ">
            {/* 3D Isometric Illustration - Man with megaphone */}
            <img src={HeroImage} className="w-[70%]" alt="" />
          </div>
        </div>
      </div>

      {/* Practice Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-[500] text-[#083156]  mb-4 leading-tight">
          Do you want to practice?
        </h1>
        <p className="text-lg text-[#3D4D5C] mb-6 leading-relaxed">
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
    </div>
  );
};

export default Dashboard;
