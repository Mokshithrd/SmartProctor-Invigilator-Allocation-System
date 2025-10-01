import { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom";
import {
  Search,
  Building,
  Trash2,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCcw,
  AlertCircle
} from "lucide-react";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("building");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  // Field labels for table headers and form fields
  const fieldLabels = {
    building: "Building",
    floor: "Floor",
    roomNumber: "Room Number",
    totalBenches: "Total Benches",
    studentsPerBench: "Students per Bench",
    capacity: "Capacity",
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchRooms = () => {
    setIsLoading(true);
    // Using fetch instead of axios
    fetch("http://smartproctor-mokshith.onrender.com/room/all", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.data);
        showToast("success", "Rooms loaded successfully");
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        showToast("error", "Failed to load rooms");
      })
      .finally(() => setIsLoading(false));
  };

  const showToast = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    
    fetch(`http://smartproctor-mokshith.onrender.com/room/delete/${id}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to delete");
        fetchRooms();
        showToast("success", "Room deleted successfully");
      })
      .catch((err) => {
        console.error("Error deleting room:", err);
        showToast("error", "Failed to delete room");
      });
  };

  const handleEdit = (room, e) => {
    e?.stopPropagation();
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
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = (id, e) => {
    e?.stopPropagation();
    fetch(`http://smartproctor-mokshith.onrender.com/room/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(editData)
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to update");
        setEditingRoomId(null);
        fetchRooms();
        showToast("success", "Room updated successfully");
      })
      .catch(err => {
        console.error("Error updating room:", err);
        showToast("error", "Failed to update room");
      });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  const getBuildingColorClass = (building) => {
    const buildingColors = {
      "A": "bg-blue-100 text-blue-800",
      "B": "bg-green-100 text-green-800",
      "C": "bg-purple-100 text-purple-800",
      "D": "bg-pink-100 text-pink-800"
    };
    return buildingColors[building] || "bg-gray-100 text-gray-800";
  };

  const filteredRooms = rooms
    .filter(room =>
      room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.floor.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {notification.show && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg transition-all ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <AlertCircle size={20} className="mr-2" />
          <p>{notification.message}</p>
        </div>
      )}

      <div className="p-6 ml-71">
        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Building size={28} className="mr-2 text-blue-600" />
            Room Management
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
            
            <button 
              onClick={fetchRooms} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
            >
              <RefreshCcw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} found
          </div>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
          onClick={() => navigate("/rooms/add")}
          >
            <Plus size={16} className="mr-2" />
            Add Room
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading rooms data...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow">
            <AlertCircle size={40} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">No rooms found</p>
            <p className="text-gray-500">Try adjusting your search or add a new room.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.entries(fieldLabels).map(([field, label]) => (
                      <th
                        key={field}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort(field)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{label}</span>
                          {getSortIcon(field)}
                        </div>
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRooms.map((room) => (
                    <tr key={room._id} className="hover:bg-blue-50 transition-colors">
                      {editingRoomId === room._id ? (
                        <>
                          <td colSpan="6" className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {["building", "floor", "roomNumber", "totalBenches", "studentsPerBench"].map((field) => (
                                <div key={field} className="col-span-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {fieldLabels[field]}
                                  </label>
                                  <input
                                    name={field}
                                    value={editData[field] || ""}
                                    onChange={handleEditChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={(e) => handleEditSubmit(room._id, e)}
                                className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600"
                              >
                                <Save size={16} className="mr-1" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingRoomId(null)}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                              >
                                <X size={16} className="mr-1" />
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-md ${getBuildingColorClass(room.building)}`}>
                              <span className="font-semibold">{room.building}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{room.floor}</td>
                          <td className="px-6 py-4 text-gray-500">{room.roomNumber}</td>
                          <td className="px-6 py-4 text-gray-500">{room.totalBenches}</td>
                          <td className="px-6 py-4 text-gray-500">{room.studentsPerBench}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {room.capacity} students
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={(e) => handleEdit(room, e)}
                                className="inline-flex items-center px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                              >
                                <Edit size={14} className="mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => handleDelete(room._id, e)}
                                className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
