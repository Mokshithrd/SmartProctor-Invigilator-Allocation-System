import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllExams } from "../redux/slices/examSlice";
import {
  Loader2,
  AlertTriangle,
  BookOpenCheck,
  Clock,
  CalendarCheck2,
} from "lucide-react";
import { Link } from "react-router-dom";

const ExamPage = () => {
  const dispatch = useDispatch();
  const { upcoming, inProgress, completed, loading, error } = useSelector(
    (state) => state.exams
  );

  useEffect(() => {
    dispatch(fetchAllExams());
  }, [dispatch]);

  const StatCard = ({ title, count, icon: Icon, color, to }) => (
    <Link to={to} className="w-full sm:w-72">
      <div
        className={`rounded-2xl shadow-md p-6 border ${color} bg-white hover:shadow-lg transition-all`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`${color} w-6 h-6`} />
          </div>
          <div>
            <h4 className="text-lg font-semibold">{title}</h4>
            <p className="text-xl font-bold text-gray-800">{count}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Exam Overview</h1>

      {loading && (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin w-5 h-5" />
          Loading exams...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <StatCard
              title="Upcoming Exams"
              count={upcoming.length}
              icon={CalendarCheck2}
              color="text-blue-600"
              to="/exams/upcoming"
            />

            <StatCard
              title="Ongoing Exams"
              count={inProgress.length}
              icon={Clock}
              color="text-orange-500"
              to="/exams/ongoing"
            />

            <StatCard
              title="Completed Exams"
              count={completed.length}
              icon={BookOpenCheck}
              color="text-green-600"
              to="/exams/completed"
            />
          </div>

          {/* Future: Detailed table or list of exams per section */}
        </>
      )}
    </div>
  );
};

export default ExamPage;
