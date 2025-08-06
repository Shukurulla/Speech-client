import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GradeService from "../service/grade.service";
import { HeroImage } from "../assets";
import { FiBook, FiBookOpen } from "react-icons/fi";
import ResponsiveLayout from "../components/Layout";

const Grade = () => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await GradeService.getAllGrades();
      if (response.status === "success") {
        setGrades(response.data);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSelect = (grade) => {
    // Navigate to grade lessons
    navigate(`/grade/${grade._id}`, { state: { grade } });
  };

  return (
    <ResponsiveLayout
      activePage={
        <div className="max-w-7xl mx-auto">
          {/* Grades Section */}
          <div className="mb-8">
            <h2 className="text-4xl font-[500] text-[#083156] mb-4 leading-tight">
              Choose Your Grade Level
            </h2>
            <p className="text-lg text-[#3D4D5C] mb-6 leading-relaxed">
              Select your grade to access lessons, practice exercises, and
              speaking tests.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : grades.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {grades.map((grade) => (
                  <GradeCard
                    key={grade._id}
                    grade={grade}
                    onSelect={() => handleGradeSelect(grade)}
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
        </div>
      }
      activeTab={"Grades"}
    />
  );
};

const GradeCard = ({ grade, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <span className="text-3xl text-gray-700">
            <FiBookOpen />
          </span>
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
        <span>View Lessons & Tests</span>
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

export default Grade;
