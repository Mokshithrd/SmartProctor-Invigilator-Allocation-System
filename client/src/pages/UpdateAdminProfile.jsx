import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAdminProfile, clearMessages } from "../redux/slices/adminProfileSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UpdateAdminProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, successMessage, error } = useSelector((state) => state.adminProfile);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateAdminProfile(formData));
  };

  useEffect(() => {
    if (successMessage) {
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        navigate("/dashboard/admin");
      }, 2000);
    }
  }, [successMessage, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-xl p-6 mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">Update Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
        {error && <p className="text-red-600 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default UpdateAdminProfile;
