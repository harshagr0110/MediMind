import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const Myprofile = () => {
  const { userData, setUserData, backendurl, token } = useContext(AppContext);

  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setProfile({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        gender: userData.gender || "Male",
        dob: userData.dob ? userData.dob.split("T")[0] : "",
        profileImage: userData.image || assets.profile_pic,
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
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
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", profile.fullName);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      formData.append("dob", profile.dob);
      formData.append("gender", profile.gender);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await axios.post(`${backendurl}/api/user/update-profile`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setUserData(response.data.userData);
        setEditMode(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setImageFile(null);
    if (userData) {
        setProfile({
            fullName: userData.fullName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            gender: userData.gender || "Male",
            dob: userData.dob ? userData.dob.split("T")[0] : "",
            profileImage: userData.image || assets.profile_pic,
        });
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-400"></div>
      </div>
    );
  }

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
        <form className="w-full md:w-2/3 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
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
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? "Saving..." : "Save"}
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