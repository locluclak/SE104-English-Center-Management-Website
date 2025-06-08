import React, { useState, useEffect, useCallback } from 'react';
import './CourseDetail.css';
import BackButton from "../../../common/Button/BackButton";
import Table from "../../../common/Table/Table";
import { getAssignmentTableColumns, getDocumentTableColumns } from "../../../../config/tableConfig";
import { getCourseById } from '../../../../services/courseService';
import AddButton from '../../../common/Button/AddButton';
import ResourceForm from '../../../common/Form/ResourceForm/ResourceForm';

const API_URL = "http://localhost:3000";

const CourseDetail = ({ clsId, onBack, userRole }) => {
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resourceFormType, setResourceFormType] = useState('');

  const [editingResource, setEditingResource] = useState(null); 
  const [editingResourceType, setEditingResourceType] = useState('');

  const handleRegister = () => setShowConfirm(true);
  const handleConfirm = () => {
    console.log("Confirmed registration");
    setShowConfirm(false);
  };
  const handleCancelConfirm = () => setShowConfirm(false);

  const studentTableColumns = [
    { header: "ID", accessor: "ID" },
    { header: "Tên", accessor: "NAME" },
    { header: "Email", accessor: "EMAIL" },
  ];

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString; 
    }
    return new Intl.DateTimeFormat("vi-VN", { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  };

  const fetchAssignments = useCallback(async () => {
    try {
      const assignmentsResponse = await fetch(`${API_URL}/assignments/getbycourse/${clsId}`);
      if (!assignmentsResponse.ok) {
        if (assignmentsResponse.status === 404) {
          setAssignments([]);
          console.warn(`Không tìm thấy bài tập cho khóa học ID: ${clsId}`);
        } else {
          throw new Error(`Lỗi HTTP khi tải bài tập: ${assignmentsResponse.status}`);
        }
      } else {
        const data = await assignmentsResponse.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải bài tập:", error);
      setAssignments([]);
    }
  }, [clsId]);

  const fetchDocuments = useCallback(async () => {
    try {
      const documentsResponse = await fetch(`${API_URL}/documents/getbycourse/${clsId}`);
      if (!documentsResponse.ok) {
        if (documentsResponse.status === 404) {
          setDocuments([]);
          console.warn(`Không tìm thấy tài liệu cho khóa học ID: ${clsId}`);
        } else {
          throw new Error(`Lỗi HTTP khi tải tài liệu: ${documentsResponse.status}`);
        }
      } else {
        const data = await documentsResponse.json();
        setDocuments(data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải tài liệu:", error);
      setDocuments([]);
    }
  }, [clsId]);

  const handleAddAssignment = () => {
    setResourceFormType('assignment');
    setEditingResource(null); 
    setEditingResourceType('');
    setShowResourceForm(true);
    console.log("Teacher wants to add a new assignment for course:", clsId);
  };

  const handleAddDocument = () => {
    setResourceFormType('document');
    setEditingResource(null);
    setEditingResourceType('');
    setShowResourceForm(true);
    console.log("Teacher wants to add a new document for course:", clsId);
  };

  const handleEditAssignment = (assignment) => {
    setResourceFormType('assignment');
    setEditingResourceType('assignment');
    setEditingResource(assignment); 
    setShowResourceForm(true);
  };

  const handleEditDocument = (document) => {
    setResourceFormType('document');
    setEditingResourceType('document');
    setEditingResource(document); 
    setShowResourceForm(true);
  };

  const handleResourceFormSubmit = async (formData) => {
    const { title, description, file, audioBlob, startDate, endDate } = formData;

    const dataToSend = new FormData();
    dataToSend.append('name', title);
    dataToSend.append('description', description);
    dataToSend.append('course_id', clsId); 

    if (file) {
      dataToSend.append('file', file);
    }
    if (audioBlob) {
      dataToSend.append('audio', new File([audioBlob], `audio_${Date.now()}.webm`, { type: audioBlob.type }));
    }

    try {
      let response;
      let url;
      let method;
      let successMessage;

      if (editingResource && editingResourceType === 'assignment') {
        url = `${API_URL}/assignments/update/${editingResource.AS_ID}`;
        method = 'PUT';
        successMessage = 'Assignment updated successfully!';

        if (title) dataToSend.append('name', title);
        if (description) dataToSend.append('description', description);
        if (startDate) dataToSend.append('start_date', startDate);
        if (endDate) dataToSend.append('end_date', endDate);
        const updateBody = { name: title, description: description };
        if (startDate) updateBody.start_date = startDate;
        if (endDate) updateBody.end_date = endDate;

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(updateBody),
        });

      } else if (editingResource && editingResourceType === 'document') {
        url = `${API_URL}/documents/update/${editingResource.DOC_ID}`;
        method = 'PUT';
        successMessage = 'Document updated successfully!';

        const updateBody = { name: title, description: description };

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateBody),
        });

      } else if (resourceFormType === 'assignment') {
        url = `${API_URL}/assignments/upload`;
        method = 'POST';
        successMessage = 'Assignment uploaded successfully!';

        dataToSend.append('start_date', startDate);
        dataToSend.append('end_date', endDate);

        response = await fetch(url, {
          method: method,
          body: dataToSend,
        });
      } else if (resourceFormType === 'document') {
        url = `${API_URL}/documents`;
        method = 'POST';
        successMessage = 'Document uploaded successfully!';

        response = await fetch(url, {
          method: method,
          body: dataToSend,
        });
      } else {
        console.error("Unknown resource type or action.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `Failed to perform action for ${resourceFormType}`);
      }

      console.log(successMessage);
      setShowResourceForm(false);
      setResourceFormType('');
      setEditingResource(null);
      setEditingResourceType(''); 

      if (resourceFormType === 'assignment' || editingResourceType === 'assignment') {
        await fetchAssignments();
      } else if (resourceFormType === 'document' || editingResourceType === 'document') {
        await fetchDocuments();
      }

    } catch (error) {
      console.error(`Error processing ${resourceFormType}:`, error);
      alert(`Failed to process ${resourceFormType}: ${error.message}`);
    }
  };

  const handleResourceFormCancel = () => {
    setShowResourceForm(false);
    setResourceFormType('');
    setEditingResource(null); 
    setEditingResourceType(''); 
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!clsId) {
        setLoadingDetails(false);
        return;
      }

      setLoadingDetails(true);
      try {
        const courseData = await getCourseById(clsId);
        setClassInfo({
          ID: courseData.COURSE_ID,
          name: courseData.NAME,
          teacherName: extractTeacherName(courseData.DESCRIPTION) || 'Chưa cập nhật',
          description: removeTeacherNameFromDescription(courseData.DESCRIPTION),
          startDate: courseData.START_DATE,
          endDate: courseData.END_DATE,
          minStu: courseData.MIN_STU,
          maxStu: courseData.MAX_STU,
          price: courseData.PRICE
        });
        setStudents(courseData.STUDENTS || []);

        await fetchAssignments();
        await fetchDocuments();

      } catch (error) {
        console.error("Lỗi khi tải chi tiết khóa học:", error);
        setClassInfo(null);
        setStudents([]);
        setAssignments([]);
        setDocuments([]);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchCourseDetails();
  }, [clsId, fetchAssignments, fetchDocuments]);

  const extractTeacherName = (description) => {
    const match = description.match(/\[Giáo viên:\s*([^\]]+)\]/);
    return match ? match[1] : null;
  };

  const removeTeacherNameFromDescription = (description) => {
    return description.replace(/\[Giáo viên:\s*[^\]]+\]\s*/, '').trim();
  };

  const assignmentCols = getAssignmentTableColumns(handleEditAssignment, (assignment) => {
    alert(`Delete assignment: ${assignment.NAME}`);
  });

  const documentCols = getDocumentTableColumns(handleEditDocument, (document) => {
      alert(`Delete document: ${document.NAME}`);
  });

  if (loadingDetails) {
    return <div className="loading-message">Đang tải thông tin chi tiết khóa học...</div>;
  }

  if (!clsId) {
    return <div className="error-message">Không có ID lớp học được chọn.</div>;
  }

  if (!classInfo) {
    return <div className="error-message">Không tìm thấy thông tin chi tiết lớp học này.</div>;
  }

  return (
    <div className="course-detail-container">
      <BackButton type="button" onClick={onBack}>← Back</BackButton>
      {showResourceForm ? (
        <ResourceForm
          type={resourceFormType}
          initialData={editingResource} 
          isEditMode={!!editingResource} 
          onSubmit={handleResourceFormSubmit}
          onCancel={handleResourceFormCancel}
        />
      ) : (
        <div className="course-detail-main">
          <div className="course-info">
            <div className="info-header">
              <h2>{classInfo.name}</h2>
            </div>
            <p><strong>Name:</strong> {classInfo.name}</p>
            <p><strong>Teacher:</strong> {classInfo.teacherName}</p>
            <p><strong>Description:</strong> {classInfo.description}</p>
            <p><strong>Start Date:</strong> {formatDate(classInfo.startDate)}</p>
            <p><strong>End Date:</strong> {formatDate(classInfo.endDate)}</p>
            <p><strong>Price:</strong> {classInfo.price?.toLocaleString('vi-VN')}đ</p>
          </div>

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
              Assignments
            </button>
            <button
              className={activeTab === "doc" ? "active" : ""}
              onClick={() => setActiveTab("doc")}
            >
              Documents
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "students" && (
              <div>
                <h3>Danh sách Học viên</h3>
                {students.length > 0 ? (
                  <Table columns={studentTableColumns} data={students} />
                ) : (
                  <p>Chưa có học viên nào trong khóa học này.</p>
                )}
              </div>
            )}

            {activeTab === "assignment" && (
              <div>
                <div className="section-header">
                  <h3>Danh sách Bài tập</h3>
                  {userRole === "teacher" && (
                    <AddButton onClick={handleAddAssignment}>
                      Thêm bài tập
                    </AddButton>
                  )}
                </div>
                {assignments.length > 0 ? (
                  <Table columns={assignmentCols} data={assignments} /> 
                ) : (
                  <p>Không có bài tập nào cho khóa học này.</p>
                )}
              </div>
            )}

            {activeTab === "doc" && (
              <div>
                <div className="section-header">
                  <h3>Danh sách Tài liệu</h3>
                  {userRole === "teacher" && (
                    <AddButton onClick={handleAddDocument}>
                      Thêm tài liệu
                    </AddButton>
                  )}
                </div>
                {documents.length > 0 ? (
                  <Table columns={documentCols} data={documents} />
                ) : (
                  <p>Không có tài liệu nào cho khóa học này.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;