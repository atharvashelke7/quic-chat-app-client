import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatPage from "../../components/ChatPage";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const socket = io("https://quic-chat-app-server.onrender.com");

const Home = () => {
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      socket.emit("join-room", user._id);
      socket.emit("user-login", user._id);

      socket.on("online-users", (onlineUsers) => {
        setOnlineUsers(onlineUsers);
      });
      socket.on("online-users-updated", (onlineUsers) => {
        setOnlineUsers(onlineUsers);
      });
    }
  }, [user, onlineUsers]);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "#fdedec" }}
    >
      <Header socket={socket} />
      <div className="flex w-[90%] m-[10px_auto] p-[10px] flex-1">
        <Sidebar socket={socket} onlineUsers={onlineUsers} />
        {selectedChat && <ChatPage socket={socket} />}
      </div>
    </div>
  );
};

export default Home;
