import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAdminProfile, clearMessages } from "../redux/slices/adminProfileSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Lock, Save, ArrowRight } from "lucide-react";

const UpdateAdminProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, successMessage, error } = useSelector((state) => state.adminProfile);
  const { admin } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Prefill form with current admin data when available
  useEffect(() => {
    if (admin) {
      setFormData(prev => ({
        ...prev,
        name: admin.name || "",
        email: admin.email || "",
      }));
    }
  }, [admin]);

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

    if (error) {
      toast.error(error);
    }
  }, [successMessage, error, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-8 mt-8 border border-gray-100">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <User size={36} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Update Profile</h2>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <User size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail size={18} className="text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock size={18} className="text-gray-400" />
          </div>
          <input
            type="password"
            name="password"
            placeholder="New Password (leave empty to keep current)"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-all duration-200 transform hover:translate-y-px disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {successMessage && (
          <div className="flex items-center justify-between p-4 mt-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {successMessage}
            </p>
            <button 
              type="button" 
              onClick={() => navigate("/dashboard/admin")}
              className="flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
            >
              Dashboard <ArrowRight size={14} />
            </button>
          </div>
        )}
      </form>

      <div className="text-center mt-6">
        <button
          onClick={() => navigate("/dashboard/admin")}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel and return to dashboard
        </button>
      </div>
    </div>
  );
};

export default UpdateAdminProfile;