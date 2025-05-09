import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckSquare,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Loader,
  Check,
  Users,
  X,
} from "lucide-react";
import axios from "axios";

const CreateExamForm = () => {
  const [examName, setExamName] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [totalStudents, setTotalStudents] = useState("");
  const [rooms, setRooms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]); // Store all faculty
  const [availableFaculty, setAvailableFaculty] = useState([]); // Store available faculty
  const [subjects, setSubjects] = useState([
    { name: "", subjectCode: "", date: "", startTime: "", endTime: "" },
  ]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [formErrors, setFormErrors] = useState({});
  const [existingExams, setExistingExams] = useState([]);

  useEffect(() => {
    const fetchRoomsAndFaculty = async () => {
      try {
        setLoading(true);
        const roomsResponse = await axios.get(
          "http://localhost:4000/room/all",
          { withCredentials: true }
        );
        const facultyResponse = await axios.get(
          "http://localhost:4000/faculty/all",
          { withCredentials: true }
        );
        const examsResponse = await axios.get("http://localhost:4000/exams/", {
          withCredentials: true,
        });

        // Log the responses to debug
        console.log("Rooms:", roomsResponse.data);
        console.log("Faculty:", facultyResponse.data);
        console.log("Exams:", examsResponse.data);

        // Extract the data arrays from the responses
        const roomsData = roomsResponse.data.data || [];
        const facultyData = facultyResponse.data.data || [];
        const examsData = examsResponse.data.data || [];

        setRooms(roomsData);
        setAllFaculty(facultyData); // Store all faculty
        setFaculty(facultyData); // Initially set all faculty as available
        setExistingExams(examsData);
      } catch (err) {
        setFormStatus({
          type: "error",
          message: "Error loading rooms and faculty data. Please try again.",
        });
        console.error("Error fetching rooms and faculty:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomsAndFaculty();
  }, []);

  // Filter faculty based on subject date and time
  useEffect(() => {
    // Only proceed if we have subjects with dates and times
    if (!subjects[0].date || !subjects[0].startTime || !subjects[0].endTime) {
      return;
    }

    // Create a copy of all faculty
    let availableFacultyList = [...allFaculty];

    // For each subject in the current exam
    subjects.forEach((subject) => {
      if (subject.date && subject.startTime && subject.endTime) {
        // Filter out faculty who are already assigned to exams at this time
        availableFacultyList = availableFacultyList.filter((fac) => {
          // Check if this faculty is assigned to any existing exam subject
          // that overlaps with the current subject's time
          const isUnavailable = existingExams.some((exam) => {
            // Check if faculty is assigned to this exam
            if (!exam.faculty.includes(fac._id)) return false;

            // Check if any subject in this exam overlaps with our current subject
            return exam.subjects.some((examSubject) => {
              // If dates don't match, there's no conflict
              if (examSubject.date !== subject.date) return false;

              // Check for time overlap
              const examStart = new Date(`1970-01-01T${examSubject.startTime}`);
              const examEnd = new Date(`1970-01-01T${examSubject.endTime}`);
              const subjectStart = new Date(`1970-01-01T${subject.startTime}`);
              const subjectEnd = new Date(`1970-01-01T${subject.endTime}`);

              // Check if times overlap
              return (
                (subjectStart >= examStart && subjectStart < examEnd) ||
                (subjectEnd > examStart && subjectEnd <= examEnd) ||
                (subjectStart <= examStart && subjectEnd >= examEnd)
              );
            });
          });

          return !isUnavailable;
        });
      }
    });

    // Update available faculty
    setFaculty(availableFacultyList);

    // Remove any selected faculty who are no longer available
    setSelectedFaculty((prev) =>
      prev.filter((facId) =>
        availableFacultyList.some((fac) => fac._id === facId)
      )
    );
  }, [subjects, allFaculty, existingExams]);

  const validateForm = () => {
    const errors = {};

    if (!examName.trim()) errors.examName = "Exam name is required";
    if (!semester || isNaN(semester))
      errors.semester = "Valid semester is required";
    if (!year || isNaN(year)) errors.year = "Valid year is required";
    if (!totalStudents || isNaN(totalStudents) || totalStudents <= 0)
      errors.totalStudents = "Valid number of students is required";

    if (selectedRooms.length === 0) errors.rooms = "Select at least one room";
    if (selectedFaculty.length === 0)
      errors.faculty = "Select at least one faculty";

    // Validate subjects
    const subjectErrors = subjects.map((subject) => {
      const subjectError = {};
      if (!subject.name.trim()) subjectError.name = "Subject name is required";
      if (!subject.subjectCode.trim())
        subjectError.subjectCode = "Subject code is required";
      if (!subject.date) subjectError.date = "Date is required";
      if (!subject.startTime) subjectError.startTime = "Start time is required";
      if (!subject.endTime) subjectError.endTime = "End time is required";

      if (
        subject.startTime &&
        subject.endTime &&
        subject.startTime >= subject.endTime
      ) {
        subjectError.time = "End time must be after start time";
      }

      return Object.keys(subjectError).length > 0 ? subjectError : null;
    });

    if (subjectErrors.some((error) => error !== null)) {
      errors.subjects = subjectErrors;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubjectChange = (index, e) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][e.target.name] = e.target.value;
    setSubjects(updatedSubjects);
  };

  const handleAddSubject = () => {
    setSubjects([
      ...subjects,
      { name: "", subjectCode: "", date: "", startTime: "", endTime: "" },
    ]);
  };

  const handleRemoveSubject = (index) => {
    if (subjects.length > 1) {
      const updatedSubjects = [...subjects];
      updatedSubjects.splice(index, 1);
      setSubjects(updatedSubjects);
    }
  };

  const handleRoomChange = (roomId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleFacultyChange = (facultyId) => {
    setSelectedFaculty((prev) =>
      prev.includes(facultyId)
        ? prev.filter((id) => id !== facultyId)
        : [...prev, facultyId]
    );
  };

  // New function to select or deselect all rooms
  const handleSelectAllRooms = () => {
    if (selectedRooms.length === rooms.length) {
      // If all rooms are already selected, deselect all
      setSelectedRooms([]);
    } else {
      // Otherwise, select all rooms
      setSelectedRooms(rooms.map((room) => room._id));
    }
  };

  // New function to select or deselect all faculty
  const handleSelectAllFaculty = () => {
    if (selectedFaculty.length === faculty.length) {
      // If all faculty are already selected, deselect all
      setSelectedFaculty([]);
    } else {
      // Otherwise, select all available faculty
      setSelectedFaculty(faculty.map((fac) => fac._id));
    }
  };

  // Fix for the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setFormStatus({ type: "", message: "" });

    // Explicitly ensure totalStudents is an integer and properly set
    const totalStudentsValue = parseInt(totalStudents, 10);

    // Log the value to ensure it's correct before sending
    console.log("Submitting total students:", totalStudentsValue);

    // Ensure we're sending the correct data format
    const examData = {
      name: examName,
      semester: parseInt(semester, 10),
      year: parseInt(year, 10),
      totalStudents: totalStudentsValue, // Using the explicitly parsed value
      rooms: selectedRooms,
      faculty: selectedFaculty,
      subjects: subjects.map((subject) => ({
        ...subject,
        // Ensure subject fields are properly formatted
        name: subject.name.trim(),
        subjectCode: subject.subjectCode.trim(),
        date: subject.date, // assuming date is already in proper format
        startTime: subject.startTime,
        endTime: subject.endTime,
      })),
    };

    try {
      // Log the entire payload for debugging
      console.log("Submitting exam data:", examData);

      const response = await axios.post(
        "http://localhost:4000/exams/create",
        examData,
        { withCredentials: true }
      );

      // Log the response for debugging
      console.log("Server response:", response.data);

      if (response.data.success) {
        setFormStatus({
          type: "success",
          message: "Exam created successfully!",
        });
        // Reset form after successful submission
        setExamName("");
        setSemester("");
        setYear(new Date().getFullYear());
        setTotalStudents("");
        setSelectedRooms([]);
        setSelectedFaculty([]);
        setSubjects([
          { name: "", subjectCode: "", date: "", startTime: "", endTime: "" },
        ]);
      } else {
        setFormStatus({
          type: "error",
          message:
            response.data.message || "Failed to create exam. Please try again.",
        });
      }
    } catch (err) {
      console.error("Error creating exam:", err);
      console.error("Error details:", err.response?.data);

      setFormStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Error creating exam. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
      window.scrollTo(0, 0);
    }
  };

  const getTotalCapacity = () => {
    if (!Array.isArray(rooms)) return 0;

    return rooms
      .filter((room) => selectedRooms.includes(room._id))
      .reduce(
        (sum, room) => sum + (room.capacity || room.totalBenches || 0),
        0
      );
  };

  // Function to check if faculty is available for current exam times
  const isFacultyAvailable = (facultyId) => {
    return faculty.some((fac) => fac._id === facultyId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin mx-auto h-12 w-12 text-blue-600" />
          <p className="mt-4 text-lg">Loading exam data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          Create New Examination
        </h2>

        {formStatus.message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              formStatus.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            } flex items-center`}
          >
            {formStatus.type === "success" ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 mr-2" />
            )}
            {formStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Name
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  formErrors.examName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="End Semester Examination"
                required
              />
              {formErrors.examName && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.examName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  formErrors.semester ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
              {formErrors.semester && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.semester}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2020"
                max="2030"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  formErrors.year ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {formErrors.year && (
                <p className="mt-1 text-sm text-red-600">{formErrors.year}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Students
              </label>
              <input
                type="number"
                value={totalStudents}
                onChange={(e) => setTotalStudents(e.target.value)}
                min="1"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  formErrors.totalStudents
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="120"
                required
              />
              {formErrors.totalStudents && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.totalStudents}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
              <Calendar className="mr-2 h-5 w-5" />
              Subject Schedule
            </h3>

            {subjects.map((subject, index) => (
              <div
                key={index}
                className="mb-6 p-4 bg-white rounded-md shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">
                    Subject {index + 1}
                  </h4>
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(index)}
                      className="text-red-500 hover:text-red-700 flex items-center text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={subject.name}
                      onChange={(e) => handleSubjectChange(index, e)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        formErrors.subjects && formErrors.subjects[index]?.name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Data Structures"
                      required
                    />
                    {formErrors.subjects &&
                      formErrors.subjects[index]?.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.subjects[index].name}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Code
                    </label>
                    <input
                      type="text"
                      name="subjectCode"
                      value={subject.subjectCode}
                      onChange={(e) => handleSubjectChange(index, e)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        formErrors.subjects &&
                        formErrors.subjects[index]?.subjectCode
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="CS201"
                      required
                    />
                    {formErrors.subjects &&
                      formErrors.subjects[index]?.subjectCode && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.subjects[index].subjectCode}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={subject.date}
                        onChange={(e) => handleSubjectChange(index, e)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                          formErrors.subjects &&
                          formErrors.subjects[index]?.date
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {formErrors.subjects &&
                      formErrors.subjects[index]?.date && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.subjects[index].date}
                        </p>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="time"
                          name="startTime"
                          value={subject.startTime}
                          onChange={(e) => handleSubjectChange(index, e)}
                          className={`w-full pl-9 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                            formErrors.subjects &&
                            formErrors.subjects[index]?.startTime
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          required
                        />
                      </div>
                      {formErrors.subjects &&
                        formErrors.subjects[index]?.startTime && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.subjects[index].startTime}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="time"
                          name="endTime"
                          value={subject.endTime}
                          onChange={(e) => handleSubjectChange(index, e)}
                          className={`w-full pl-9 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                            formErrors.subjects &&
                            formErrors.subjects[index]?.endTime
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          required
                        />
                      </div>
                      {formErrors.subjects &&
                        formErrors.subjects[index]?.endTime && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.subjects[index].endTime}
                          </p>
                        )}
                    </div>

                    {formErrors.subjects &&
                      formErrors.subjects[index]?.time && (
                        <p className="col-span-2 mt-1 text-sm text-red-600">
                          {formErrors.subjects[index].time}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddSubject}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition font-medium mt-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Subject
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-green-50 p-4 rounded-md border border-green-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold flex items-center text-green-800">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    Examination Rooms
                  </h3>

                  {/* Select All button for rooms */}
                  <button
                    type="button"
                    onClick={handleSelectAllRooms}
                    className={`text-sm px-3 py-1 rounded border transition-colors ${
                      selectedRooms.length === rooms.length
                        ? "bg-green-600 text-white border-green-700 hover:bg-green-700"
                        : "bg-white text-green-700 border-green-500 hover:bg-green-50"
                    }`}
                  >
                    {selectedRooms.length === rooms.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                {formErrors.rooms && (
                  <p className="text-sm text-red-600 mb-2">
                    {formErrors.rooms}
                  </p>
                )}

                <div className="max-h-60 overflow-y-auto pr-2">
                  {Array.isArray(rooms) && rooms.length > 0 ? (
                    rooms.map((room) => (
                      <div key={room._id} className="mb-2 last:mb-0">
                        <label
                          className={`flex items-center p-3 border rounded-md cursor-pointer transition ${
                            selectedRooms.includes(room._id)
                              ? "bg-green-100 border-green-300"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectedRooms.includes(room._id)}
                            onChange={() => handleRoomChange(room._id)}
                          />
                          <div className="ml-3">
                            <span className="block font-medium text-gray-900">
                              {room.building} - Room {room.roomNumber}
                            </span>
                            <span className="block text-sm text-gray-500">
                              Capacity: {room.totalBenches} benches
                            </span>
                          </div>
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 py-2">No rooms available</p>
                  )}
                </div>

                {selectedRooms.length > 0 && (
                  <div className="mt-3 bg-white p-3 rounded-md border border-green-200">
                    <div className="text-sm">
                      <span className="font-medium">Selected:</span>{" "}
                      {selectedRooms.length} rooms
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Total capacity:</span>{" "}
                      {getTotalCapacity()} students
                    </div>
                    {totalStudents && (
                      <div
                        className={`text-sm mt-1 ${
                          getTotalCapacity() < totalStudents
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {getTotalCapacity() < totalStudents
                          ? `⚠️ Insufficient capacity (${
                              totalStudents - getTotalCapacity()
                            } seats short)`
                          : `✓ Sufficient capacity (${
                              getTotalCapacity() - totalStudents
                            } extra seats)`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold flex items-center text-indigo-800">
                    <Users className="mr-2 h-5 w-5" />
                    Faculty Supervisors
                  </h3>

                  {/* Select All button for faculty */}
                  <button
                    type="button"
                    onClick={handleSelectAllFaculty}
                    disabled={faculty.length === 0}
                    className={`text-sm px-3 py-1 rounded border transition-colors ${
                      faculty.length === 0
                        ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                        : selectedFaculty.length === faculty.length
                        ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700"
                        : "bg-white text-indigo-700 border-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    {selectedFaculty.length === faculty.length &&
                    faculty.length > 0
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                {formErrors.faculty && (
                  <p className="text-sm text-red-600 mb-2">
                    {formErrors.faculty}
                  </p>
                )}

                {/* Display warning if some faculty are filtered out */}
                {allFaculty.length > faculty.length && subjects[0].date && (
                  <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Some faculty members are not shown as they are already
                      assigned to other exams at the selected date and time.
                    </span>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto pr-2">
                  {Array.isArray(faculty) && faculty.length > 0 ? (
                    faculty.map((fac) => (
                      <div key={fac._id} className="mb-2 last:mb-0">
                        <label
                          className={`flex items-center p-3 border rounded-md cursor-pointer transition ${
                            selectedFaculty.includes(fac._id)
                              ? "bg-indigo-100 border-indigo-300"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={selectedFaculty.includes(fac._id)}
                            onChange={() => handleFacultyChange(fac._id)}
                          />
                          <div className="ml-3">
                            <span className="block font-medium text-gray-900">
                              {fac.name}
                            </span>
                            <span className="block text-sm text-gray-500">
                              {fac.email}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))
                  ) : subjects[0].date ? (
                    <p className="text-amber-600 py-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      No faculty available for the selected date and time
                    </p>
                  ) : (
                    <p className="text-gray-500 py-2">
                      Select subject date and time to see available faculty
                    </p>
                  )}
                </div>

                {selectedFaculty.length > 0 && (
                  <div className="mt-3 bg-white p-3 rounded-md border border-indigo-200">
                    <div className="text-sm">
                      <span className="font-medium">Selected:</span>{" "}
                      {selectedFaculty.length} faculty members
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Recommended:</span>{" "}
                      {Math.ceil(getTotalCapacity() / 30)} supervisors{" "}
                      {selectedFaculty.length <
                        Math.ceil(getTotalCapacity() / 30) && (
                        <span className="text-amber-600">
                          (Consider adding more)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md text-white font-medium flex items-center ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              } transition-colors shadow-sm`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Creating Exam...
                </>
              ) : (
                "Create Exam"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamForm;
