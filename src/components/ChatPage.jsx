import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewMessages, getAllMessages } from "../apiCalls/message";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import toast, { CheckmarkIcon } from "react-hot-toast";
import { FiCheck, FiCheckCircle, FiSend } from "react-icons/fi"; // using a send icon
import moment from "moment";
import { clearUnreadMessageCount } from "../apiCalls/chat";
import store from "../redux/store";
import { setAllChats } from "../redux/userSlice";
import { FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { FcImageFile } from "react-icons/fc";

const ChatPage = ({ socket }) => {
  const dispatch = useDispatch();
  const { selectedChat, user, allChats } = useSelector(
    (state) => state.userReducer
  );

  const selectedUser = selectedChat.members.find((u) => u._id !== user._id);

  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [isTyping, setIstyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [data, setData] = useState(null);

  const sendMessage = async (image) => {
    try {
      const newMessage = {
        chatId: selectedChat._id,
        sender: user._id,
        text: message,
        image: image,
      };

      socket.emit("send-message", {
        ...newMessage,
        members: selectedChat.members.map((m) => m._id),
        read: false,
        createdAt: moment().format("YYYY-MM-DDTHH:mm:ssZ"),
      });

      const response = await createNewMessages(newMessage);
      if (response.success) {
        setMessage("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    }
  };

  const getMessages = async () => {
    try {
      dispatch(showLoader());
      const response = await getAllMessages(selectedChat._id);
      dispatch(hideLoader());
      if (response.success) {
        setAllMessages(response.data);
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message);
    }
  };

  const clearUnreadMessages = async () => {
    try {
      socket.emit("clear-unread-messages", {
        chatId: selectedChat._id,
        members: selectedChat.members.map((m) => m._id),
      });
      const response = await clearUnreadMessageCount(selectedChat._id);

      if (response.success) {
        allChats.map((chat) => {
          if (chat._id === selectedChat._id) {
            return response.data;
          }
          return chat;
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatTime = (timestamp) => {
    const now = moment();
    const diff = now.diff(moment(timestamp), "days");

    if (diff < 1) {
      return `Today ${moment(timestamp).format("hh:mm A")}`;
    } else if (diff === 1) {
      return `Yesterday ${moment(timestamp).format("hh:mm A")}`;
    } else {
      return moment(timestamp).format("MMMM D, hh:mm A");
    }
  };

  const formatName = (user) => {
    let fname = user.firstName.at(0).toUpperCase() + user.firstName.slice(1);
    let lname = user.lastName.at(0).toUpperCase() + user.lastName.slice(1);
    return `${fname} ${lname}`;
  };

  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      await sendMessage(base64Image); // Send image as base64 string
    };

    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
  };

  useEffect(() => {
    getMessages();
    if (selectedChat?.lastMessage?.sender !== user._id) {
      clearUnreadMessages();
    }

    socket.off("receive-message").on("receive-message", (data) => {
      const selectedChat = store.getState().userReducer.selectedChat;

      if (selectedChat._id === data.chatId) {
        setAllMessages((prev) => [...prev, data]);
      }
      if (selectedChat._id === data.chatId && data.sender !== user._id) {
        clearUnreadMessages();
      }
    });

    socket.on("message-count-cleared", (data) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      const allChats = store.getState().userReducer.allChats;

      if (selectedChat._id === data.chatId) {
        // Update the unread message count in the chat list
        const updatedChats = allChats.map((chat) => {
          if (chat._id === data.chatId) {
            return { ...chat, unreadMessageCount: 0 };
          }
          return chat;
        });
        dispatch(setAllChats(updatedChats));
        // Update the read status of all messages in the selected chat
        setAllMessages((prev) => {
          return prev.map((msg) => {
            return { ...msg, read: true };
          });
        });
      }
    });

    socket.on("started-typing", (data) => {
      setData(data);
      if (selectedChat._id === data.chatId && data.sender !== user._id) {
        setIstyping(true);
        setTimeout(() => {
          setIstyping(false);
        }, 2000);
      }
    });
  }, [selectedChat]);

  useEffect(() => {
    const msgContainer = document.getElementById("chatContainer");
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }, [allMessages, isTyping]);

  return (
    <div className="bg-white w-full md:w-[70%] px-6 py-5 rounded-[10px] flex flex-col h-[85vh]">
      {selectedChat && (
        <>
          {/* Header */}
          <div className="px-6 py-2 mb-5 border-b border-gray-300 text-right font-bold text-[#e74c3c]">
            {formatName(selectedUser)}
          </div>

          {/* Chat Area */}
          <div
            className="flex-1 overflow-y-auto px-5 py-2 main-chat-area"
            id="chatContainer"
          >
            {allMessages.map((msg, index) => {
              const isSentByCurrentUser = msg.sender === user._id;
              return (
                <div
                  key={index}
                  className={`flex ${
                    isSentByCurrentUser ? "justify-end" : "justify-start"
                  } mb-3`}
                >
                  <div className="flex flex-col items-start max-w-[70%]">
                    <div
                      className={`px-4 py-2 text-sm rounded-lg ${
                        isSentByCurrentUser
                          ? "bg-[#e74c3c] text-white rounded-tr-none self-end"
                          : "bg-gray-300 text-gray-900 rounded-bl-none self-start"
                      }`}
                    >
                      <div>{msg.text}</div>
                      <div>
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="image"
                            className="w-32 h-32 object-cover rounded-lg mt-2"
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 self-end">
                      {formatTime(msg.createdAt)}{" "}
                      {isSentByCurrentUser && msg.read && (
                        <span className="text-red-500 items-center">
                          <FiCheckCircle className="inline size-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* You can map messages here */}
            <div>
              {isTyping &&
                selectedChat?.members
                  .map((m) => m._id)
                  .includes(data?.sender) && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#e74c3c] rounded-full animate-ping"></div>
                    <span className="text-gray-500">Typing...</span>
                  </div>
                )}
            </div>
          </div>

          {showEmojiPicker && (
            <div>
              <EmojiPicker
                onEmojiClick={(e) => {
                  setMessage(message + e.emoji);
                }}
              ></EmojiPicker>
            </div>
          )}

          {/* Input Area */}
          <div className="relative mt-5">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                socket.emit("user-typing", {
                  chatId: selectedChat._id,
                  members: selectedChat.members.map((m) => m._id),
                  sender: user._id,
                });
              }}
              placeholder="Type your message..."
              className="w-full h-10 pl-12 pr-28 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
            />

            {/* Image Icon */}
            <label
              for="file"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-500 cursor-pointer"
            >
              <FcImageFile />
              <input
                type="file"
                id="file"
                className="hidden"
                accept="image/jpg,image/png,image/jpeg,image/gif"
                onChange={sendImage}
              />
            </label>

            {/* Emoji Picker Icon */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-[#e74c3c] hover:text-[#c0392b] text-xl"
            >
              <FaSmile />
            </button>

            {/* Send Icon */}
            <button
              onClick={() => sendMessage("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#e74c3c] hover:text-[#c0392b] text-xl"
            >
              <FiSend />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPage;
