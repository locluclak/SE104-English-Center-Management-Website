import React, { useState, useEffect } from "react";
import Table from "../../../common/Table/Table";
import ClassDetail from "./ClassDetail";
import {
  getAllCourses,
  addStudentToCourse,
} from "../../../../services/courseService";
import { format } from "date-fns";

import EditButton from "../../../common/Button/EditButton";  
import DeleteButton from "../../../common/Button/DeleteButton";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    return format(date, "dd/MM/yyyy");
  } catch {
    return "";
  }
};

const ClassesTab = ({ selectedStatus = "waiting" }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [originalClassData, setOriginalClassData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const normalizeClass = (data) => {
    return {
      id: data.COURSE_ID,
      name: data.NAME,
      status: data.STATUS,
      startDate: data.START_DATE,
      endDate: data.END_DATE,
      description: data.DESCRIPTION,
      teacherName: data.TEACHER_NAME_FROM_DB || "Không rõ",
      startDateFormatted: formatDate(data.START_DATE),
      endDateFormatted: formatDate(data.END_DATE),
      raw: data,
    };
  };

  const fetchClasses = async () => {
    try {
      console.log("Đang gọi API getAllCourses");
      const data = await getAllCourses();
      console.log("Dữ liệu từ API:", data);
      const normalized = data.map(normalizeClass);
      setClasses(normalized);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleBack = () => {
    setSelectedClass(null);
    setEditMode(false);
    fetchClasses();
  };

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    setEditMode(false);
  };

  const handleEditClass = (cls) => {
    setSelectedClass(cls);
    setEditMode(true);
  };

  const handleDeleteClass = async (cls) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp "${cls.name}"?`)) {
      try {
        console.log(`Đã xóa lớp: ${cls.name} (ID: ${cls.id})`);
        fetchClasses(); 
      } catch (error) {
        console.error("Lỗi khi xóa lớp học:", error);
        alert("Không thể xóa lớp học. Vui lòng thử lại.");
      }
    }
  };

  const now = new Date();
  const filteredClasses = classes.filter((cls) => {
    const start = new Date(cls.startDate);
    const end = new Date(cls.endDate);
    if (selectedStatus === "waiting") return start > now;
    if (selectedStatus === "current") return start <= now && end >= now;
    if (selectedStatus === "end") return end < now;
    return true;
  });

  const columns = [
    { header: "ID", accessor: "id", },
    { header: "Class' Name", accessor: "name", },
    { header: "Teacher", accessor: "teacherName", render: (row) => row.teacherName || "Chưa cập nhật", },
    { header: "Start Date", accessor: "startDateFormatted", },
    { header: "End Date", accessor: "endDateFormatted", },
    { header: "Description", accessor: "description", render: (row) => row.description || "Không có", },
    {
      header: "Action",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <EditButton
            onClick={(e) => {
              e.stopPropagation(); 
              handleEditClass(row);
            }}
          />
          <DeleteButton
            onClick={(e) => {
              e.stopPropagation(); 
              handleDeleteClass(row);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      {selectedClass ? (
        <ClassDetail
          clsId={selectedClass.id}
          selectedStatus={selectedClass.status}
          onBack={handleBack}
          addStudentToCourse={addStudentToCourse}
          originalData={selectedClass.raw}
          isEditing={editMode}
        />
      ) : (
        <div className="classes-tab-container">
          {filteredClasses.length > 0 ? (
            <Table
              columns={columns}
              data={filteredClasses}
              onRowClick={handleSelectClass}
            />
          ) : (
            <p>Không có lớp nào thuộc trạng thái "{selectedStatus}".</p>
          )}
        </div>
      )}
    </>
  );
};

export default ClassesTab;