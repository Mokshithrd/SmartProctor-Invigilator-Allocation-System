import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  Book,
  Download,
  ChevronRight,
  Building,
  BookOpen,
  User,
  AlertCircle,
  Mail,
  Phone,
  Clock2,
} from "lucide-react";

const ExamDetail = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("rooms");
  const [downloading, setDownloading] = useState({
    student: false,
    faculty: false,
  });
  const [facultyDetails, setFacultyDetails] = useState([]);
  const [conflictingExams, setConflictingExams] = useState({});

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/exams/${id}`);
        setExam(response.data.exam);

        // If we have faculty IDs, fetch their complete details
        if (
          response.data.exam.faculty &&
          response.data.exam.faculty.length > 0
        ) {
          await fetchFacultyDetails(response.data.exam.faculty);
        }

        // Check for faculty conflicts
        if (
          response.data.exam.subjects &&
          response.data.exam.subjects.length > 0
        ) {
          await checkFacultyConflicts(response.data.exam);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching exam details:", error);
        setError("Failed to load exam details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExamDetails();
    }
  }, [id]);

  const fetchFacultyDetails = async (facultyIds) => {
    try {
      // Make sure facultyIds is an array and each element is a valid ID
      if (!Array.isArray(facultyIds)) {
        console.error("facultyIds is not an array:", facultyIds);
        return;
      }

      // Fetch individual faculty members
      const facultyPromises = facultyIds.map((facultyId, index) => {
        // Handle if facultyId is an object
        let originalId = facultyId; // Store original ID for reference

        if (typeof facultyId === "object") {
          const id = facultyId._id || facultyId.id || facultyId.facultyId;
          if (!id) {
            console.error(
              "Could not extract ID from faculty object:",
              facultyId
            );
            return Promise.reject(new Error("Invalid faculty ID"));
          }
          facultyId = id;
        }

        return axios
          .get(`http://localhost:4000/faculty/allocations/${facultyId}`, {
            withCredentials: true,
          })
          .then((response) => {
            // Include the original ID in the response for reference
            return {
              response,
              originalId,
              actualId: facultyId,
            };
          });
      });

      const results = await Promise.all(
        facultyPromises.filter((p) => p !== undefined)
      );

      // Transform the API response to match the structure expected by the component
      const facultyData = results.map((result, index) => {
        const { response, originalId, actualId } = result;
        const data = response.data.data;

        // Create a faculty object with the structure the component expects
        return {
          _id: actualId, // Use the actual ID for API calls
          uniqueKey: `faculty-${index}-${actualId}`, // Create a guaranteed unique key
          name: data.facultyName || "Unknown Faculty",
          designation: data.designation || "Faculty",
          allocations: data.allocations || [],
        };
      });

      setFacultyDetails(facultyData);
    } catch (error) {
      console.error("Error fetching faculty details:", error);
    }
  };

  const checkFacultyConflicts = async (currentExam) => {
    try {
      // Fetch all exams to check for conflicts
      const examsResponse = await axios.get("http://localhost:4000/exams/", {withCredentials: true});
      const allExams = examsResponse.data.data || [];

      // Track conflicts for each faculty member
      const conflicts = {};

      // For each faculty in the current exam
      currentExam.faculty.forEach((facultyId) => {
        conflicts[facultyId] = [];

        // For each other exam
        allExams.forEach((exam) => {
          // Skip the current exam
          if (exam._id === currentExam._id) return;

          // Check if this faculty is assigned to this exam
          if (!exam.faculty.includes(facultyId)) return;

          // Check for time conflicts between subjects
          currentExam.subjects.forEach((currentSubject) => {
            exam.subjects.forEach((examSubject) => {
              // If dates don't match, there's no conflict
              if (examSubject.date !== currentSubject.date) return;

              // Check for time overlap
              const examStart = new Date(`1970-01-01T${examSubject.startTime}`);
              const examEnd = new Date(`1970-01-01T${examSubject.endTime}`);
              const subjectStart = new Date(
                `1970-01-01T${currentSubject.startTime}`
              );
              const subjectEnd = new Date(
                `1970-01-01T${currentSubject.endTime}`
              );

              // Check if times overlap
              if (
                (subjectStart >= examStart && subjectStart < examEnd) ||
                (subjectEnd > examStart && subjectEnd <= examEnd) ||
                (subjectStart <= examStart && subjectEnd >= examEnd)
              ) {
                // Add to conflicts if not already there
                if (!conflicts[facultyId].some((c) => c.examId === exam._id)) {
                  conflicts[facultyId].push({
                    examId: exam._id,
                    examName: exam.name,
                    subject: examSubject.name,
                    date: examSubject.date,
                    time: `${examSubject.startTime} - ${examSubject.endTime}`,
                  });
                }
              }
            });
          });
        });
      });

      setConflictingExams(conflicts);
    } catch (error) {
      console.error("Error checking faculty conflicts:", error);
    }
  };

  const handleDownloadPDF = async (type) => {
    try {
      setDownloading((prev) => ({ ...prev, [type]: true }));
      const response = await axios.get(
        `http://localhost:4000/pdf/${type}-room-pdf/${id}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_allotments_${exam.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error downloading ${type} allotment PDF:`, error);
    } finally {
      setDownloading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const hasConflicts = (facultyId) => {
    return (
      conflictingExams[facultyId] && conflictingExams[facultyId].length > 0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-blue-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-indigo-100">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-4 w-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-4 w-4 bg-indigo-600 rounded-full animate-bounce"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading exam details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  const { name, semester, rooms, faculty, subjects } = exam;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString; // fallback to original string if parsing fails
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-indigo-100 transform transition-all hover:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <Book className="text-indigo-500 mr-3" size={28} />
                {name}
              </h1>
              <div className="flex items-center mb-3">
                <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
                <span className="text-gray-600">Semester {semester}</span>
              </div>
            </div>
            <div className="inline-flex mt-4 md:mt-0 space-x-2">
              <span className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                <Book className="h-4 w-4 mr-2" /> {subjects?.length || 0}{" "}
                Subjects
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                <Building className="h-4 w-4 mr-2" /> {rooms?.length || 0} Rooms
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                <Users className="h-4 w-4 mr-2" /> {faculty?.length || 0}{" "}
                Faculty
              </span>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-indigo-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all duration-200 ease-in-out ${
                activeTab === "rooms"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-500 hover:bg-indigo-50"
              }`}
              onClick={() => setActiveTab("rooms")}
            >
              <div className="flex items-center justify-center">
                <Building className="h-4 w-4 mr-2" />
                Rooms
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all duration-200 ease-in-out ${
                activeTab === "faculty"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-500 hover:bg-indigo-50"
              }`}
              onClick={() => setActiveTab("faculty")}
            >
              <div className="flex items-center justify-center">
                <User className="h-4 w-4 mr-2" />
                Faculty
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-all duration-200 ease-in-out ${
                activeTab === "subjects"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-500 hover:bg-indigo-50"
              }`}
              onClick={() => setActiveTab("subjects")}
            >
              <div className="flex items-center justify-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Subjects
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Rooms Tab */}
            {activeTab === "rooms" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building className="text-indigo-500 mr-2" />
                  Room Allocations
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms?.length ? (
                    rooms.map((room) => (
                      <div
                        key={room._id}
                        className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm transition-all hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-800">
                            Room {room.roomNumber}
                          </div>
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                            Floor {room.floor}
                          </span>
                        </div>
                        <div className="mt-1 text-gray-600">
                          {room.building}
                        </div>
                        <div className="mt-2 text-gray-700 text-xs">
                          <span className="font-medium">Capacity:</span>{" "}
                          {room.capacity || room.totalBenches || "N/A"} students
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full flex justify-center items-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                        No rooms have been allocated yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Faculty Tab */}
            {activeTab === "faculty" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="text-indigo-500 mr-2" />
                  Faculty Assignments
                </h2>

                <div className="space-y-3">
                  {facultyDetails?.length ? (
                    facultyDetails.map((member, index) => (
                      <div
                        key={
                          member.uniqueKey || `faculty-${index}-${member._id}`
                        }
                        className={`px-5 py-4 bg-gray-50 border rounded-lg transition-all hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50 ${
                          hasConflicts(member._id)
                            ? "border-amber-300 bg-amber-50"
                            : "border-gray-100"
                        }`}
                      >
                        {/* Rest of faculty display code */}
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 h-10 w-10 ${
                              hasConflicts(member._id)
                                ? "bg-amber-100 text-amber-600"
                                : "bg-indigo-100 text-indigo-600"
                            } rounded-full flex items-center justify-center font-bold`}
                          >
                            {(member.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {member.designation || "Faculty"}
                            </div>
                          </div>

                          {hasConflicts(member._id) && (
                            <div className="ml-auto">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Schedule Conflict
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Show faculty allocations */}
                        {member.allocations &&
                          member.allocations.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <h4 className="text-xs font-medium text-gray-700 mb-2">
                                Allocated to:
                              </h4>
                              <div className="space-y-2">
                                {member.allocations
                                  .slice(0, 3)
                                  .map((alloc, idx) => (
                                    <div
                                      key={`${member.uniqueKey}-alloc-${idx}`}
                                      className="text-xs bg-white p-2 rounded border border-gray-100"
                                    >
                                      <div className="font-medium">
                                        {alloc.examName} - {alloc.subjectName}
                                      </div>
                                      <div className="flex items-center mt-1 text-gray-600">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {formatDate(alloc.date)}
                                        <Clock2 className="h-3 w-3 ml-2 mr-1" />
                                        {alloc.startTime} - {alloc.endTime}
                                      </div>
                                    </div>
                                  ))}
                                {member.allocations.length > 3 && (
                                  <div className="text-xs text-indigo-600 font-medium text-center">
                                    + {member.allocations.length - 3} more
                                    allocations
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Show conflict details if any */}
                        {hasConflicts(member._id) && (
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <h4 className="text-xs font-medium text-amber-800 mb-2">
                              Conflicts with:
                            </h4>
                            {conflictingExams[member._id].map(
                              (conflict, idx) => (
                                <div
                                  key={`${member.uniqueKey}-conflict-${idx}`}
                                  className="mb-2 last:mb-0 text-xs bg-white p-2 rounded border border-amber-100"
                                >
                                  <div className="font-medium">
                                    {conflict.examName} - {conflict.subject}
                                  </div>
                                  <div className="flex items-center mt-1 text-gray-600">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(conflict.date)}
                                    <Clock2 className="h-3 w-3 ml-2 mr-1" />
                                    {conflict.time}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : faculty?.length ? (
                    <div className="animate-pulse space-y-3">
                      {Array.from({ length: faculty.length }).map(
                        (_, index) => (
                          <div
                            key={index}
                            className="px-5 py-4 bg-gray-100 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                              <div className="ml-4">
                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                <div className="h-3 w-48 bg-gray-200 rounded mt-2"></div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                      <div className="text-center text-sm text-gray-500 mt-2">
                        Loading faculty details...
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                        No faculty members have been assigned
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subjects Tab */}
            {activeTab === "subjects" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BookOpen className="text-indigo-500 mr-2" />
                  Subject Schedule
                </h2>

                <div className="space-y-3">
                  {subjects?.length ? (
                    subjects.map((subject) => (
                      <div
                        key={subject._id}
                        className="p-4 bg-gray-50 border border-gray-100 rounded-lg transition-all hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-800 text-lg">
                              {subject.name}
                            </div>
                            <div className="text-indigo-600 text-sm mt-1">
                              {subject.subjectCode}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(subject.date)}
                          </div>
                          <div className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {subject.startTime} - {subject.endTime}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center items-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                        No subjects have been added yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Download Buttons */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-end">
              <button
                className={`flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-colors ${
                  downloading.student ? "opacity-75 cursor-not-allowed" : ""
                }`}
                onClick={() =>
                  !downloading.student && handleDownloadPDF("student")
                }
                disabled={downloading.student}
              >
                {downloading.student ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" /> Download Student
                    Allotment
                  </>
                )}
              </button>
              <button
                className={`flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-colors ${
                  downloading.faculty ? "opacity-75 cursor-not-allowed" : ""
                }`}
                onClick={() =>
                  !downloading.faculty && handleDownloadPDF("faculty")
                }
                disabled={downloading.faculty}
              >
                {downloading.faculty ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" /> Download Faculty
                    Allotment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetail;
