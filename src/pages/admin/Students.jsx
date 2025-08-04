import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import axios from "../../service/api";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [currentPage, searchTerm]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/users", {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
        },
      });
      setStudents(data.data.users);
      setTotalPages(data.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const viewStudentDetails = async (studentId) => {
    try {
      const { data } = await axios.get(`/admin/users/${studentId}`);
      setSelectedStudent(data.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Students Management
          </h1>
          <p className="text-gray-600">Manage and view student information</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Student
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Tests Taken
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Average Score
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Best Score
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Joined
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-red-600 font-semibold">
                              {student.firstname[0]}
                              {student.lastname[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.firstname} {student.lastname}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.stats.totalTests}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-medium ${
                            student.stats.avgScore >= 80
                              ? "text-green-600"
                              : student.stats.avgScore >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {Math.round(student.stats.avgScore)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-blue-600">
                          {student.stats.bestScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewStudentDetails(student._id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Student Details Modal */}
        {selectedStudent && (
          <StudentDetailsModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

const StudentDetailsModal = ({ student, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Student Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Student Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">
                    {student.user.firstname} {student.user.lastname}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{student.user.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Joined:</span>
                  <span className="ml-2 font-medium">
                    {new Date(student.user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <h4 className="text-md font-semibold text-gray-900 mt-6 mb-3">
                Statistics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-600 font-semibold">
                    {student.stats.totalTests}
                  </p>
                  <p className="text-sm text-gray-600">Total Tests</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-600 font-semibold">
                    {Math.round(student.stats.avgScore)}%
                  </p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-600 font-semibold">
                    {student.stats.bestScore}%
                  </p>
                  <p className="text-sm text-gray-600">Best Score</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-600 font-semibold">
                    {Math.round(student.stats.totalTime / 60)} min
                  </p>
                  <p className="text-sm text-gray-600">Total Time</p>
                </div>
              </div>
            </div>

            {/* Recent Test Results */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Test Results
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {student.testResults.length > 0 ? (
                  student.testResults.map((result) => (
                    <div
                      key={result._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {result.lessonId?.title}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            result.score >= 80
                              ? "bg-green-100 text-green-800"
                              : result.score >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {result.score}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{result.gradeId?.name}</span>
                        <span>
                          {new Date(result.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {result.correctAnswers}/{result.totalQuestions} correct
                        • {Math.round(result.timeTaken / 60)} min
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No test results yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
