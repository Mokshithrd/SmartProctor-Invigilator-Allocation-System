import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      console.log(form);
      const res = await axios.post(
        "http://localhost:4000/auth/login", 
        form,
        { withCredentials: true }
    );
      console.log(res.data.user);
      setUser(res.data.user);
      navigate(`/dashboard/${res.data.user.role.toLowerCase()}`);
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">Login</h1>
      <input className="p-2 mb-2 text-black" type="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input className="p-2 mb-2 text-black" type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button className="bg-blue-500 px-4 py-2 rounded" onClick={handleLogin}>Login</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
