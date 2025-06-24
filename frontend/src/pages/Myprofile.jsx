import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import "react-toastify/dist/ReactToastify.css";

const Myprofile = () => {
  const { userData, setUserData, backendurl, token } = useContext(AppContext);

  const initialProfile = {
    fullName: userData?.fullName || "John Doe",
    email: userData?.email || "john.doe@example.com",
    phone: userData?.phone || "+1 234 567 890",
    address: userData?.address || "123 Main St, City, Country",
    gender: userData?.gender || "Male",
    dob: userData?.dob || "1990-01-01",
    profileImage: userData?.image || assets.profile_pic,
  };

  const [profile, setProfile] = useState(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!editMode) {
      setProfile(initialProfile);
      setImageFile(null);
    }
    // eslint-disable-next-line
  }, [userData, editMode]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "date" ? new Date(value).toISOString().split("T")[0] : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfile((prev) => ({
        ...prev,
        profileImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleEdit = () => setEditMode(true);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", profile.fullName);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      formData.append("dob", profile.dob);
      formData.append("gender", profile.gender);
      if (imageFile) formData.append("image", imageFile);

      const response = await axios.post(`${backendurl}/api/user/update-profile`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setUserData(response.data.userData);
        setEditMode(false);
      }
    } catch (err) {
      console.error("Profile Update Error", err);
    }
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setEditMode(false);
    setImageFile(null);
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center w-full py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100 flex flex-col md:flex-row items-center gap-12">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center w-full md:w-1/3">
          <div className="relative">
            <img
              src={profile.profileImage}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover border-4 border-teal-200 shadow-xl"
            />
            {editMode && (
              <label className="absolute bottom-2 right-2 bg-teal-500 rounded-full p-2 cursor-pointer shadow-lg hover:bg-teal-600 transition">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2H7a2 2 0 01-2-2v-2a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <h2 className="text-3xl font-bold mt-6 text-center text-blue-700 tracking-tight">
            My Profile
          </h2>
        </div>
        {/* Profile Form Section */}
        <form className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-blue-700 font-medium mb-1 block">Full Name:</label>
              {editMode ? (
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-blue-200 focus:ring-blue-300 transition"
                  autoComplete="off"
                />
              ) : (
                <div className="text-gray-900 font-semibold">{profile.fullName}</div>
              )}
            </div>
            <div>
              <label className="text-blue-700 font-medium mb-1 block">Email:</label>
              <div className="text-gray-900 font-semibold">{profile.email}</div>
            </div>
            <div>
              <label className="text-blue-700 font-medium mb-1 block">Phone:</label>
              {editMode ? (
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-blue-200 focus:ring-blue-300 transition"
                  autoComplete="off"
                />
              ) : (
                <div className="text-gray-900 font-semibold">{profile.phone}</div>
              )}
            </div>
            <div>
              <label className="text-blue-700 font-medium mb-1 block">Address:</label>
              {editMode ? (
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-blue-200 focus:ring-blue-300 transition"
                  autoComplete="off"
                />
              ) : (
                <div className="text-gray-900 font-semibold">{profile.address}</div>
              )}
            </div>
            <div>
              <label className="text-blue-700 font-medium mb-1 block">Gender:</label>
              {editMode ? (
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-blue-200 focus:ring-blue-300 transition"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              ) : (
                <div className="text-gray-900 font-semibold">{profile.gender}</div>
              )}
            </div>
            <div>
              <label className="text-blue-700 font-medium mb-1 block">Date of Birth:</label>
              {editMode ? (
                <input
                  type="date"
                  name="dob"
                  value={profile.dob}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-blue-200 focus:ring-blue-300 transition"
                />
              ) : (
                <div className="text-gray-900 font-semibold">{profile.dob}</div>
              )}
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEdit}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg font-semibold shadow hover:bg-teal-600 transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Myprofile;