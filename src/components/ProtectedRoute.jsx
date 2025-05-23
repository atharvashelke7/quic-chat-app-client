import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getLoggedUser } from "../apiCalls/users";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import toast from "react-hot-toast";
import { setAllChats, setAllUsers, setUser } from "../redux/userSlice";
import { getAllChats } from "../apiCalls/chat";

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const getLoggedInUser = async () => {
    dispatch(showLoader());
    const response = await getLoggedUser();
    dispatch(hideLoader());
    if (response.success) {
      dispatch(setUser(response.data));
    } else {
      toast.error(response.message);
      navigate("/login");
    }
  };

  const getAllUsersFromDb = async () => {
    dispatch(showLoader());
    const response = await getAllUsers();
    dispatch(hideLoader());

    if (response.success) {
      dispatch(setAllUsers(response.data));
    } else {
      toast.error(response.message);
      navigate("/login");
    }
  };

  const getCurrentUserChats = async () => {
    try {
      const response = await getAllChats();
      if (response.success) {
        dispatch(setAllChats(response.data));
      }
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      // write logic to get the details of current user
      getLoggedInUser();
      getAllUsersFromDb();
      getCurrentUserChats();
    } else {
      navigate("/login");
    }
  }, []); // this useEffect will call every time when we refresh or restart our application

  return <div>{children}</div>;
};

export default ProtectedRoute;
