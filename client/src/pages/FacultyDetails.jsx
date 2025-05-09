import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Award,
  BookOpen,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";

export default function FacultyDetails() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:4000/faculty/${id}`, { withCredentials: true })
      .then((res) => {
        setFaculty(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching faculty:", err);
        setError("Failed to load faculty details");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="ml-71 p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading faculty details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-red-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!faculty) return null;

  return (
    <div className="ml-64 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb navigation */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition font-medium"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back to Faculty List
          </button>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header with background color */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h1 className="text-2xl font-bold">Faculty Details</h1>
            <p className="opacity-80">
              Complete information about the selected faculty member
            </p>
          </div>

          {/* Main content */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              {/* Profile avatar */}
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-6 flex justify-center">
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <User size={64} />
                </div>
              </div>

              {/* Faculty information */}
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-800">
                  {faculty.name}
                </h2>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Award className="h-5 w-5 mr-2 text-indigo-500" />
                    <span className="font-medium">Designation:</span>
                    <span className="ml-2">{faculty.designation}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2 text-indigo-500" />
                    <span className="font-medium">Email:</span>
                    <a
                      href={`mailto:${faculty.email}`}
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      {faculty.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-800">
                    Course Allocations
                  </h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  View all course allocations for this faculty member
                </p>
                <Link
                  to={`/faculty/allocations/${id}`}
                  className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  View allocation history
                  <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100 hover:shadow-md transition duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-800">
                    Faculty Documents
                  </h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Access related documents and publications
                </p>
                <button className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800">
                  View documents
                  <ExternalLink className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer with actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition">
              Edit Details
            </button>
            <div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Contact Faculty
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
