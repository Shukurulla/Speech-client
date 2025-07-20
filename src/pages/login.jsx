import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import UserService from "../service/user.service";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginHandler = (e) => {
    e.preventDefault();
    UserService.loginUser(dispatch, { email, password }, navigate);
  };

  return (
    <main className="form-signin w-100 h-[100vh] flex items-center justify-center m-auto">
      <form className="w-[30%]" onSubmit={(e) => loginHandler(e)}>
        <h1 className="h3 mb-3  text-center font-semibold">Kirish</h1>
        <div className="form-floating">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            id="floatingInput"
            placeholder="name@example.com"
          />
          <label htmlFor="floatingInput">Email address</label>
        </div>
        <div className="form-floating">
          <input
            type="password"
            className="form-control my-2"
            id="floatingPassword"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
          />
          <label htmlFor="floatingPassword">Password</label>
        </div>

        <button
          className={`${
            isLoading ? "bg-[#f3c560]" : "bg-[#FFAE00]"
          } rounded-[5px] text-white  font-semibold  w-100 py-2 `}
          disabled={isLoading}
          type="submit"
        >
          Kirish
        </button>
        <Link to={"/register"} className="mt-2 text-primary block">
          Siz oldin ro'yhatdan o'tmaganmisiz?
        </Link>
      </form>
    </main>
  );
};

export default Login;
