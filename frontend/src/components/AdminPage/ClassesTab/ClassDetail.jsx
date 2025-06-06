import React, { useEffect, useState } from "react";
import "./ClassDetail.css";
import BackButton from "../../common/Button/BackButton";
import DynamicForm from "../../common/Form/DynamicForm";
import Table from "../../common/Table/Table";
import { getCourseById, createCourse, updateCourse, addStudentToCourse, removeStudentFromCourse } from "../../../services/courseService";
import { fetchStudents, fetchTeachers } from "../../../services/personService";
import { formConfigs } from "../../../config/formConfig";

const ClassDetail = ({
  clsId,
  selectedStatus,
  onBack,
  originalData,
  isEditing: initialEditMode = false,
  isNew = false,
}) => {
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [activeTab, setActiveTab] = useState("students");

  const studentTableColumns = [
    { header: "ID", accessor: "ID" },
    { header: "Tên", accessor: "NAME" },
    { header: "Email", accessor: "EMAIL" },
  ];
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("vi-VN").format(date);
  };

  const normalizeClassData = (data) => {
    const match = data?.DESCRIPTION?.match(/^\[Giáo viên:\s*(.*?)\]\s*/);
    const teacherName = match ? match[1].trim() : "Không rõ";
    const cleanDescription = data?.DESCRIPTION?.replace(
      /^\[Giáo viên:\s*.*?\]\s*/,
      ""
    );
    return {
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

  const fetchAllTeachers = async () => {
    console.log("ClassDetail useEffect - received clsId:", clsId); 
    try {
      const data = await fetchTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  useEffect(() => {
    if (clsId) {
      fetchClass();
    }
    fetchAllTeachers();
    setIsEditing(initialEditMode);
  }, [clsId, initialEditMode]);

  const handleEditClick = () => setIsEditing(true);
  const handleCancelEdit = () => setIsEditing(false);

  const handleUpdateSuccess = async (updatedData) => {
  try {
    // Update class basic info
    const teacherName = teachers.find((t) => t.ID === updatedData.teacher)?.NAME || updatedData.teacher;
    const description = `[Giáo viên: ${teacherName}] ${updatedData.description || ""}`;

    const payload = {
      name: updatedData.name,
      description,
      startDate: updatedData.startDate,
      endDate: updatedData.endDate,
      minStu: Number(updatedData.minStu) || 0,
      maxStu: Number(updatedData.maxStu) || 0,
      price: Number(updatedData.price) || 0,
      teacherName,
    };

    await updateCourse(clsId, payload);

    // Handle student list updates
    const currentStudents = classInfo?.students || [];
    const newStudents = updatedData.students || [];

    // Find students to add (in new list but not in current)
    const studentsToAdd = newStudents.filter(
      newStudent => !currentStudents.some(
        currentStudent => currentStudent.ID === newStudent.id
      )
    );

    // Find students to remove (in current but not in new)
    const studentsToRemove = currentStudents.filter(
      currentStudent => !newStudents.some(
        newStudent => newStudent.id === currentStudent.ID
      )
    );

    // Process additions
    for (const student of studentsToAdd) {
      await addStudentToCourse({
        studentId: student.id,
        courseId: clsId,
        paymentType: "UNPAID",
        paymentDescription: "Added during course update",
      });
    }

    // Process removals
    for (const student of studentsToRemove) {
      await removeStudentFromCourse({
        studentId: student.ID,
        courseId: clsId,
      });
    }

    // Refresh class data
    await fetchClass();
    setIsEditing(false);

  } catch (err) {
    console.error("Failed to update course:", err);
    alert("Không thể cập nhật lớp học.");
  }
};

  if (!clsId && !isEditing) {
    return <div>Không có thông tin lớp học.</div>;
  }

  if (!classInfo) return <div>Đang tải thông tin lớp học...</div>;

  return (
    <div className="class-detail-container">
      <BackButton type="button" onClick={onBack}>
        ← Back
      </BackButton>
      {isEditing || !clsId ? (
        <DynamicForm
          formConfig={{
            ...formConfigs.classes,
            title: `Edit Class: ${classInfo.name}`,
            fields: formConfigs.classes.fields.map((f) => {
              if (f.name === "teacher") {
                return {
                  ...f,
                  options: teachers.map((t) => ({
                    value: t.ID,
                    label: `${t.NAME} (${t.ID})`,
                    id: t.ID,
                    name: t.NAME,
                    email: t.EMAIL,
                  })),
                };
              }
              return f;
            }),
          }}
          initialData={{
            name: classInfo?.name || "",
            description: classInfo?.description || "",
            teacher:
              teachers.find((t) => t.NAME === classInfo?.teacherName)?.ID || "",
            startDate: classInfo?.startDate?.slice(0, 10) || "",
            endDate: classInfo?.endDate?.slice(0, 10) || "",
            students:
              classInfo?.students?.map((s) => ({
                id: s.ID,
                name: s.NAME,
                email: s.EMAIL,
              })) || [],
            status: classInfo?.status || "",
            minStu: classInfo?.minStu || "",
            maxStu: classInfo?.maxStu || "",
            price: classInfo?.price || "",
          }}
          onSubmitSuccess={isNew ? handleCreateClass : handleUpdateSuccess}
          onClose={handleCancelEdit}
        />
      ) : (
        <div className="class-info">
          <div className="info-header">
            <h2>{classInfo.name}</h2>
          </div>
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
                  <Table columns={studentTableColumns} data={students} />
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
