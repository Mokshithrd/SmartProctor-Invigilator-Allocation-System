import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Building, Layers, DoorOpen, Users, Grid, Save, X, Sparkles } from "lucide-react";
import axios from "axios";

export default function AddRoom() {
  const [form, setForm] = useState({
    building: "",
    floor: "",
    roomNumber: "",
    totalBenches: "",
    studentsPerBench: ""
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [focusedField, setFocusedField] = useState(null);
  const [formTouched, setFormTouched] = useState({
    building: false,
    floor: false,
    roomNumber: false,
    totalBenches: false,
    studentsPerBench: false
  });

  // Auto-dismiss status message after 5 seconds
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Mark all fields as touched to show validation
    setFormTouched({
      building: true,
      floor: true,
      roomNumber: true,
      totalBenches: true,
      studentsPerBench: true
    });
    
    // Validate form
    if (!form.building || !form.floor || !form.roomNumber || !form.totalBenches || !form.studentsPerBench) {
      setStatus({
        type: "error",
        message: "All fields are required."
      });
      return;
    }
    
    setLoading(true);
    
    try {
      axios.post("http://smartproctor-mokshith.onrender.com/room/add", form, { withCredentials: true })
        .then(() => {
          setStatus({ 
            type: "success", 
            message: "Room added successfully!" 
          });
          // Reset form and touched state
          setForm({ 
            building: "", 
            floor: "", 
            roomNumber: "", 
            totalBenches: "", 
            studentsPerBench: "" 
          });
          setFormTouched({
            building: false,
            floor: false,
            roomNumber: false,
            totalBenches: false,
            studentsPerBench: false
          });
        })
        .catch(err => {
          const errorMessage = err.response?.data?.message || "Error adding room. Please try again.";
          setStatus({ 
            type: "error", 
            message: errorMessage
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: "error", 
        message: "Error adding room. Please try again." 
      });
      setLoading(false);
    }
  };

  const dismissStatus = () => {
    setStatus({ type: null, message: "" });
  };

  const getIcon = (fieldName) => {
    switch(fieldName) {
      case "building": return <Building size={20} />;
      case "floor": return <Layers size={20} />;
      case "roomNumber": return <DoorOpen size={20} />;
      case "totalBenches": return <Grid size={20} />;
      case "studentsPerBench": return <Users size={20} />;
      default: return null;
    }
  };

  const getLabel = (fieldName) => {
    switch(fieldName) {
      case "building": return "Building Name";
      case "floor": return "Floor Number";
      case "roomNumber": return "Room Number";
      case "totalBenches": return "Total Benches";
      case "studentsPerBench": return "Students Per Bench";
      default: return fieldName;
    }
  };
  
  const getFieldValidationState = (field) => {
    if (!formTouched[field]) return null;
    return form[field] ? "valid" : "invalid";
  };
  
  const isFormValid = form.building && 
    form.floor && 
    form.roomNumber && 
    form.totalBenches && 
    form.studentsPerBench;

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
              <DoorOpen className="mr-3" />
              Add New Room
            </h1>
            <div className="h-1 w-16 bg-purple-300 rounded-full mb-4"></div>
            <p className="text-indigo-100 relative z-10 text-lg">Enter room details to add to the system</p>
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
              {["building", "floor", "roomNumber", "totalBenches", "studentsPerBench"].map(field => {
                const validationState = getFieldValidationState(field);
                return (
                  <div key={field} className="space-y-2">
                    <label htmlFor={field} className="block text-sm font-medium text-gray-700 flex items-center">
                      <span>{getLabel(field)}</span>
                      {validationState === "valid" && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                    </label>
                    <div className={`relative rounded-md shadow-sm transform transition-all duration-200 ${
                      focusedField === field ? "ring-2 ring-indigo-300 scale-[1.01]" : ""
                    } ${
                      validationState === "invalid" ? "ring-2 ring-red-300 border-red-300" : ""
                    } ${
                      validationState === "valid" && focusedField !== field ? "border-green-300" : ""
                    }`}>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {React.cloneElement(getIcon(field), { 
                          className: `${
                            focusedField === field ? "text-indigo-500" : 
                            validationState === "invalid" ? "text-red-500" :
                            validationState === "valid" ? "text-green-500" : "text-gray-400"
                          }`
                        })}
                      </div>
                      <input
                        id={field}
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        onFocus={() => setFocusedField(field)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={getLabel(field)}
                        required
                        type={field === "floor" || field === "roomNumber" || field === "totalBenches" || field === "studentsPerBench" ? "number" : "text"}
                        min={field === "floor" || field === "roomNumber" || field === "totalBenches" || field === "studentsPerBench" ? "1" : undefined}
                        className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-800 placeholder-gray-400 ${
                          validationState === "invalid" 
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                            : "focus:ring-indigo-500 focus:border-indigo-500"
                        }`}
                      />
                      {validationState === "invalid" && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                      {validationState === "valid" && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {validationState === "invalid" && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getLabel(field)} is required
                      </p>
                    )}
                  </div>
                );
              })}

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
                      Add Room
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
                Room Management System
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
