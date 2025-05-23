import moment from "moment/moment";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadProfilePic } from "../../apiCalls/users";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
import toast from "react-hot-toast";
import { setUser } from "../../redux/userSlice";

const Profile = () => {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState("");

  const user = useSelector((state) => state.userReducer.user);
  const dispatch = useDispatch();

  const handleFileClick = () => {
    fileInputRef.current.click();
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

  const onFileSelect = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      setImage(reader.result);
    };
  };

  const updateProfilePic = async () => {
    try {
      dispatch(showLoader());
      const response = await uploadProfilePic(image);
      dispatch(hideLoader());

      if (response.success) {
        toast.success(response.messsage);
        dispatch(setUser(response.data));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error uploading profile picture:", error);
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    if (user?.profilePic) {
      setImage(user.profilePic);
    }
  }, [user]);

  return (
    <div className="flex w-[80%] text-[#28282B] mx-auto my-[100px] p-5 rounded-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.35)]">
      {/* Profile Picture Container */}
      <div className="w-[30%] flex justify-center">
        {image && (
          <img
            src={image}
            alt="Profile"
            className="w-[240px] h-[240px] rounded-full object-cover border-[5px] border-[#ddd]"
          />
        )}
        {!image && (
          <div className="w-[240px] h-[240px] rounded-full border-[5px] border-[#ddd] text-[#28282B] text-[120px] font-bold text-center leading-[240px]">
            {getInitials()}
          </div>
        )}
      </div>

      {/* Profile Info Container */}
      <div className="w-[70%] px-[10px] py-[30px]">
        {/* Name */}
        <div className="py-[10px] border-b-[1.5px] border-[#cdcdcd] mb-[30px]">
          <h2 className="text-xl font-semibold">{getFullName()}</h2>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <p className="text-base">{user?.email}</p>
        </div>

        {/* Account Created */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Account Created
          </label>
          <p className="text-base">
            {moment(user?.createdAt).format("MMM DD, YYYY")}
          </p>
        </div>

        {/* File Upload Button */}
        <div className="py-[30px]">
          <button
            type="button"
            onClick={handleFileClick}
            className="rounded-md px-4 h-10 cursor-pointer bg-[#28282B] text-white border border-black/20 shadow-sm mr-4 hover:bg-gray-100 hover:text-[#28282B] active:bg-gray-200 transition-colors"
          >
            Upload Picture
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            className="hidden"
          />
          <button className="upload-image-btn" onClick={updateProfilePic}>
            upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
