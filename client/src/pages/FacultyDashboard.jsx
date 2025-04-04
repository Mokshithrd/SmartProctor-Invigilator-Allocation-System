import { useState } from "react";
import axios from "axios";

export default function FacultyDashboard({ user }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, designation: user.designation });

  const handleUpdate = async () => {
    console.log(form);
    const res = await axios.put("http://localhost:4000/dashboard/faculty/update", form, { withCredentials: true } );
    console.log(res);
    alert("Profile updated!");
  };

  return (
    <div className="p-5 bg-gray-800 text-white h-screen">
      <h1 className="text-xl">Welcome, {user.name} (Faculty)</h1>
      <input className="block p-2 mt-2 text-black" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input className="block p-2 mt-2 text-black" type="email" value={form.email} disabled />
      <select className="block p-2 mt-2 text-black" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}>
        <option>Assistant Professor</option>
        <option>Associate Professor</option>
        <option>Professor</option>
      </select>
      <button className="bg-green-500 px-4 py-2 mt-4 rounded" onClick={handleUpdate}>Update Profile</button>
    </div>
  );
}
