import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../redux/authSlice"; // your thunk
import { useState } from "react";
import axios from "axios";

export default function Login({ setUser }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:4000/auth/login", {
        email,
        password,
      }, { withCredentials: true });

      if (res.data.success) {
        await dispatch(fetchCurrentUser()); // Fetch updated user from backend
        setUser(res.data.user);           // Update App.jsx state
        navigate("/");                       // Move to home (auto-redirect based on user role)
      } else {
        console.log("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
