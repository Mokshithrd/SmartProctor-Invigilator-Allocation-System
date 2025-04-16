import { FaHome, FaCalendarAlt, FaUserGraduate, FaBuilding } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: <FaHome />, path: '/dashboard/admin' },
  { label: 'Exams', icon: <FaCalendarAlt />, path: '/exams' },
  { label: 'Faculty', icon: <FaUserGraduate />, path: '/dashboard/faculty' },
  { label: 'Rooms', icon: <FaBuilding />, path: '/rooms' },
];

export default function Sidebar({ user }) {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-white shadow-md border-r min-h-screen fixed hidden md:block">
      <div className="p-6 text-2xl font-bold text-blue-600">
        ExamFlow
        <p className="text-sm text-gray-500 mt-1 font-normal">Welcome, {user?.name}</p>
      </div>
      <nav className="space-y-1 px-4 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
