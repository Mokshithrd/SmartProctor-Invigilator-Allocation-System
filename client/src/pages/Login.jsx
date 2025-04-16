import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:4000/auth/login", form, {
        withCredentials: true,
      });
  
      const user = res.data.user;
      const token = res.data.token;
  
      // ✅ Save token in localStorage
      localStorage.setItem("token", token);
      // Optional: store user info too
      localStorage.setItem("user", JSON.stringify(user));
  
      setUser(user);
  
      switch (user.role) {
        case "Admin":
          navigate("/dashboard/admin");
          break;
        case "Faculty":
          navigate("/dashboard/faculty");
          break;
        case "Student":
          navigate("/dashboard/student");
          break;
        default:
          setError("Unauthorized role");
      }
    } catch (err) {
      setError("Invalid credentials");
    }
  };
  
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login to ExamFlow</h1>

        <input
          className="w-full px-4 py-2 mb-3 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full px-4 py-2 mb-4 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-300"
          onClick={handleLogin}
        >
          Login
        </button>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}
