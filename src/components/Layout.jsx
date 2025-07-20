import React from "react";
import { DashboardIcon, ExitIcon, Logo, Settings, TestIcon } from "../assets";

const Layout = ({ activePage, activeTab }) => {
  const menuItems = [
    {
      label: "Dashboard",
      icon: DashboardIcon,
      path: "/",
    },
    {
      label: "My Tests",
      icon: TestIcon,
      path: "/tests",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <div className="flex">
      <div className="w-[20%]">
        <div className="side-bar border-r-[#E1E5EA] border-[2px] h-[100vh]">
          <div className="logo flex items-center py-3 justify-center">
            <img src={Logo} className="w-[200px]" alt="" />
          </div>
          <div className="menu flex  justify-between">
            <div>
              {menuItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex hover:bg-[#F1F4F6] border-[1px_#fff]  hover:text-[#1C274C] hover:border-[1px_#DBDEE1] cursor-pointer text-[#8C96A1] w-[80%] mx-auto mt-2 items-center gap-2 p-3 px-4 rounded-[10px] ${
                    item.label == activeTab
                      ? "bg-[#F1F4F6] border-[1px] text-[#1C274C] border-[#DBDEE1]"
                      : ""
                  }`}
                >
                  <img src={item.icon} className="w-[25px]" alt={item.label} />
                  <span className="font-[400] text-[18px]">{item.label}</span>
                </div>
              ))}
            </div>
            <div>
              <div
                className={`flex hover:bg-[#F1F4F6] border-[1px_#fff]  hover:text-[#1C274C] hover:border-[1px_#DBDEE1] cursor-pointer text-[#8C96A1] w-[80%] mx-auto mt-2 items-center gap-2 p-3 px-4 rounded-[10px] `}
              >
                <img src={ExitIcon} className="w-[25px]" />
                <span className="font-[400] text-[18px]">Log out</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[80%] p-4 h-[100vh] overflow-y-scroll">
        {activePage}
      </div>
    </div>
  );
};

export default Layout;
