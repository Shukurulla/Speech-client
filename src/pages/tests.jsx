import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CategoryService from "../service/category.service";

const Tests = () => {
  const { isLoading } = useSelector((state) => state.category);
  const dispatch = useDispatch();
  useEffect(() => {
    CategoryService.getCategories(dispatch);
  }, []);
  return (
    <div>
      <div className="container">
        <div className="section">
          <h1 className="text-4xl mb-3 text-[#083156] font-[500] w-[80%]">
            Test section
          </h1>
          <p className="w-[90%] text-[#3D4D5C]">
            Improve your speaking skill practicing each question type.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tests;
