import React, { useState, useEffect } from 'react';
import './CourseDetail.css';
import BackButton from "../../../common/Button/BackButton";
import Table from "../../../common/Table/Table";
import { assignmentTableColumns, documentTableColumns } from "../../../../config/tableConfig";

const CourseDetail = ({
  clsId,
  selectedStatus,
  onBack,
  originalData,
  isNew = false,
}) => {
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = () => setShowConfirm(true);
  const handleConfirm = () => {
    console.log("Confirmed registration");
    setShowConfirm(false);
  };
  const handleCancel = () => setShowConfirm(false);

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

  useEffect(() => {
    if (clsId) {
      const fetchData = async () => {
        // Lấy thông tin lớp từ originalData (nếu có)
        const classData = originalData?.find((item) => item.ID === clsId);
        setClassInfo(classData || {
          name: "Lớp mẫu",
          teacherName: "Chưa rõ",
          description: "Không có mô tả",
          startDate: "2024-06-01",
          endDate: "2024-06-30",
          minStu: 5,
          maxStu: 20,
          price: 1000000
        });
  
        setStudents(classData?.students || []);
        setAssignments(classData?.assignments || []);
        setDocuments(classData?.documents || []);
      };
  
      fetchData();
    }
  }, [clsId, originalData]);

  if (!clsId) {
    return <div>Không có thông tin lớp học.</div>;
  }

  if (!classInfo) return <div>Đang tải thông tin lớp học...</div>;

  return (
    <div className="course-detail-container">
      <BackButton type="button" onClick={onBack}>← Back</BackButton>
      <div className="course-detail-main">
        <div className="course-info">
          <div className="info-header">
            <h2>{classInfo.name}</h2>
          </div>
          <p><strong>Name:</strong> {classInfo.name}</p>
          <p><strong>Giáo viên:</strong> {classInfo.teacherName}</p>
          <p><strong>Description:</strong> {classInfo.description}</p>
          <p><strong>Start Date:</strong> {formatDate(classInfo.startDate)}</p>
          <p><strong>End Date:</strong> {formatDate(classInfo.endDate)}</p>
          <p><strong>Min Students:</strong> {classInfo.minStu}</p>
          <p><strong>Max Students:</strong> {classInfo.maxStu}</p>
          <p><strong>Price:</strong> {classInfo.price}đ</p>
          <div className="register-btn-wrapper">
            <button className="register-btn" onClick={handleRegister}>Register</button>
          </div>
        </div>
        {showConfirm && (
          <div className="confirm-modal">
            <div className="confirm-box">
              <p>Are you sure you want to register for this class?</p>
              <div className="modal-buttons">
                <button onClick={handleConfirm}>Confirm</button>
                <button onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        
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

          {activeTab === "assignment" && (
            <div>
              <h3>Assignments</h3>
              {assignments.length > 0 ? (
                <Table columns={assignmentTableColumns} data={assignments} />
              ) : (
                <p>Không có bài tập nào.</p>
              )}
            </div>
          )}

          {activeTab === "doc" && (
            <div>
              <h3>Documents</h3>
              {documents.length > 0 ? (
                <Table columns={documentTableColumns} data={documents} />
              ) : (
                <p>Không có tài liệu nào.</p>
              )}
            </div>
          )}
        </div>      
      </div>
    </div>
  );
};

export default CourseDetail;