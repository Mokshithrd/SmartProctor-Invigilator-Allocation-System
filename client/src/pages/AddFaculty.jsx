import { useState } from "react";
import axios from "axios";

export default function AddFaculty() {
  const [form, setForm] = useState({ name: "", email: "", designation: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/faculty/add", form, { withCredentials: true });
      alert("Faculty added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add faculty.");
    }
  };

  return (
    <div className="ml-64 p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Add Faculty</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Name" required />
        <input name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Email" required />
        <input name="designation" value={form.designation} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Designation" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Faculty</button>
      </form>
    </div>
  );
}
