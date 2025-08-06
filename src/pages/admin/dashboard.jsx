import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import axios from "../../service/api";
import { FiActivity, FiBook, FiBookOpen, FiUsers } from "react-icons/fi";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/admin/dashboard");
      setDashboardData(data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentResults = dashboardData?.recentResults || [];
  const gradeStats = dashboardData?.gradeStats || [];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to the admin panel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalUsers || 0}
            icon={<FiUsers />}
            color="bg-blue-500"
          />
          <StatCard
            title="Grades"
            value={stats.totalGrades || 0}
            icon={<FiBook />}
            color="bg-green-500"
          />
          <StatCard
            title="Lessons"
            value={stats.totalLessons || 0}
            icon={<FiBookOpen />}
            color="bg-purple-500"
          />
          <StatCard
            title="Test Results"
            value={stats.totalTests || 0}
            icon={<FiActivity />}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Test Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Test Results
              </h3>
            </div>
            <div className="p-6">
              {recentResults.length > 0 ? (
                <div className="space-y-4">
                  {recentResults.slice(0, 5).map((result) => (
                    <div
                      key={result._id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {result.userId?.firstname} {result.userId?.lastname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {result.gradeId?.name} - {result.lessonId?.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            result.score >= 80
                              ? "text-green-600"
                              : result.score >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {result.score}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No recent results
                </p>
              )}
            </div>
          </div>

          {/* Grade Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Grade Statistics
              </h3>
            </div>
            <div className="p-6">
              {gradeStats.length > 0 ? (
                <div className="space-y-4">
                  {gradeStats.map((stat) => (
                    <div
                      key={stat._id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {stat.grade?.[0]?.name || "Unknown Grade"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {stat.totalTests} tests completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          {Math.round(stat.avgScore)}% avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No grade statistics
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div
          className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl mr-4`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
