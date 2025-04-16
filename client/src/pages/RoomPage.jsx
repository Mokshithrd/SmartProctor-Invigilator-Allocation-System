import { useEffect, useState } from "react";
import axios from "axios";

export default function RoomPage() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    building: "",
    floor: "",
    roomNumber: "",
    totalBenches: "",
    studentsPerBench: "",
  });

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:4000/room/all", {
        withCredentials: true,
      });
      setRooms(res.data.data || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddRoom = async () => {
    try {
      const res = await axios.post("http://localhost:4000/room/add", form, {
        withCredentials: true,
      });
      if (res.data.success) {
        setForm({
          building: "",
          floor: "",
          roomNumber: "",
          totalBenches: "",
          studentsPerBench: "",
        });
        fetchRooms();
      }
    } catch (err) {
      console.error("Error adding room:", err);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/room/delete/${id}`, {
        withCredentials: true,
      });
      fetchRooms();
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Room Management</h2>

      {/* Add Room Form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Add New Room</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["building", "floor", "roomNumber", "totalBenches", "studentsPerBench"].map((field) => (
            <input
              key={field}
              name={field}
              value={form[field]}
              onChange={handleChange}
              placeholder={field.replace(/([A-Z])/g, " $1")}
              className="p-2 border border-gray-300 rounded-md"
            />
          ))}
        </div>
        <button
          onClick={handleAddRoom}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Add Room
        </button>
      </div>

      {/* Rooms Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-medium text-gray-700 mb-4">All Rooms</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2">Building</th>
                <th className="px-4 py-2">Floor</th>
                <th className="px-4 py-2">Room #</th>
                <th className="px-4 py-2">Benches</th>
                <th className="px-4 py-2">Students/Bench</th>
                <th className="px-4 py-2">Capacity</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{room.building}</td>
                  <td className="px-4 py-2">{room.floor}</td>
                  <td className="px-4 py-2">{room.roomNumber}</td>
                  <td className="px-4 py-2">{room.totalBenches}</td>
                  <td className="px-4 py-2">{room.studentsPerBench}</td>
                  <td className="px-4 py-2">{room.capacity}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No rooms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
