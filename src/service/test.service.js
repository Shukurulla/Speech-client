import axios from "./api";
import { toast } from "react-hot-toast";

const TestService = {
  // Get all tests
  async getAllTests() {
    try {
      const { data } = await axios.get("/test/all");
      return data;
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to load tests");
      throw error;
    }
  },

  // Get test by ID with details
  async getTestById(id) {
    try {
      const { data } = await axios.get(`/test/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching test:", error);
      toast.error("Failed to load test details");
      throw error;
    }
  },

  // Complete a test and submit score
  async completeTest(testId, score) {
    try {
      const { data } = await axios.post(`/test/complate-test/${testId}`, {
        score: Math.round(score),
      });

      if (data.status === "success") {
        toast.success("Test completed successfully!");
        return data;
      } else {
        toast.error(data.message || "Failed to submit test result");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error completing test:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to submit test result");
      }
      throw error;
    }
  },

  // Get user's completed tests
  async getUserTests() {
    try {
      const { data } = await axios.get("/user/profile");
      if (data.status === "success") {
        return data.user.complateTests || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching user tests:", error);
      toast.error("Failed to load your test history");
      throw error;
    }
  },

  // Get test statistics
  async getTestStatistics(testId) {
    try {
      const { data } = await axios.get(`/test/statistics/${testId}`);
      return data;
    } catch (error) {
      console.error("Error fetching test statistics:", error);
      return null;
    }
  },

  // Search tests by category
  async getTestsByCategory(categoryId) {
    try {
      const { data } = await axios.get(`/test/category/${categoryId}`);
      return data;
    } catch (error) {
      console.error("Error fetching tests by category:", error);
      toast.error("Failed to load category tests");
      throw error;
    }
  },

  // Get test details by parent ID (for test items)
  async getTestDetails(parentId) {
    try {
      const { data } = await axios.get(`/test-detail/parent/${parentId}`);
      return data;
    } catch (error) {
      console.error("Error fetching test details:", error);
      toast.error("Failed to load test questions");
      throw error;
    }
  },

  // Submit individual test detail result
  async submitTestDetailResult(
    testDetailId,
    userAnswer,
    score,
    audioBlob = null
  ) {
    try {
      const formData = new FormData();
      formData.append("testDetailId", testDetailId);
      formData.append("userAnswer", userAnswer);
      formData.append("score", Math.round(score));

      if (audioBlob) {
        formData.append("audio", audioBlob, "recording.wav");
      }

      const { data } = await axios.post("/test/submit-detail", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.status === "success") {
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error submitting test detail result:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to submit answer");
      }
      throw error;
    }
  },

  // Get leaderboard for a specific test
  async getTestLeaderboard(testId, limit = 10) {
    try {
      const { data } = await axios.get(
        `/test/leaderboard/${testId}?limit=${limit}`
      );
      return data;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return { status: "error", data: [] };
    }
  },

  // Get user's best score for a test
  async getUserBestScore(testId) {
    try {
      const { data } = await axios.get(`/test/best-score/${testId}`);
      return data;
    } catch (error) {
      console.error("Error fetching best score:", error);
      return { status: "error", score: 0 };
    }
  },

  // Calculate text similarity score (client-side helper)
  calculateSimilarityScore(originalText, spokenText) {
    if (!spokenText || !spokenText.trim()) return 0;

    const original = originalText.toLowerCase().trim();
    const spoken = spokenText.toLowerCase().trim();

    // Split into words
    const originalWords = original
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const spokenWords = spoken.split(/\s+/).filter((word) => word.length > 0);

    if (originalWords.length === 0) return 0;

    // Calculate word matches
    let exactMatches = 0;
    let partialMatches = 0;

    originalWords.forEach((originalWord) => {
      const exactMatch = spokenWords.find(
        (spokenWord) => spokenWord === originalWord
      );

      if (exactMatch) {
        exactMatches++;
      } else {
        const partialMatch = spokenWords.find(
          (spokenWord) =>
            spokenWord.includes(originalWord) ||
            originalWord.includes(spokenWord) ||
            this.levenshteinDistance(originalWord, spokenWord) <= 2
        );

        if (partialMatch) {
          partialMatches++;
        }
      }
    });

    // Calculate scores
    const exactScore = (exactMatches / originalWords.length) * 100;
    const partialScore = (partialMatches / originalWords.length) * 50;

    // Length penalty/bonus
    const lengthRatio = spokenWords.length / originalWords.length;
    const lengthFactor = lengthRatio > 1.5 || lengthRatio < 0.5 ? 0.8 : 1;

    // Final score calculation
    const finalScore = Math.round((exactScore + partialScore) * lengthFactor);

    return Math.max(0, Math.min(100, finalScore));
  },

  // Levenshtein distance helper for fuzzy matching
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  },

  // Validate audio recording
  validateAudioRecording(audioBlob) {
    if (!audioBlob) return false;

    // Check if audio blob has content
    if (audioBlob.size === 0) return false;

    // Check if it's a valid audio type
    const validTypes = ["audio/wav", "audio/webm", "audio/mp4", "audio/ogg"];
    return validTypes.includes(audioBlob.type);
  },

  // Format test duration
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  // Get difficulty level based on score
  getDifficultyLevel(score) {
    if (score >= 90) return { level: "Expert", color: "green" };
    if (score >= 75) return { level: "Advanced", color: "blue" };
    if (score >= 60) return { level: "Intermediate", color: "yellow" };
    if (score >= 40) return { level: "Beginner", color: "orange" };
    return { level: "Needs Practice", color: "red" };
  },

  // Generate performance feedback
  generateFeedback(score, originalText, spokenText) {
    const feedback = {
      score,
      level: this.getDifficultyLevel(score),
      suggestions: [],
    };

    if (score < 40) {
      feedback.suggestions.push("Practice speaking more slowly and clearly");
      feedback.suggestions.push("Try to pronounce each word distinctly");
      feedback.suggestions.push("Practice with shorter sentences first");
    } else if (score < 60) {
      feedback.suggestions.push("Focus on word accuracy");
      feedback.suggestions.push("Practice common pronunciation patterns");
      feedback.suggestions.push(
        "Record yourself and compare with the original"
      );
    } else if (score < 75) {
      feedback.suggestions.push("Work on fluency and natural rhythm");
      feedback.suggestions.push("Practice with longer passages");
      feedback.suggestions.push("Focus on intonation and stress patterns");
    } else if (score < 90) {
      feedback.suggestions.push("Excellent! Fine-tune your pronunciation");
      feedback.suggestions.push("Practice with more complex vocabulary");
      feedback.suggestions.push("Work on maintaining consistency");
    } else {
      feedback.suggestions.push("Outstanding performance!");
      feedback.suggestions.push("Try more challenging content");
      feedback.suggestions.push("Consider helping others improve");
    }

    return feedback;
  },

  // Export test results
  async exportTestResults(format = "json") {
    try {
      const userTests = await this.getUserTests();

      if (format === "csv") {
        return this.convertToCSV(userTests);
      }

      return JSON.stringify(userTests, null, 2);
    } catch (error) {
      console.error("Error exporting test results:", error);
      toast.error("Failed to export test results");
      throw error;
    }
  },

  // Convert test results to CSV
  convertToCSV(testResults) {
    if (!testResults || testResults.length === 0) {
      return "testId,score,completeDate\n";
    }

    const headers = "testId,score,completeDate\n";
    const rows = testResults
      .map((test) => `${test.testId},${test.score},${test.complateDate}`)
      .join("\n");

    return headers + rows;
  },

  // Check if user can retake test
  canRetakeTest(testId, userTests, cooldownHours = 24) {
    if (!userTests || userTests.length === 0) return true;

    const lastAttempt = userTests
      .filter((test) => test.testId === testId)
      .sort((a, b) => new Date(b.complateDate) - new Date(a.complateDate))[0];

    if (!lastAttempt) return true;

    const timeDiff = Date.now() - new Date(lastAttempt.complateDate).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    return hoursDiff >= cooldownHours;
  },
};

export default TestService;
