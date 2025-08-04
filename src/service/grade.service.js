import axios from "./api";
import { toast } from "react-hot-toast";

const GradeService = {
  // Get all grades
  async getAllGrades() {
    try {
      const { data } = await axios.get("/grade");
      return data;
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to load grades");
      throw error;
    }
  },

  // Get grade by ID with lessons
  async getGradeById(id) {
    try {
      const { data } = await axios.get(`/grade/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching grade:", error);
      toast.error("Failed to load grade details");
      throw error;
    }
  },

  // Create new grade (Admin only)
  async createGrade(gradeData) {
    try {
      const { data } = await axios.post("/grade", gradeData);
      if (data.status === "success") {
        toast.success("Grade created successfully!");
        return data;
      } else {
        toast.error(data.message || "Failed to create grade");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error creating grade:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create grade");
      }
      throw error;
    }
  },

  // Update grade (Admin only)
  async updateGrade(id, gradeData) {
    try {
      const { data } = await axios.put(`/grade/${id}`, gradeData);
      if (data.status === "success") {
        toast.success("Grade updated successfully!");
        return data;
      } else {
        toast.error(data.message || "Failed to update grade");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error updating grade:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update grade");
      }
      throw error;
    }
  },

  // Delete grade (Admin only)
  async deleteGrade(id) {
    try {
      const { data } = await axios.delete(`/grade/${id}`);
      if (data.status === "success") {
        toast.success("Grade deleted successfully!");
        return data;
      } else {
        toast.error(data.message || "Failed to delete grade");
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error deleting grade:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to delete grade");
      }
      throw error;
    }
  },
};

export default GradeService;
