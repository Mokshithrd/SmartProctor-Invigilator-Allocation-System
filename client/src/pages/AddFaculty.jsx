import { useState, useEffect } from "react";
import { User, Mail, Award, CheckCircle, AlertCircle, Save, X, Sparkles } from "lucide-react";
import axios from "axios";

export default function AddFaculty() {
  const [form, setForm] = useState({ name: "", email: "", designation: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [focusedField, setFocusedField] = useState(null);
  const [formTouched, setFormTouched] = useState({ name: false, email: false, designation: false });

  // Auto-dismiss status message after 5 seconds
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormTouched({ ...formTouched, [e.target.name]: true });
  };

  const handleSubmit = async () => {
    // Mark all fields as touched to show validation
    setFormTouched({ name: true, email: true, designation: true });
    
    if (!form.name || !form.email || !form.designation) {
      setStatus({
        type: "error",
        message: "All fields are required."
      });
      return;
    }
    
    if (!isEmailValid(form.email)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address."
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post("http://localhost:4000/faculty/add", form, { withCredentials: true });
      
      setStatus({ type: "success", message: "Faculty added successfully!" });
      setForm({ name: "", email: "", designation: "" });
      setFormTouched({ name: false, email: false, designation: false });
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to add faculty. Please try again.";
      setStatus({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const dismissStatus = () => {
    setStatus({ type: null, message: "" });
  };

  // Validate email format
  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getEmailValidationState = () => {
    if (!form.email) return null;
    return isEmailValid(form.email) ? "valid" : "invalid";
  };
  
  const getFieldValidationState = (field) => {
    if (!formTouched[field]) return null;
    return form[field] ? "valid" : "invalid";
  };

  const emailState = getEmailValidationState();
  const nameState = getFieldValidationState("name");
  const designationState = getFieldValidationState("designation");

  const designations = [
    { value: "Professor", label: "Professor" },
    { value: "Associate Professor", label: "Associate Professor" },
    { value: "Assistant Professor", label: "Assistant Professor" },
    { value: "Lecturer", label: "Lecturer" },
    { value: "Visiting Faculty", label: "Visiting Faculty" },
    { value: "Industry Expert", label: "Industry Expert" }
  ];

  const isFormValid = form.name && form.email && form.designation && isEmailValid(form.email);

  return (
    <div className="ml-71 p-8 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-56 h-56 -mt-20 -mr-20 rounded-full bg-purple-500 opacity-20 animate-pulse"></div>
            <div className="absolute left-0 bottom-0 w-32 h-32 -mb-12 -ml-12 rounded-full bg-indigo-400 opacity-20"></div>
            <div className="absolute right-20 bottom-10 transform rotate-12">
              <Sparkles className="h-6 w-6 text-purple-200 opacity-80" />
            </div>
            
            <h1 className="text-3xl font-bold flex items-center relative z-10 mb-2">
              <User className="mr-3" />
              Add New Faculty
            </h1>
            <div className="h-1 w-16 bg-purple-300 rounded-full mb-4"></div>
            <p className="text-indigo-100 relative z-10 text-lg">Enter faculty details to add to the system</p>
          </div>

          {/* Status message with animation */}
          {status.type && (
            <div className={`px-6 py-4 mx-6 mt-6 rounded-lg border-l-4 flex items-start justify-between transition-all duration-300 ease-in-out animate-fadeIn ${
              status.type === "success" 
                ? "bg-green-50 text-green-700 border-green-500" 
                : "bg-red-50 text-red-700 border-red-500"
            }`}>
              <div className="flex items-start">
                {status.type === "success" ? 
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" /> : 
                  <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                }
                <span className="font-medium">{status.message}</span>
              </div>
              <button 
                onClick={dismissStatus} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Form */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                  <span>Full Name</span>
                  {nameState === "valid" && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                </label>
                <div className={`relative rounded-md shadow-sm transform transition-all duration-200 ${
                  focusedField === "name" ? "ring-2 ring-indigo-300 scale-[1.01]" : ""
                } ${
                  nameState === "invalid" ? "ring-2 ring-red-300 border-red-300" : ""
                } ${
                  nameState === "valid" && focusedField !== "name" ? "border-green-300" : ""
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 ${
                      focusedField === "name" ? "text-indigo-500" : 
                      nameState === "invalid" ? "text-red-500" :
                      nameState === "valid" ? "text-green-500" : "text-gray-400"
                    }`} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-800 placeholder-gray-400 ${
                      nameState === "invalid" 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                    placeholder="John Doe"
                  />
                  {nameState === "invalid" && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {nameState === "invalid" && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Name is required
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
                  <span>Email Address</span>
                  {emailState === "valid" && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                </label>
                <div className={`relative rounded-md shadow-sm transform transition-all duration-200 ${
                  focusedField === "email" ? "ring-2 ring-indigo-300 scale-[1.01]" : ""
                } ${
                  emailState === "invalid" ? "ring-2 ring-red-300 border-red-300" : ""
                } ${
                  emailState === "valid" && focusedField !== "email" ? "border-green-300" : ""
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${
                      focusedField === "email" ? "text-indigo-500" : 
                      emailState === "invalid" ? "text-red-500" :
                      emailState === "valid" ? "text-green-500" : "text-gray-400"
                    }`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-800 placeholder-gray-400 ${
                      emailState === "invalid" 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                    placeholder="john.doe@example.com"
                  />
                  {emailState === "invalid" && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                  {emailState === "valid" && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {emailState === "invalid" && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Please enter a valid email address
                  </p>
                )}
              </div>

              {/* Designation Field */}
              <div className="space-y-2">
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 flex items-center">
                  <span>Designation</span>
                  {designationState === "valid" && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                </label>
                <div className={`relative rounded-md shadow-sm transform transition-all duration-200 ${
                  focusedField === "designation" ? "ring-2 ring-indigo-300 scale-[1.01]" : ""
                } ${
                  designationState === "invalid" ? "ring-2 ring-red-300 border-red-300" : ""
                } ${
                  designationState === "valid" && focusedField !== "designation" ? "border-green-300" : ""
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className={`h-5 w-5 ${
                      focusedField === "designation" ? "text-indigo-500" :
                      designationState === "invalid" ? "text-red-500" :
                      designationState === "valid" ? "text-green-500" : "text-gray-400"
                    }`} />
                  </div>
                  <select
                    name="designation"
                    id="designation"
                    value={form.designation}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("designation")}
                    onBlur={() => setFocusedField(null)}
                    className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-800 appearance-none bg-white ${
                      designationState === "invalid"
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                  >
                    <option value="">Select Designation</option>
                    {designations.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {designationState === "invalid" ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <svg className={`h-5 w-5 ${designationState === "valid" ? "text-green-500" : "text-gray-400"}`} 
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                {designationState === "invalid" && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Designation is required
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all duration-200 ${
                    loading || !isFormValid
                      ? "bg-gray-400 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform hover:translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Add Faculty
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-indigo-50 text-sm text-gray-600 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-indigo-500" />
                <p>All fields are required</p>
              </div>
              <div className="text-xs text-indigo-500 font-medium">
                Faculty Management System
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}