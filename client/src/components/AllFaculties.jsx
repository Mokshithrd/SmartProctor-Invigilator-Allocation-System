import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFaculties } from "../redux/slices/facultySlice";

export default function AllFaculties() {
  const dispatch = useDispatch();
  const { faculties, loading, error } = useSelector((state) => state.faculty);

  useEffect(() => {
    dispatch(fetchAllFaculties());
  }, [dispatch]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">All Registered Faculty</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculties.map((faculty) => (
            <div key={faculty._id} className="bg-white p-4 rounded-xl shadow">
              <p className="font-semibold">{faculty.name}</p>
              <p>{faculty.email}</p>
              <p>{faculty.designation}</p>
              <a
                href={`/dashboard/faculty/${faculty._id}`}
                className="text-blue-500 underline text-sm mt-2 inline-block"
              >
                View Allocations
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
