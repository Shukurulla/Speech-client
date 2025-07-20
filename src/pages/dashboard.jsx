import React from "react";
import { HeroImage, TestImage } from "../assets";
import { FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="w-[85%] mx-auto">
      <div className="row hero items-center py-5 mb-5">
        <div className="col-lg-6 ">
          <h1 className="text-4xl mb-3 text-[#083156] font-[500] w-[80%]">
            Start your speaking journey today!
          </h1>
          <p className="w-[90%] text-[#3D4D5C]">
            Join hundreds of students who have improved their speaking skills.
          </p>
          <button className="bg-[#FFAE00] text-white px-5 py-2 mt-3 rounded-[5px]">
            Explore
          </button>
        </div>
        <div className="col-lg-6">
          <img src={HeroImage} className="w-[80%]" alt="" />
        </div>
      </div>
      <div>
        <h1 className="text-4xl mb-3 text-[#083156] font-[500] w-[80%]">
          Do you want to practice?
        </h1>
        <p className="w-[90%] text-[#3D4D5C]">
          No problem! Practice with our collection of reference materials and
          practise exercises.
        </p>
      </div>
      <div className="row my-5">
        <div className="col-lg-6 col-md-6 col-sm">
          <div
            onClick={() => navigate("/tests")}
            className="cd border border-[#E1E5EA] p-3 rounded-lg cursor-pointer"
          >
            <div className="row">
              <div className="col-2 ">
                <div className="flex items-center justify-center w-100 h-100">
                  <img src={TestImage} className="w-[60px]" alt="" />
                </div>
              </div>
              <div className="col-10">
                <h1 className="text-[#083156] text-xl font-[500]">
                  Take a full practice
                </h1>
                <div className="flex select-none items-center gap-2 mt-2 text-[#2285D0]">
                  LEARN MORE <FiChevronRight />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
