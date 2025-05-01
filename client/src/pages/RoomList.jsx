import { useEffect, useState } from "react";
import axios from "axios";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    axios.get("http://localhost:4000/room/all", { withCredentials: true })
      .then(res => setRooms(res.data.data))
      .catch(err => console.error("Error fetching rooms:", err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    axios.delete(`http://localhost:4000/room/delete/${id}`, { withCredentials: true })
      .then(() => fetchRooms())
      .catch(err => console.error("Error deleting room:", err));
  };

  const handleEdit = (room) => {
    setEditingRoomId(room._id);
    setEditData({
      building: room.building,
      floor: room.floor,
      roomNumber: room.roomNumber,
      totalBenches: room.totalBenches,
      studentsPerBench: room.studentsPerBench,
    });
  };

  const handleEditChange = (e) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = (id) => {
    axios.put(`http://localhost:4000/room/update/${id}`, editData, { withCredentials: true })
      .then(() => {
        setEditingRoomId(null);
        fetchRooms();
      })
      .catch(err => console.error("Error updating room:", err));
  };

  return (
    <div className="ml-64 p-6">
      <h1 className="text-2xl font-bold mb-4">All Rooms</h1>
      <div className="space-y-4">
        {rooms.map(room => (
          <div key={room._id} className="border rounded p-4 shadow">
            {editingRoomId === room._id ? (
              <div className="space-y-2">
                {["building", "floor", "roomNumber", "totalBenches", "studentsPerBench"].map(field => (
                  <input
                    key={field}
                    name={field}
                    value={editData[field]}
                    onChange={handleEditChange}
                    placeholder={field}
                    className="w-full p-2 border rounded"
                  />
                ))}
                <div className="space-x-2">
                  <button
                    onClick={() => handleEditSubmit(room._id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingRoomId(null)}
                    className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold">{room.building} - Room {room.roomNumber}</h2>
                <p>Floor: {room.floor}</p>
                <p>Total Benches: {room.totalBenches}</p>
                <p>Students per Bench: {room.studentsPerBench}</p>
                <p>Capacity: {room.capacity}</p>
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
