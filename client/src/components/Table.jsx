export default function Table({ exams }) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-8 overflow-auto">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Exam Schedule</h3>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Subject</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Date</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Time</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Room</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Faculty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {exams.map((exam, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 text-gray-800">{exam.subject}</td>
                <td className="px-4 py-2 text-gray-700">{exam.date}</td>
                <td className="px-4 py-2 text-gray-700">{exam.time}</td>
                <td className="px-4 py-2 text-gray-700">{exam.room}</td>
                <td className="px-4 py-2 text-gray-700">{exam.faculty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  