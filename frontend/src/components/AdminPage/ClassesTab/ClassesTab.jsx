import React, { useState, useEffect } from "react";
import Card from "../../common/Card/Card";
import ClassDetail from "./ClassDetail";
import { getCourseById, getAllCourses } from "../../../services/courseService";

const ClassesTab = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const normalizeClass = (data) => {
    const match = data?.DESCRIPTION?.match(/^\[Giáo viên:\s*(.*?)\]/);
    const teacherName = match ? match[1] : 'Không rõ';
    const cleanDescription = data?.DESCRIPTION?.replace(/^\[Giáo viên:\s*.*?\]\s*/, '');

    return {
      id: data.COURSE_ID,
      name: data.NAME,
      status: data.STATUS,
      startDate: data.START_DATE,
      endDate: data.END_DATE,
      description: cleanDescription,
      teacherName
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
    fetchClasses(); // 👈 Refresh list after returning from detail
  };

  return (
    <>
      {selectedClass ? (
        <ClassDetail
          clsId={selectedClass.id}
          selectedStatus={selectedClass.status}
          onBack={handleBack}
        />
      ) : (
        <div className="class-grid">
          {classes.map((cls) => (
            <Card
              key={cls.id}
              title={cls.name}
              onClick={() => setSelectedClass(cls)}
            >
              <p><strong>ID:</strong> {cls.id}</p>
              <p><strong>Giáo viên:</strong> {cls.teacherName}</p>
              <p><strong>Trạng thái:</strong> {cls.status}</p>
              <p><strong>Ngày bắt đầu:</strong> {cls.startDate}</p>
              <p><strong>Ngày kết thúc:</strong> {cls.endDate}</p>
              <p><strong>Mô tả:</strong> {cls.description || "Không có"}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default ClassesTab;
