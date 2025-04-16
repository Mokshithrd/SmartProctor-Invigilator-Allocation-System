import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="md:hidden bg-white shadow border-b px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="text-lg font-bold text-blue-600">
        <Link to="/">ExamFlow</Link>
      </div>

      {/* Collapsed Menu or Quick Links (optional, minimal for mobile) */}
      <div className="text-sm text-gray-500">Welcome, Admin</div>
    </nav>
  );
}
