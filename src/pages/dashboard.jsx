import React, { useState, useEffect } from "react";
import {
  FiBook,
  FiBookOpen,
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiClock,
  FiTarget,
  FiActivity,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { HeroImage } from "../assets";

const Dashboard = () => {
  const [grades, setGrades] = useState([]);
  const [gradeStats, setGradeStats] = useState({});
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Mock user data
  const user = { firstname: "Student" };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data for demonstration
      setGrades([
        {
          _id: "1",
          name: "8th Grade",
          description: "Foundation level English speaking skills",
        },
        {
          _id: "2",
          name: "9th Grade",
          description: "Intermediate English speaking and listening",
        },
      ]);

      setGradeStats({
        1: {
          lessonCount: 12,
          testCount: 24,
          avgScore: 78,
          completedLessons: 8,
          progress: 67,
        },
        2: {
          lessonCount: 15,
          testCount: 30,
          avgScore: 85,
          completedLessons: 5,
          progress: 33,
        },
      });

      setUserStats({
        totalTests: 45,
        averageScore: 81,
        bestScore: 95,
        totalTime: 2400, // in seconds
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSelect = (grade) => {
    navigate(`/grade/${grade._id}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.firstname || "Student";

    if (hour < 12) {
      return `Good morning, ${firstName}!`;
    } else if (hour < 18) {
      return `Good afternoon, ${firstName}!`;
    } else {
      return `Good evening, ${firstName}!`;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <div className="row items-center justify-between">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <h1 className="text-4xl font-[500] text-[#083156] mb-2 leading-tight">
              {getGreeting()}
            </h1>
            <h2 className="text-2xl font-[400] text-[#083156] mb-4 leading-tight">
              Ready to improve your speaking skills?
            </h2>
            <p className="text-lg text-[#3D4D5C] mb-6 leading-relaxed">
              Choose your grade level and start practicing with our interactive
              lessons and tests.
            </p>

            <button
              onClick={() => navigate("/results")}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              View My Progress
            </button>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 py-3 flex items-center justify-center">
            <div className="text-white text-6xl">
              <img src={HeroImage} alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
