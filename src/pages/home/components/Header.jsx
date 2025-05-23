import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Header = ({ socket }) => {
  const { user } = useSelector((state) => state.userReducer);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    socket.emit("user-offline", user._id);
  };

  function getFullName() {
    let fname = user?.firstName.at(0).toUpperCase() + user?.firstName.slice(1);
    let lname = user?.lastName.at(0).toUpperCase() + user?.lastName.slice(1);
    return `${fname} ${lname}`;
  }

  function getInitials() {
    let f = user?.firstName.toUpperCase()[0];
    let l = user?.lastName.toUpperCase()[0];
    return f + l;
  }

  {
  }

  return (
    <header className="flex flex-wrap w-full px-8 py-2 justify-between border-b border-[#bbb]">
      {/* Logo Section */}
      <div className="flex items-center">
        <img src="/logo.svg" alt="logo" width={120} height={120} />
      </div>

      {/* User Profile Section */}
      <div className="flex items-center">
        {user?.profilePic && (
          <img
            src={user?.profilePic}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer"
            title="Profile"
            onClick={() => navigate("/profile")}
          />
        )}
        {!user?.profilePic && (
          <div
            className="w-10 h-10 rounded-full bg-[#e74c3c] text-white text-lg font-bold text-center leading-[40px] cursor-pointer"
            title="Profile"
            onClick={() => navigate("/profile")}
          >
            {getInitials()}
          </div>
        )}
        <span className="text-[#28282B] font-bold pt-[10px] pr-5 ml-4">
          {getFullName()}
        </span>
        <button
          className="bg-[#e74c3c] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#c0392b] transition duration-300"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
