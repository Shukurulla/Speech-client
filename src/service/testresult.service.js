import axios from "./api";
import { toast } from "react-hot-toast";

const TestResultService = {
  // Submit complete test result
  async submitTestResult(testData) {
    try {
      const {
        testId,
        lessonId,
        gradeId,
        score,
        totalQuestions,
        correctAnswers,
        timeTaken,
        answers = [],
        feedback = "",
      } = testData;

      const payload = {
        testId,
        lessonId,
        gradeId,
        score: Math.round(score),
        totalQuestions,
        correctAnswers,
        timeTaken: Math.round(timeTaken),
        answers,
        feedback,
      };

      const { data } = await axios.post("/test-result/submit", payload);

      if (data.status === "success") {
        toast.success("Test completed successfully!");
        return data;
      } else {
        toast.error(data.message || "Failed to submit test result");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error submitting test result:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to submit test result");
      }
      throw error;
    }
  },

  // Get user's test results
  async getMyResults(params = {}) {
    try {
      const { data } = await axios.get("/test-result/my-results", { params });
      return data;
    } catch (error) {
      console.error("Error fetching test results:", error);
      toast.error("Failed to load test results");
      throw error;
    }
  },

  // Get user test statistics
  async getMyStatistics() {
    try {
      const { data } = await axios.get("/test-result/statistics");
      return data;
    } catch (error) {
      console.error("Error fetching test statistics:", error);
      toast.error("Failed to load test statistics");
      throw error;
    }
  },

  // Get specific test result details
  async getResultById(id) {
    try {
      const { data } = await axios.get(`/test-result/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching test result:", error);
      toast.error("Failed to load test result details");
      throw error;
    }
  },

  // Delete test result
  async deleteResult(id) {
    try {
      const { data } = await axios.delete(`/test-result/${id}`);
      if (data.status === "success") {
        toast.success("Test result deleted successfully");
        return data;
      } else {
        toast.error(data.message || "Failed to delete test result");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error deleting test result:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to delete test result");
      }
      throw error;
    }
  },

  // Calculate test performance
  calculatePerformance(results) {
    if (!results || results.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        improvement: 0,
        recentAverage: 0,
      };
    }

    const totalTests = results.length;
    const scores = results.map((r) => r.score);
    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / totalTests;
    const bestScore = Math.max(...scores);

    // Calculate improvement (compare first half vs second half)
    const midPoint = Math.floor(totalTests / 2);
    const firstHalf = scores.slice(0, midPoint);
    const secondHalf = scores.slice(midPoint);

    const firstHalfAvg =
      firstHalf.length > 0
        ? firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length
        : 0;
    const secondHalfAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length
        : averageScore;

    const improvement = secondHalfAvg - firstHalfAvg;

    // Recent average (last 5 tests)
    const recentResults = results.slice(-5);
    const recentAverage =
      recentResults.length > 0
        ? recentResults.reduce((sum, r) => sum + r.score, 0) /
          recentResults.length
        : averageScore;

    return {
      totalTests,
      averageScore: Math.round(averageScore),
      bestScore,
      improvement: Math.round(improvement),
      recentAverage: Math.round(recentAverage),
    };
  },

  // Get performance level based on score
  getPerformanceLevel(score) {
    if (score >= 90) return { level: "Excellent", color: "green", icon: "🏆" };
    if (score >= 80) return { level: "Very Good", color: "blue", icon: "🌟" };
    if (score >= 70) return { level: "Good", color: "yellow", icon: "👍" };
    if (score >= 60) return { level: "Average", color: "orange", icon: "📈" };
    return { level: "Needs Improvement", color: "red", icon: "📚" };
  },

  // Generate performance feedback
  generateFeedback(score, averageScore, improvement) {
    const feedback = [];

    if (score >= 90) {
      feedback.push("Outstanding performance! Keep up the excellent work!");
    } else if (score >= 80) {
      feedback.push("Very good job! You're making great progress.");
    } else if (score >= 70) {
      feedback.push("Good work! Continue practicing to improve further.");
    } else if (score >= 60) {
      feedback.push("You're doing okay. Focus on areas that need improvement.");
    } else {
      feedback.push("Keep practicing! Every attempt helps you improve.");
    }

    if (improvement > 10) {
      feedback.push("Great improvement! Your hard work is paying off.");
    } else if (improvement > 5) {
      feedback.push("You're showing steady improvement. Keep it up!");
    } else if (improvement < -5) {
      feedback.push(
        "Don't get discouraged. Review your mistakes and try again."
      );
    }

    if (score > averageScore + 10) {
      feedback.push("This score is above your average! Well done!");
    } else if (score < averageScore - 10) {
      feedback.push(
        "This score is below your average. Consider more practice."
      );
    }

    return feedback;
  },

  // Format duration in minutes and seconds
  formatDuration(seconds) {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Check if user can retake test (based on cooldown period)
  canRetakeTest(lastAttempt, cooldownHours = 0) {
    if (!lastAttempt) return true;
    if (cooldownHours === 0) return true;

    const lastAttemptTime = new Date(lastAttempt.createdAt).getTime();
    const now = Date.now();
    const hoursPassed = (now - lastAttemptTime) / (1000 * 60 * 60);

    return hoursPassed >= cooldownHours;
  },

  // Export results to CSV
  exportToCSV(results) {
    if (!results || results.length === 0) {
      toast.error("No results to export");
      return;
    }

    const headers = [
      "Date",
      "Grade",
      "Lesson",
      "Score",
      "Correct Answers",
      "Total Questions",
      "Time Taken",
      "Attempt Number",
    ];

    const csvContent = [
      headers.join(","),
      ...results.map((result) =>
        [
          this.formatDate(result.createdAt),
          result.gradeId?.name || "N/A",
          result.lessonId?.title || "N/A",
          result.score,
          result.correctAnswers,
          result.totalQuestions,
          this.formatDuration(result.timeTaken),
          result.attemptNumber || 1,
        ].join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `test-results-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Results exported successfully!");
  },
};

export default TestResultService;
