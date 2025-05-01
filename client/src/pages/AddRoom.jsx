import { useState } from "react";
import axios from "axios";

export default function AddRoom() {
  const [form, setForm] = useState({
    building: "",
    floor: "",
    roomNumber: "",
    totalBenches: "",
    studentsPerBench: ""
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:4000/room/add", form, { withCredentials: true })
      .then(() => {
        alert("Room added successfully!");
        setForm({ building: "", floor: "", roomNumber: "", totalBenches: "", studentsPerBench: "" });
      })
      .catch(err => console.error("Error adding room:", err));
  };

  return (
    <div className="ml-64 p-6">
      <h1 className="text-2xl font-bold mb-4">Add Room</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {["building", "floor", "roomNumber", "totalBenches", "studentsPerBench"].map(field => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            required
            className="w-full p-2 border rounded"
          />
        ))}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Room
        </button>
      </form>
    </div>
  );
}
