import axios from "./api";
import { toast } from "react-hot-toast";

const AdminService = {
  // Dashboard data
  async getDashboardData() {
    try {
      const { data } = await axios.get("/admin/dashboard");
      return data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      throw error;
    }
  },

  // Users management
  async getUsers(params = {}) {
    try {
      const { data } = await axios.get("/admin/users", { params });
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      throw error;
    }
  },

  async getUserById(id) {
    try {
      const { data } = await axios.get(`/admin/users/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
      throw error;
    }
  },

  // Test results management
  async getTestResults(params = {}) {
    try {
      const { data } = await axios.get("/admin/results", { params });
      return data;
    } catch (error) {
      console.error("Error fetching test results:", error);
      toast.error("Failed to load test results");
      throw error;
    }
  },

  async exportTestResults(params = {}) {
    try {
      const { data } = await axios.get("/admin/export/results", { params });
      return data;
    } catch (error) {
      console.error("Error exporting test results:", error);
      toast.error("Failed to export test results");
      throw error;
    }
  },

  // Utility functions
  convertToCSV(data) {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) =>
          typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value
        )
        .join(",")
    );

    return [headers, ...rows].join("\n");
  },

  downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Statistics helpers
  calculateAverageScore(results) {
    if (!results || results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / results.length);
  },

  calculateSuccessRate(results, passingScore = 60) {
    if (!results || results.length === 0) return 0;
    const passedCount = results.filter(
      (result) => result.score >= passingScore
    ).length;
    return Math.round((passedCount / results.length) * 100);
  },

  getScoreDistribution(results) {
    if (!results || results.length === 0) return {};

    const distribution = {
      excellent: 0, // 90-100
      good: 0, // 75-89
      average: 0, // 60-74
      poor: 0, // 0-59
    };

    results.forEach((result) => {
      if (result.score >= 90) distribution.excellent++;
      else if (result.score >= 75) distribution.good++;
      else if (result.score >= 60) distribution.average++;
      else distribution.poor++;
    });

    return distribution;
  },

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  },

  formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  getGradeColor(score) {
    if (score >= 90)
      return { bg: "bg-green-100", text: "text-green-800", label: "Excellent" };
    if (score >= 75)
      return { bg: "bg-blue-100", text: "text-blue-800", label: "Good" };
    if (score >= 60)
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Average" };
    return { bg: "bg-red-100", text: "text-red-800", label: "Poor" };
  },

  getDifficultyColor(difficulty) {
    switch (difficulty) {
      case "easy":
        return { bg: "bg-green-100", text: "text-green-800" };
      case "medium":
        return { bg: "bg-yellow-100", text: "text-yellow-800" };
      case "hard":
        return { bg: "bg-red-100", text: "text-red-800" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800" };
    }
  },

  // Validation helpers
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validateRequired(value, fieldName) {
    if (!value || value.toString().trim() === "") {
      toast.error(`${fieldName} is required`);
      return false;
    }
    return true;
  },

  validateNumberRange(value, min, max, fieldName) {
    if (value < min || value > max) {
      toast.error(`${fieldName} must be between ${min} and ${max}`);
      return false;
    }
    return true;
  },

  // Error handling
  handleApiError(error, defaultMessage = "An error occurred") {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error(defaultMessage);
    }
    console.error("API Error:", error);
  },

  // Local storage helpers for admin preferences
  saveAdminPreference(key, value) {
    try {
      localStorage.setItem(`admin_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving admin preference:", error);
    }
  },

  getAdminPreference(key, defaultValue = null) {
    try {
      const saved = localStorage.getItem(`admin_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error("Error getting admin preference:", error);
      return defaultValue;
    }
  },

  removeAdminPreference(key) {
    try {
      localStorage.removeItem(`admin_${key}`);
    } catch (error) {
      console.error("Error removing admin preference:", error);
    }
  },
};

export default AdminService;
