import React, { useEffect, useState } from "react";
import "./ClassDetail.css";
import DynamicForm from "../../common/Form/DynamicForm";
import EditButton from "../../common/Button/EditButton";
import { getCourseById, updateCourse } from "../../../services/courseService";
import { fetchStudents, fetchTeachers } from "../../../services/personService";

const ClassDetail = ({ clsId, selectedStatus, onBack }) => {
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [teachers, setTeachers] = useState([]);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("vi-VN").format(date); // Format to dd/MM/yyyy
  };

  const normalizeClassData = (data) => {
    const match = data?.DESCRIPTION?.match(/^\[Giáo viên:\s*(.*?)\]\s*/);
    const teacherName = match ? match[1] : "Không rõ";
    const cleanDescription = data?.DESCRIPTION?.replace(
      /^\[Giáo viên:\s*.*?\]\s*/,
      ""
    );

    return {
      id: data?.COURSE_ID || "",
      name: data?.NAME || "",
      teacherName,
      description: cleanDescription,
      startDate: data?.START_DATE || "",
      endDate: data?.END_DATE || "",
      minStu: data?.MIN_STU || "",
      maxStu: data?.MAX_STU || "",
      price: data?.PRICE || "",
      status: data?.STATUS || "",
      students: data?.STUDENTS || [],
    };
  };

  const fetchClass = async () => {
    try {
      const data = await getCourseById(clsId);
      const normalized = normalizeClassData(data);
      setClassInfo(normalized);
      setStudents(normalized.students);
    } catch (err) {
      console.error("Failed to fetch course detail:", err);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const all = await fetchStudents();
      const currentIds = students.map((s) => s.ID);
      const filtered = all.filter((s) => !currentIds.includes(s.ID));
      setAvailableStudents(filtered);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  const fetchAllTeachers = async () => {
    try {
      const data = await fetchTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  useEffect(() => {
    fetchClass();
    fetchAllTeachers();
  }, [clsId]);

  useEffect(() => {
    fetchAvailableStudents();
  }, [students]);

  const handleSelectStudent = async () => {
    const selected = availableStudents.find((s) => s.ID === selectedStudentId);
    if (selected && !students.find((s) => s.ID === selected.ID)) {
      const updatedStudents = [...students, selected];
      try {
        await updateCourse(clsId, { ...classInfo, students: updatedStudents });
        setStudents(updatedStudents);
        setSelectedStudentId("");
        setShowAddStudent(false);
      } catch (err) {
        console.error("Failed to add student:", err);
        alert("Không thể thêm học viên vào lớp.");
      }
    }
  };

  const handleEditClick = () => setIsEditing(true);
  const handleCancelEdit = () => setIsEditing(false);

  const handleUpdateSuccess = async (updatedData) => {
    try {
      await updateCourse(clsId, {
        ...updatedData,
        students,
        teacherName: updatedData.teacherName,
      });
      await fetchClass();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update course:", err);
      alert("Không thể cập nhật lớp học.");
    }
  };

  if (!classInfo) return <div>Đang tải thông tin lớp học...</div>;

  return (
    <div className="class-detail-container">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      {isEditing ? (
        <DynamicForm
          formConfig={{
            type: "Class",
            fields: [
              { name: "id", label: "ID", type: "text", disabled: true },
              { name: "name", label: "Name", type: "text", required: true },
              {
                name: "teacherName",
                label: "Teacher",
                type: "select",
                required: true,
                options: teachers.map((t) => ({
                  label: t.NAME,
                  value: t.NAME,
                })),
              },
              { name: "description", label: "Description", type: "textarea" },
              {
                name: "startDate",
                label: "Start Date",
                type: "datetime-local",
              },
              { name: "endDate", label: "End Date", type: "datetime-local" },
              { name: "minStu", label: "Min Students", type: "number" },
              { name: "maxStu", label: "Max Students", type: "number" },
              { name: "price", label: "Price", type: "number" },
              { name: "status", label: "Status", type: "text" },
            ],
          }}
          initialData={{
            ...classInfo,
            startDate: classInfo.startDate?.slice(0, 16),
            endDate: classInfo.endDate?.slice(0, 16),
            teacherName: classInfo.teacherName || "",
          }}
          onSubmitSuccess={handleUpdateSuccess}
          onClose={handleCancelEdit}
        />
      ) : (
        <div className="class-info">
          <div className="info-header">
            <h2>{classInfo.name}</h2>
          </div>
          <p>
            <strong>ID:</strong> {classInfo.id}
          </p>
          <p>
            <strong>Name:</strong> {classInfo.name}
          </p>
          <p>
            <strong>Giáo viên:</strong> {classInfo.teacherName}
          </p>
          <p>
            <strong>Description:</strong> {classInfo.description}
          </p>
          <p>
            <strong>Start Date:</strong> {formatDate(classInfo.startDate)}
          </p>
          <p>
            <strong>End Date:</strong> {formatDate(classInfo.endDate)}
          </p>

          <p>
            <strong>Min Students:</strong> {classInfo.minStu}
          </p>
          <p>
            <strong>Max Students:</strong> {classInfo.maxStu}
          </p>
          <p>
            <strong>Price:</strong> {classInfo.price}đ
          </p>
          <p>
            <strong>Status:</strong> {classInfo.status || "Chưa cập nhật"}
          </p>
          <div className="edit-btn-container">
            <EditButton onClick={handleEditClick} />
          </div>
        </div>
      )}

      {!isEditing && selectedStatus !== "Waiting" && (
        <div className="tabs">
          <button
            className={activeTab === "students" ? "active" : ""}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>
          <button
            className={activeTab === "assignment" ? "active" : ""}
            onClick={() => setActiveTab("assignment")}
          >
            Assignment
          </button>
          <button
            className={activeTab === "doc" ? "active" : ""}
            onClick={() => setActiveTab("doc")}
          >
            Doc
          </button>
        </div>
      )}

      {!isEditing && (
        <div className="tab-content">
          {(activeTab === "students" || selectedStatus === "Waiting") && (
            <div>
              <h3>Student List</h3>
              <ul>
                {students.length > 0 ? (
                  students.map((s, i) => (
                    <li key={i}>
                      {s.NAME} (ID: {s.ID})
                    </li>
                  ))
                ) : (
                  <li>Chưa có học viên.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassDetail;
