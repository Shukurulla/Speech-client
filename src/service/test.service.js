import axios from "./api";

const TestService = {
  async getAllTests() {
    try {
      const { data } = await axios.get("/test/all");
      return data;
    } catch (error) {
      console.error("Error fetching tests:", error);
      throw error;
    }
  },

  async getTestById(id) {
    try {
      const { data } = await axios.get(`/test/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching test:", error);
      throw error;
    }
  },

  async completeTest(testId, score) {
    try {
      const { data } = await axios.post(`/test/complate-test/${testId}`, {
        score,
      });
      return data;
    } catch (error) {
      console.error("Error completing test:", error);
      throw error;
    }
  },
};

export default TestService;
