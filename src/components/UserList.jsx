import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "../apiCalls/chat";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "../redux/userSlice";
import moment from "moment";
import store from "../redux/store";

const UserList = ({ searchKey, socket, onlineUsers }) => {
  const {
    allUsers,
    allChats,
    user: currentUser,
    selectedChat,
  } = useSelector((state) => state.userReducer);

  const dispatch = useDispatch();

  const startNewChat = async (searchedUserId) => {
    try {
      dispatch(showLoader());
      const response = await createNewChat([currentUser._id, searchedUserId]);
      dispatch(hideLoader());

      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        dispatch(setAllChats([...allChats, newChat]));
        dispatch(setSelectedChat(newChat));
      }
    } catch (error) {
      toast.error("Failed to start chat");
      dispatch(hideLoader());
    }
  };

  const getChatByUserId = (userId) => {
    return allChats.find((chat) => chat.members.some((m) => m._id === userId));
  };

  const getLastMessage = (userId) => {
    const chat = getChatByUserId(userId);
    if (!chat || !chat.lastMessage) return "";
    const msgPrefix =
      chat.lastMessage.sender === currentUser._id ? "You: " : "";
    return msgPrefix + chat.lastMessage?.text?.substring(0, 20);
  };

  const getUnreadMessageCount = (userId) => {
    const chat = getChatByUserId(userId);
    if (
      chat &&
      chat.unreadMessageCount > 0 &&
      chat.lastMessage.sender !== currentUser._id
    ) {
      return (
        <div className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center mb-1 unread-message-counter">
          {chat.unreadMessageCount}
        </div>
      );
    }
    return null;
  };

  const getLastMessageTimeStamp = (userId) => {
    const chat = getChatByUserId(userId);
    if (!chat?.lastMessage?.createdAt) return "";
    return moment(chat.lastMessage.createdAt).format("hh:mm A");
  };

  const isSelectedChat = (user) => {
    return selectedChat && selectedChat.members.some((m) => m._id === user._id);
  };

  const openChat = (selectedUserId) => {
    const chat = allChats.find(
      (chat) =>
        chat.members.some((m) => m._id === currentUser._id) &&
        chat.members.some((m) => m._id === selectedUserId)
    );
    if (chat) {
      dispatch(setSelectedChat(chat));
    }
  };

  const getData = () => {
    if (searchKey === "") {
      return allChats;
    } else {
      return allUsers.filter((user) => {
        return (
          user.firstName.toLowerCase().includes(searchKey.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchKey.toLowerCase())
        );
      });
    }
  };

  const formatName = (user) => {
    const fname = user.firstName?.[0]?.toUpperCase() + user.firstName?.slice(1);
    const lname = user.lastName?.[0]?.toUpperCase() + user.lastName?.slice(1);
    return `${fname} ${lname}`;
  };

  useEffect(() => {
    socket.off('set-message-count').on("set-message-count", (message) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      let allChats = store.getState().userReducer.allChats;

      if (selectedChat?._id !== message.chatId) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
              lastMessage: message,
            };
          }
          return chat;
        });
        allChats = updatedChats;
      }
      const lastestChat = allChats.find((chat) => chat._id === message.chatId);

      const otherChats = allChats.filter((chat) => chat._id !== message.chatId);

      allChats = [lastestChat, ...otherChats];
      dispatch(setAllChats(allChats));
    });
  }, []);

  return (
    <div className="space-y-2">
      {getData().map((obj) => {
        let user = obj;
        if (obj.members) {
          user = obj.members.find((m) => m._id !== currentUser._id);
        }

        const chatExists = getChatByUserId(user._id);

        return (
          <div
            key={user._id}
            className={`p-3 rounded-lg flex items-center justify-between transition-colors duration-200 border ${
              isSelectedChat(user)
                ? "bg-red-50 border-red-300"
                : "bg-white hover:bg-gray-100 border-gray-300"
            } cursor-pointer`}
            onClick={() => openChat(user._id)}
          >
            <div className="flex items-center gap-3 filter-user-details">
              {/* Avatar */}
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                  style={
                    onlineUsers.includes(user._id)
                      ? { border: "2px solid #2ecc71" }
                      : {}
                  }
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full bg-[#e74c3c] text-white text-lg font-semibold flex items-center justify-center"
                  style={
                    onlineUsers.includes(user._id)
                      ? { border: "2px solid #2ecc71" }
                      : {}
                  }
                >
                  {user.firstName[0]?.toUpperCase()}
                  {user.lastName[0]?.toUpperCase()}
                </div>
              )}

              {/* User Info */}
              <div>
                <div className="font-semibold text-gray-800">
                  {formatName(user)}
                </div>
                <div className="text-sm text-gray-500">
                  {getLastMessage(user._id) || user.email}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {getUnreadMessageCount(user._id)}
              <div className="text-xs text-slate-500 font-medium last-message-timestamp">
                {getLastMessageTimeStamp(user._id)}
              </div>

              {/* Show Start Chat only if chat doesn't exist */}
              {!chatExists && (
                <button
                  className="mt-1 px-3 py-1 bg-[#e74c3c] hover:bg-[#c0392b] text-white text-sm rounded-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewChat(user._id);
                  }}
                >
                  Start Chat
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
