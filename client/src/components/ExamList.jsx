import { useSelector } from "react-redux";

const ExamList = ({ type }) => {
  const { upcoming, inProgress, completed, loading} = useSelector(
    (state) => state.exams
  );

  let exams = [];
  if (type === "upcoming") exams = upcoming;
  else if (type === "inProgress") exams = inProgress;
  else if (type === "completed") exams = completed;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 capitalize">{type} Exams</h2>

      {loading ? (
        <p>Loading...</p>
      ) : exams.length === 0 ? (
        <p>No exams found.</p>
      ) : (
        <ul className="space-y-4">
          {exams.map((exam, index) => (
            <li key={index} className="p-4 border rounded-xl bg-white shadow-sm">
              <div className="font-medium text-lg">{exam.name}</div>
              <div className="text-gray-600">
                Semester: {exam.semester} — {exam.year}
              </div>
              <div className="text-sm text-gray-500">
                Students: {exam.totalStudents} | Rooms: {exam.roomsUsed} | Faculty:{" "}
                {exam.uniqueFacultyCount}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExamList;
