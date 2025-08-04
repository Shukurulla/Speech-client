import axios from "./api";
import { toast } from "react-hot-toast";

const LessonService = {
  // Get lessons by grade
  async getLessonsByGrade(gradeId) {
    try {
      const { data } = await axios.get(`/lesson/grade/${gradeId}`);
      return data;
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to load lessons");
      throw error;
    }
  },

  // Get lesson by ID
  async getLessonById(id) {
    try {
      const { data } = await axios.get(`/lesson/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      toast.error("Failed to load lesson details");
      throw error;
    }
  },

  // Create new lesson (Admin only)
  async createLesson(lessonData) {
    try {
      const { data } = await axios.post("/lesson", lessonData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.status === "success") {
        toast.success("Lesson created successfully!");
        return data;
      } else {
        toast.error(data.message || "Failed to create lesson");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create lesson");
      }
      throw error;
    }
  },

  // Update lesson (Admin only)
  async updateLesson(id, lessonData) {
    try {
      const { data } = await axios.put(`/lesson/${id}`, lessonData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.status === "success") {
        toast.success("Lesson updated successfully!");
        return data;
      } else {
        toast.error(data.message || "Failed to update lesson");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error updating lesson:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update lesson");
      }
      throw error;
    }
  },

  // Delete lesson (Admin only)
  async deleteLesson(id) {
    try {
      const { data } = await axios.delete(`/lesson/${id}`);
      if (data.status === "success") {
        toast.success("Lesson deleted successfully!");
        return data;
      } else {
        toast.error(data.message || "Failed to delete lesson");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to delete lesson");
      }
      throw error;
    }
  },

  // Delete audio file from lesson (Admin only)
  async deleteAudioFile(lessonId, audioId) {
    try {
      const { data } = await axios.delete(
        `/lesson/${lessonId}/audio/${audioId}`
      );
      if (data.status === "success") {
        toast.success("Audio file deleted successfully!");
        return data;
      } else {
        toast.error(data.message || "Failed to delete audio file");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error deleting audio file:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to delete audio file");
      }
      throw error;
    }
  },

  // Get audio file URL
  getAudioFileUrl(lessonId, filename) {
    return `${axios.defaults.baseURL}/lesson/${lessonId}/audio/${filename}`;
  },

  // Validate audio file
  validateAudioFile(file) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
      "audio/aac",
    ];

    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only audio files (MP3, WAV, OGG, M4A, AAC) are allowed");
      return false;
    }

    return true;
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },
};

export default LessonService;
