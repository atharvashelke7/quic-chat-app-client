import React, { useState } from "react";
import Search from "./Search";
import UserList from "../../../components/UserList";

const Sidebar = ({ socket,onlineUsers }) => {
  const [searchKey, setSearchKey] = useState("");

  return (
    <div className="w-[30%] px-5">
      {/* Search Area */}
      <Search searchKey={searchKey} setSearchKey={setSearchKey} />
      <UserList searchKey={searchKey} socket={socket} onlineUsers={onlineUsers} />
    </div>
  );
};

export default Sidebar;
