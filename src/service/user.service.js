import {
  getUserFailure,
  getUserStart,
  getUserSuccess,
} from "../store/slices/user.slice";
import axios from "./api";
import { toast } from "react-hot-toast";

const UserService = {
  async signUser(dispatch, user, navigate) {
    dispatch(getUserStart());
    try {
      const { data } = await axios.post("/user/sign", {
        ...user,
        role: "user",
      });
      if (data.status == "success") {
        toast.success(data.message);
        dispatch(getUserSuccess(data));
        localStorage.setItem("speech-token", data.token);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
      dispatch(getUserFailure());
    }
  },
  async loginUser(dispatch, user, navigate) {
    dispatch(getUserStart());
    try {
      const { data } = await axios.post("/user/login", user);
      if (data.status == "success") {
        toast.success(data.message);
        dispatch(getUserSuccess(data));
        localStorage.setItem("speech-token", data.token);
        
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.response.data.message);
      toast.error(error.response.data.message);
      dispatch(getUserFailure());
    }
  },
  async profile(dispatch) {
    dispatch(getUserStart());
    try {
      const { data } = await axios.get("/user/profile");
      if (data.status == "success") {
        dispatch(getUserSuccess(data));
      }
    } catch (error) {
      console.log(error);
      dispatch(getUserFailure());
    }
  },
};

export default UserService;
