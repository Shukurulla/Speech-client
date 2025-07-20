import {
  getCategroyStart,
  getCategorySuccess,
  getCategoryFailure,
} from "../store/slices/category.slice";
import axios from "./api";

const CategoryService = {
  async getCategories(dispatch) {
    dispatch(getCategroyStart());
    try {
      const { data } = await axios.get("/category/list");
      dispatch(getCategorySuccess(data.data));
    } catch (error) {
      console.log(error);
      dispatch(getCategoryFailure());
    }
  },
};

export default CategoryService;
