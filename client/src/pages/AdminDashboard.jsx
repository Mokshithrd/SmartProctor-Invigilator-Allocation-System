import axios from "axios";

export default function AdminDashboard({ user }) {
  const handleLogout = async () => {
    await axios.post("http://localhost:4000/auth/logout", { withCredentials: true });
    window.location.href = "/login";
  };

  return (
    <div className="p-5 bg-gray-800 text-white h-screen">
      <h1 className="text-xl">Welcome, {user.name} (Admin)</h1>
      <button className="bg-red-500 px-4 py-2 mt-4 rounded" onClick={handleLogout}>Logout</button>
    </div>
  );
}
