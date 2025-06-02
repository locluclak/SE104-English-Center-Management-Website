import React, { useState, useEffect } from "react";
import Card from "../../common/Card/Card";
import ClassDetail from "./ClassDetail";
import {
  getAllCourses,
  addStudentToCourse,
} from "../../../services/courseService";
import { format } from "date-fns";

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

  const normalizeClass = (data) => {
    const match = data?.DESCRIPTION?.match(/^\[Giáo viên:\s*(.*?)\]/);
    const teacherName = match ? match[1] : "Không rõ";
    const cleanDescription = data?.DESCRIPTION?.replace(
      /^\[Giáo viên:\s*.*?\]\s*/,
      ""
    );

    return {
      id: data.COURSE_ID,
      name: data.NAME,
      status: data.STATUS,
      startDate: data.START_DATE,
      endDate: data.END_DATE,
      description: cleanDescription,
      teacherName,
      startDateFormatted: formatDate(data.START_DATE),
      endDateFormatted: formatDate(data.END_DATE),
      raw: data,
    };
  };

  const fetchClasses = async () => {
    try {
      const data = await getAllCourses();
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
    fetchClasses();
  };

  const handleSelectClass = (cls) => {
    setOriginalClassData(cls.raw);
    setSelectedClass(cls);
  };

  // 🔍 Lọc lớp theo trạng thái
  const now = new Date();
  const filteredClasses = classes.filter((cls) => {
    const start = new Date(cls.startDate);
    const end = new Date(cls.endDate);
    if (selectedStatus === "waiting") return start > now;
    if (selectedStatus === "current") return start <= now && end >= now;
    if (selectedStatus === "end") return end < now;
    return true;
  });

  return (
    <>
      {selectedClass ? (
        <ClassDetail
          clsId={selectedClass.id}
          selectedStatus={selectedClass.status}
          onBack={handleBack}
          addStudentToCourse={addStudentToCourse}
          originalData={classes.find((cls) => cls.id === selectedClass.id)}
        />
      ) : (
        <div className="class-grid">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => (
              <Card
                key={cls.id}
                title={cls.name}
                onClick={() => handleSelectClass(cls)}
              >
                <p>
                  <strong>ID:</strong> {cls.id}
                </p>
                <p>
                  <strong>Giáo viên:</strong> {cls.teacherName}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {cls.status}
                </p>
                <p>
                  <strong>Ngày bắt đầu:</strong> {cls.startDateFormatted}
                </p>
                <p>
                  <strong>Ngày kết thúc:</strong> {cls.endDateFormatted}
                </p>
                <p>
                  <strong>Mô tả:</strong> {cls.description || "Không có"}
                </p>
              </Card>
            ))
          ) : (
            <p>Không có lớp nào thuộc trạng thái "{selectedStatus}".</p>
          )}
        </div>
      )}
    </>
  );
};

export default ClassesTab;
