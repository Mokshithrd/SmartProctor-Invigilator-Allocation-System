import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import moment from "moment";

const CreateExam = () => {
  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [rooms, setRooms] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [allRooms, setAllRooms] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);

  const [semesters, setSemesters] = useState([
    {
      semester: "",
      totalStudents: "",
      subjects: [{ name: "", subjectCode: "", date: "", startTime: "", endTime: "" }],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // New states for capacity and faculty recommendations
  const [roomCapacityMessage, setRoomCapacityMessage] = useState(null);
  const [facultyRecommendationMessage, setFacultyRecommendationMessage] = useState(null);

  // --- Derived States (using useMemo for efficiency) ---

  // Calculate total students across all semesters
  const totalStudentsForAllSemesters = useMemo(() => {
    return semesters.reduce((sum, sem) => sum + (Number(sem.totalStudents) || 0), 0);
  }, [semesters]);

  // Calculate total subjects across all semesters
  const totalSubjectsForAllSemesters = useMemo(() => {
    return semesters.reduce((sum, sem) => sum + (sem.subjects ? sem.subjects.length : 0), 0);
  }, [semesters]);

  // Calculate total capacity of selected rooms
  const selectedRoomsTotalCapacity = useMemo(() => {
    return rooms.reduce((sum, roomId) => {
      const room = allRooms.find((r) => r._id === roomId);
      return sum + (room ? room.capacity : 0);
    }, 0);
  }, [rooms, allRooms]);

  // --- Effects ---

  // Fetch rooms and faculty on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const roomsRes = await axios.get("http://smartproctor-mokshith.onrender.com/room/all", { withCredentials: true });
        const facultyRes = await axios.get("http://smartproctor-mokshith.onrender.com/faculty/all", { withCredentials: true });

        setAllRooms(roomsRes.data.data || []);
        setAllFaculty(facultyRes.data.data || []);
      } catch (error) {
        console.error("Error fetching rooms or faculty:", error);
        setMessage({ type: "error", text: "Failed to load available rooms or faculty." });
      }
    }
    fetchData();
  }, []);

  // Effect for room capacity message
  useEffect(() => {
    if (totalStudentsForAllSemesters > 0 && selectedRoomsTotalCapacity > 0) {
      const remainingCapacity = selectedRoomsTotalCapacity - totalStudentsForAllSemesters;
      if (remainingCapacity >= 0) {
        setRoomCapacityMessage({
          type: "success",
          text: `Sufficient capacity! ${remainingCapacity} seats remaining.`,
        });
      } else {
        setRoomCapacityMessage({
          type: "error",
          text: `Insufficient capacity! Need ${Math.abs(remainingCapacity)} more seats.`,
        });
      }
    } else if (totalStudentsForAllSemesters > 0 && selectedRoomsTotalCapacity === 0) {
      setRoomCapacityMessage({ type: "error", text: `Please select rooms to accommodate ${totalStudentsForAllSemesters} students.` });
    } else {
      setRoomCapacityMessage(null); // Clear message if no students or rooms selected
    }
  }, [selectedRoomsTotalCapacity, totalStudentsForAllSemesters, rooms]);


  // Effect for faculty recommendation message
  useEffect(() => {
    if (totalSubjectsForAllSemesters > 0) {
      // Heuristic: 1 faculty member for every 2 subjects (adjust as needed)
      const recommendedFaculty = Math.ceil(totalSubjectsForAllSemesters / 2);
      if (faculty.length >= recommendedFaculty) {
        setFacultyRecommendationMessage({
          type: "success",
          text: `Sufficient faculty selected (${faculty.length}/${recommendedFaculty} recommended).`,
        });
      } else {
        setFacultyRecommendationMessage({
          type: "warning",
          text: `Recommended faculty: ${recommendedFaculty}. You have selected ${faculty.length}.`,
        });
      }
    } else {
      setFacultyRecommendationMessage(null); // Clear message if no subjects
    }
  }, [totalSubjectsForAllSemesters, faculty]);


  // --- Handlers for form fields ---
  const handleSemesterChange = (index, field, value) => {
    const newSemesters = [...semesters];
    newSemesters[index][field] = value;
    setSemesters(newSemesters);
    setErrors((prev) => ({ ...prev, [`semester-${index}-${field}`]: null }));
  };

  const handleSubjectChange = (semIndex, subIndex, field, value) => {
    const newSemesters = [...semesters];
    newSemesters[semIndex].subjects[subIndex][field] = value;
    setSemesters(newSemesters);
    setErrors((prev) => ({ ...prev, [`subject-${semIndex}-${subIndex}-${field}`]: null }));
  };

  const addSemester = () => {
    if (semesters.length >= 2) {
      setMessage({ type: "error", text: "Maximum 2 semesters allowed." });
      return;
    }
    setSemesters([
      ...semesters,
      {
        semester: "",
        totalStudents: "",
        subjects: [{ name: "", subjectCode: "", date: "", startTime: "", endTime: "" }],
      },
    ]);
  };

  const removeSemester = (index) => {
    if (semesters.length === 1) {
      setMessage({ type: "error", text: "At least 1 semester required." });
      return;
    }
    const newSemesters = semesters.filter((_, i) => i !== index);
    setSemesters(newSemesters);
  };

  const addSubject = (semIndex) => {
    const newSemesters = [...semesters];
    newSemesters[semIndex].subjects.push({ name: "", subjectCode: "", date: "", startTime: "", endTime: "" });
    setSemesters(newSemesters);
  };

  const removeSubject = (semIndex, subIndex) => {
    const newSemesters = [...semesters];
    if (newSemesters[semIndex].subjects.length === 1) {
      setMessage({ type: "error", text: "At least 1 subject required per semester." });
      return;
    }
    newSemesters[semIndex].subjects.splice(subIndex, 1);
    setSemesters(newSemesters);
  };

  // --- Select/Deselect All Handlers ---
  const selectAllRooms = () => {
    setRooms(allRooms.map((room) => room._id));
    setErrors((prevErrors) => ({ ...prevErrors, rooms: null }));
  };

  const deselectAllRooms = () => {
    setRooms([]);
    setErrors((prevErrors) => ({ ...prevErrors, rooms: null }));
  };

  const selectAllFaculty = () => {
    setFaculty(allFaculty.map((f) => f._id));
    setErrors((prevErrors) => ({ ...prevErrors, faculty: null }));
  };

  const deselectAllFaculty = () => {
    setFaculty([]);
    setErrors((prevErrors) => ({ ...prevErrors, faculty: null }));
  };


  // Handle checkbox changes for rooms and faculty
  const toggleRoom = (roomId) => {
    setRooms((prev) => {
      const newRooms = prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId];
      setErrors((prevErrors) => ({ ...prevErrors, rooms: null })); // Clear error on change
      return newRooms;
    });
  };

  const toggleFaculty = (facultyId) => {
    setFaculty((prev) => {
      const newFaculty = prev.includes(facultyId) ? prev.filter((id) => id !== facultyId) : [...prev, facultyId];
      setErrors((prevErrors) => ({ ...prevErrors, faculty: null })); // Clear error on change
      return newFaculty;
    });
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrors({}); // Clear all previous errors

    let newErrors = {};
    let isValid = true;

    // Validate main exam details
    if (!name.trim()) {
      newErrors.name = "Exam name is required.";
      isValid = false;
    }
    if (!year.trim()) {
      newErrors.year = "Year is required.";
      isValid = false;
    }
    // Rooms and Faculty validation moved after semester validation to ensure totalStudentsForAllSemesters is updated
    // as their related error messages depend on student count.

    // Validate semesters and subjects first
    for (let i = 0; i < semesters.length; i++) {
      const sem = semesters[i];
      if (!sem.semester) {
        newErrors[`semester-${i}-semester`] = "Semester number is required.";
        isValid = false;
      } else if (isNaN(Number(sem.semester)) || Number(sem.semester) <= 0) {
        newErrors[`semester-${i}-semester`] = "Semester number must be a positive number.";
        isValid = false;
      }
      if (!sem.totalStudents) {
        newErrors[`semester-${i}-totalStudents`] = "Total students is required.";
        isValid = false;
      } else if (isNaN(Number(sem.totalStudents)) || Number(sem.totalStudents) <= 0) {
        newErrors[`semester-${i}-totalStudents`] = "Total students must be a positive number.";
        isValid = false;
      }

      if (!Array.isArray(sem.subjects) || sem.subjects.length === 0) {
        newErrors[`semester-${i}-subjects`] = "At least one subject is required.";
        isValid = false;
      }

      for (let j = 0; j < sem.subjects.length; j++) {
        const sub = sem.subjects[j];
        if (!sub.name.trim()) {
          newErrors[`subject-${i}-${j}-name`] = "Subject name is required.";
          isValid = false;
        }
        if (!sub.subjectCode.trim()) {
          newErrors[`subject-${i}-${j}-subjectCode`] = "Subject code is required.";
          isValid = false;
        }
        if (!sub.date) {
          newErrors[`subject-${i}-${j}-date`] = "Date is required.";
          isValid = false;
        } else if (!moment(sub.date, "YYYY-MM-DD", true).isValid()) {
          newErrors[`subject-${i}-${j}-date`] = "Date must be in YYYY-MM-DD format.";
          isValid = false;
        }
        if (!sub.startTime) {
          newErrors[`subject-${i}-${j}-startTime`] = "Start time is required.";
          isValid = false;
        }
        if (!sub.endTime) {
          newErrors[`subject-${i}-${j}-endTime`] = "End time is required.";
          isValid = false;
        }

        if (sub.startTime && sub.endTime) {
          const startMoment = moment(sub.startTime, "HH:mm");
          const endMoment = moment(sub.endTime, "HH:mm");

          if (!startMoment.isValid() || !endMoment.isValid()) {
            newErrors[`subject-${i}-${j}-timeFormat`] = "Invalid time format.";
            isValid = false;
          } else if (endMoment.isSameOrBefore(startMoment)) {
            newErrors[`subject-${i}-${j}-timeOrder`] = "End time must be after start time.";
            isValid = false;
          }
        }
      }
    }

    // Now validate Rooms and Faculty, as totalStudentsForAllSemesters is now up-to-date
    if (rooms.length === 0) {
        newErrors.rooms = "Please select at least one room.";
        isValid = false;
    }
    if (faculty.length === 0) {
        newErrors.faculty = "Please select at least one faculty member.";
        isValid = false;
    }
    if (roomCapacityMessage && roomCapacityMessage.type === "error") {
        newErrors.roomCapacity = roomCapacityMessage.text; // Add the specific capacity error
        isValid = false;
    }


    if (!isValid) {
      setErrors(newErrors);
      setMessage({ type: "error", text: "Please correct the errors in the form." });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        year: Number(year),
        rooms,
        faculty,
        semesterData: semesters.map((sem) => ({
          semester: Number(sem.semester),
          totalStudents: Number(sem.totalStudents),
          subjects: sem.subjects.map((sub) => ({
            name: sub.name,
            subjectCode: sub.subjectCode,
            date: sub.date,
            startTime: sub.startTime,
            endTime: sub.endTime,
          })),
        })),
      };

      const res = await axios.post("http://localhost:4000/exams/create", payload, { withCredentials: true });

      if (res.data.success) {
        setMessage({ type: "success", text: "Exam created successfully!" });
        // Clear form
        setName("");
        setYear(new Date().getFullYear().toString());
        setRooms([]);
        setFaculty([]);
        setSemesters([
          {
            semester: "",
            totalStudents: "",
            subjects: [{ name: "", subjectCode: "", date: "", startTime: "", endTime: "" }],
          },
        ]);
        setRoomCapacityMessage(null); // Clear messages
        setFacultyRecommendationMessage(null);
      } else {
        setMessage({ type: "error", text: res.data.message || "Failed to create exam." });
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "Server error." });
    }

    setLoading(false);
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // 5 years before and 5 years after

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white shadow-lg rounded-lg my-8">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Create New Exam Schedule</h2>

      {/* Global Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-center font-medium ${
            message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Exam Name & Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="examName" className="block text-sm font-semibold text-gray-700 mb-1">
              Exam Name
            </label>
            <input
              type="text"
              id="examName"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: null }));
              }}
              className={`w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="e.g., Mid-Term Examinations"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="examYear" className="block text-sm font-semibold text-gray-700 mb-1">
              Year
            </label>
            <select
              id="examYear"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setErrors((prev) => ({ ...prev, year: null }));
              }}
              className={`w-full border ${
                errors.year ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
          </div>
        </div>

        {/* Semesters Section */}
        <hr className="border-gray-300" />
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Exam Schedule by Semester</h3>
          {totalStudentsForAllSemesters > 0 && (
            <p className="text-gray-600 mb-4 text-sm">
              Total students across all semesters:{" "}
              <span className="font-semibold">{totalStudentsForAllSemesters}</span>
            </p>
          )}

          {semesters.map((sem, semIndex) => (
            <div key={semIndex} className="mb-8 p-6 border border-gray-300 rounded-lg bg-gray-50 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h4 className="text-xl font-bold text-gray-700">Semester {semIndex + 1} Details</h4>
                {semesters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSemester(semIndex)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm transition duration-200 ease-in-out"
                    title="Remove Semester"
                  >
                    Remove Semester
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor={`semester-${semIndex}-number`}
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Semester Number
                  </label>
                  <input
                    type="number"
                    id={`semester-${semIndex}-number`}
                    min="1"
                    value={sem.semester}
                    onChange={(e) => handleSemesterChange(semIndex, "semester", e.target.value)}
                    className={`w-full border ${
                      errors[`semester-${semIndex}-semester`] ? "border-red-500" : "border-gray-300"
                    } px-4 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="e.g., 1"
                  />
                  {errors[`semester-${semIndex}-semester`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`semester-${semIndex}-semester`]}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`semester-${semIndex}-students`}
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Total Students
                  </label>
                  <input
                    type="number"
                    id={`semester-${semIndex}-students`}
                    min="1"
                    value={sem.totalStudents}
                    onChange={(e) => handleSemesterChange(semIndex, "totalStudents", e.target.value)}
                    className={`w-full border ${
                      errors[`semester-${semIndex}-totalStudents`] ? "border-red-500" : "border-gray-300"
                    } px-4 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="e.g., 120"
                  />
                  {errors[`semester-${semIndex}-totalStudents`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`semester-${semIndex}-totalStudents`]}</p>
                  )}
                </div>
              </div>

              {/* Subjects within a semester */}
              <div>
                <h5 className="text-lg font-bold text-gray-700 mb-3">Subjects for Semester {semIndex + 1}</h5>
                {errors[`semester-${semIndex}-subjects`] && (
                  <p className="text-red-500 text-xs mb-3">{errors[`semester-${semIndex}-subjects`]}</p>
                )}

                {sem.subjects.map((sub, subIndex) => (
                  <div
                    key={subIndex}
                    className="mb-5 p-4 border border-gray-200 rounded-md bg-white relative shadow-sm"
                  >
                    {sem.subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(semIndex, subIndex)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg font-bold transition duration-200 ease-in-out"
                        title="Remove Subject"
                      >
                        &times;
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label
                          htmlFor={`sub-${semIndex}-${subIndex}-name`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Subject Name
                        </label>
                        <input
                          type="text"
                          id={`sub-${semIndex}-${subIndex}-name`}
                          value={sub.name}
                          onChange={(e) => handleSubjectChange(semIndex, subIndex, "name", e.target.value)}
                          className={`w-full border ${
                            errors[`subject-${semIndex}-${subIndex}-name`] ? "border-red-500" : "border-gray-300"
                          } px-3 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                          placeholder="e.g., Data Structures"
                        />
                        {errors[`subject-${semIndex}-${subIndex}-name`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`subject-${semIndex}-${subIndex}-name`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`sub-${semIndex}-${subIndex}-code`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Subject Code
                        </label>
                        <input
                          type="text"
                          id={`sub-${semIndex}-${subIndex}-code`}
                          value={sub.subjectCode}
                          onChange={(e) => handleSubjectChange(semIndex, subIndex, "subjectCode", e.target.value)}
                          className={`w-full border ${
                            errors[`subject-${semIndex}-${subIndex}-subjectCode`] ? "border-red-500" : "border-gray-300"
                          } px-3 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                          placeholder="e.g., CS101"
                        />
                        {errors[`subject-${semIndex}-${subIndex}-subjectCode`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`subject-${semIndex}-${subIndex}-subjectCode`]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor={`sub-${semIndex}-${subIndex}-date`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        id={`sub-${semIndex}-${subIndex}-date`}
                        value={sub.date}
                        onChange={(e) => handleSubjectChange(semIndex, subIndex, "date", e.target.value)}
                        className={`w-full border ${
                          errors[`subject-${semIndex}-${subIndex}-date`] ? "border-red-500" : "border-gray-300"
                        } px-3 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                      {errors[`subject-${semIndex}-${subIndex}-date`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`subject-${semIndex}-${subIndex}-date`]}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor={`sub-${semIndex}-${subIndex}-start`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Start Time
                        </label>
                        <input
                          type="time"
                          id={`sub-${semIndex}-${subIndex}-start`}
                          value={sub.startTime}
                          onChange={(e) => handleSubjectChange(semIndex, subIndex, "startTime", e.target.value)}
                          className={`w-full border ${
                            errors[`subject-${semIndex}-${subIndex}-startTime`] ||
                            errors[`subject-${semIndex}-${subIndex}-timeFormat`] ||
                            errors[`subject-${semIndex}-${subIndex}-timeOrder`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } px-3 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {errors[`subject-${semIndex}-${subIndex}-startTime`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`subject-${semIndex}-${subIndex}-startTime`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`sub-${semIndex}-${subIndex}-end`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          End Time
                        </label>
                        <input
                          type="time"
                          id={`sub-${semIndex}-${subIndex}-end`}
                          value={sub.endTime}
                          onChange={(e) => handleSubjectChange(semIndex, subIndex, "endTime", e.target.value)}
                          className={`w-full border ${
                            errors[`subject-${semIndex}-${subIndex}-endTime`] ||
                            errors[`subject-${semIndex}-${subIndex}-timeFormat`] ||
                            errors[`subject-${semIndex}-${subIndex}-timeOrder`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } px-3 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {(errors[`subject-${semIndex}-${subIndex}-endTime`] ||
                          errors[`subject-${semIndex}-${subIndex}-timeFormat`] ||
                          errors[`subject-${semIndex}-${subIndex}-timeOrder`]) && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`subject-${semIndex}-${subIndex}-endTime`] ||
                              errors[`subject-${semIndex}-${subIndex}-timeFormat`] ||
                              errors[`subject-${semIndex}-${subIndex}-timeOrder`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSubject(semIndex)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  + Add Subject
                </button>
              </div>
            </div>
          ))}

          {semesters.length < 2 && (
            <button
              type="button"
              onClick={addSemester}
              className="px-5 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mt-4"
            >
              + Add Semester
            </button>
          )}
        </div>

        {/* Select Rooms - MOVED HERE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Rooms (Multiple)</label>
          <div className="flex space-x-2 mb-2">
            <button
              type="button"
              onClick={selectAllRooms}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAllRooms}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Deselect All
            </button>
          </div>
          <div
            className={`border ${
              errors.rooms ? "border-red-500" : "border-gray-300"
            } px-4 py-3 rounded-md max-h-60 overflow-y-auto bg-gray-50`}
          >
            {allRooms.length === 0 ? (
              <p className="text-gray-500 italic">No rooms available. Please add rooms first.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {allRooms.map((room) => (
                  <label key={room._id} className="inline-flex items-center text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rooms.includes(room._id)}
                      onChange={() => toggleRoom(room._id)}
                      className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                    />
                    <span className="ml-2">
                      {room.building}, Room {room.roomNumber} (Capacity: {room.capacity})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {errors.rooms && <p className="text-red-500 text-xs mt-1">{errors.rooms}</p>}
          {roomCapacityMessage && (
            <div
              className={`mt-2 p-2 rounded text-sm ${
                roomCapacityMessage.type === "error"
                  ? "bg-red-100 text-red-700"
                  : roomCapacityMessage.type === "success"
                  ? "bg-green-100 text-green-700"
                  : ""
              }`}
            >
              {roomCapacityMessage.text}
            </div>
          )}
          {errors.roomCapacity && <p className="text-red-500 text-xs mt-1">{errors.roomCapacity}</p>}
        </div>

        {/* Select Faculty - MOVED HERE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Faculty (Multiple)</label>
          <div className="flex space-x-2 mb-2">
            <button
              type="button"
              onClick={selectAllFaculty}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAllFaculty}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Deselect All
            </button>
          </div>
          <div
            className={`border ${
              errors.faculty ? "border-red-500" : "border-gray-300"
            } px-4 py-3 rounded-md max-h-60 overflow-y-auto bg-gray-50`}
          >
            {allFaculty.length === 0 ? (
              <p className="text-gray-500 italic">No faculty available. Please add faculty members first.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {allFaculty.map((f) => (
                  <label key={f._id} className="inline-flex items-center text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={faculty.includes(f._id)}
                      onChange={() => toggleFaculty(f._id)}
                      className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                    />
                    <span className="ml-2">{f.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {errors.faculty && <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>}
          {facultyRecommendationMessage && (
            <div
              className={`mt-2 p-2 rounded text-sm ${
                facultyRecommendationMessage.type === "warning"
                  ? "bg-yellow-100 text-yellow-700"
                  : facultyRecommendationMessage.type === "success"
                  ? "bg-green-100 text-green-700"
                  : ""
              }`}
            >
              {facultyRecommendationMessage.text}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Exam...
            </>
          ) : (
            "Create Exam"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateExam;
