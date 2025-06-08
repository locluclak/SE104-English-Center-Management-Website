import React, { useState, useEffect, useCallback } from 'react';
import './CourseDetail.css';
import BackButton from "../../../common/Button/BackButton";
import Table from "../../../common/Table/Table";
import { getAssignmentTableColumns, getDocumentTableColumns } from "../../../../config/tableConfig";
import { getCourseById } from '../../../../services/courseService';
import AddButton from '../../../common/Button/AddButton';
import ResourceForm from '../../../common/Form/ResourceForm/ResourceForm';
import SubmissionForm from '../../../common/Form/SubmissionForm/SubmissionForm';
import TeacherGradingInterface from '../../Grading/TeacherGradingInterface'; 

const API_URL = "http://localhost:3000";

const CourseDetail = ({ clsId, onBack, userRole, userId }) => { 
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

  const [selectedAssignment, setSelectedAssignment] = useState(null); 
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [studentSubmission, setStudentSubmission] = useState(null); 
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]); 
  const [selectedStudentSubmission, setSelectedStudentSubmission] = useState(null); 

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

  const fetchStudentSubmission = useCallback(async (assignmentId) => {
    if (!userId || !assignmentId || userRole !== 'student') return null;
    try {
      const response = await fetch(`${API_URL}/submission/${userId}/${assignmentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch submission: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching student submission:", error);
      return null;
    }
  }, [userId, userRole]);

  const fetchAssignmentSubmissions = useCallback(async (assignmentId) => {
    if (!assignmentId || userRole !== 'teacher') return [];
    try {
      const response = await fetch(`${API_URL}/submission/getbyassignment/${assignmentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return []; 
        }
        throw new Error(`Failed to fetch submissions for assignment: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching all assignment submissions:", error);
      return [];
    }
  }, [userRole]);

  const handleGenericBack = () => {
    if (selectedStudentSubmission) { 
        setSelectedStudentSubmission(null);
    } else if (selectedAssignment) {
        setSelectedAssignment(null);
        setAssignmentSubmissions([]);
        setStudentSubmission(null);
        setShowSubmissionForm(false);
    } else if (showResourceForm) {
        setShowResourceForm(false);
        setEditingResource(null);
        setEditingResourceType('');
        setResourceFormType('');
    } else { 
        onBack();
    }
};

  const handleAddAssignment = () => {
    setResourceFormType('assignment');
    setEditingResource(null);
    setEditingResourceType('');
    setShowResourceForm(true);
    setSelectedAssignment(null);
    setShowSubmissionForm(false);
    setSelectedStudentSubmission(null);
  };

  const handleAddDocument = () => {
    setResourceFormType('document');
    setEditingResource(null);
    setEditingResourceType('');
    setShowResourceForm(true);
    setSelectedAssignment(null);
    setShowSubmissionForm(false);
    setSelectedStudentSubmission(null);
  };

  const handleEditAssignment = (assignment) => {
    setResourceFormType('assignment');
    setEditingResourceType('assignment');
    setEditingResource(assignment);
    setShowResourceForm(true);
    setSelectedAssignment(null);
    setShowSubmissionForm(false);
    setSelectedStudentSubmission(null);
  };

  const handleEditDocument = (document) => {
    setResourceFormType('document');
    setEditingResourceType('document');
    setEditingResource(document);
    setShowResourceForm(true);
    setSelectedAssignment(null);
    setShowSubmissionForm(false);
    setSelectedStudentSubmission(null);
  };

  const handleDeleteAssignment = async (assignment) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài tập "${assignment.NAME}"?`)) {
      try {
        const response = await fetch(`${API_URL}/assignments/delete/${assignment.AS_ID}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to delete assignment: ${response.statusText}`);
        }

        alert('Bài tập đã được xóa thành công!');
        await fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
        alert(`Lỗi khi xóa bài tập: ${error.message}`);
      }
    }
  };

  const handleDeleteDocument = async (document) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${document.NAME}"?`)) {
      try {
        const response = await fetch(`${API_URL}/documents/delete/${document.DOC_ID}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to delete document: ${response.statusText}`);
        }

        alert('Tài liệu đã được xóa thành công!');
        await fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
        alert(`Lỗi khi xóa tài liệu: ${error.message}`);
      }
    }
  };

  const handleAssignmentRowClick = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowResourceForm(false);
    setShowSubmissionForm(false);
    setStudentSubmission(null);
    setAssignmentSubmissions([]);
    setSelectedStudentSubmission(null);

    if (userRole === 'student') {
      const submission = await fetchStudentSubmission(assignment.AS_ID);
      setStudentSubmission(submission);
      setShowSubmissionForm(true);
    } else if (userRole === 'teacher') {
      const submissions = await fetchAssignmentSubmissions(assignment.AS_ID);
      setAssignmentSubmissions(submissions);
    }
  };

  const handleSubmissionFormSubmit = async (formData) => {
    const { description, file, audioBlob } = formData;
    const assignmentId = selectedAssignment.AS_ID;

    const dataToSend = new FormData();
    dataToSend.append('student_id', userId);
    dataToSend.append('assignment_id', assignmentId);
    dataToSend.append('description', description);
    if (file) {
      dataToSend.append('file', file);
    } else if (audioBlob) {
      dataToSend.append('file', new File([audioBlob], `audio_${Date.now()}.webm`, { type: audioBlob.type })); 
    }

    try {
      let response;
      let url;
      let method;
      let successMessage;

      if (studentSubmission) { 
        url = `${API_URL}/submission/update/${userId}/${assignmentId}`;
        method = 'PUT';
        successMessage = 'Submission updated successfully!';
      } else {
        url = `${API_URL}/submission/upload`;
        method = 'POST';
        successMessage = 'Submission submitted successfully!';
      }

      response = await fetch(url, {
        method: method,
        body: dataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `Failed to submit work`);
      }

      alert(successMessage);
      setShowSubmissionForm(false);
      setSelectedAssignment(null); 
    } catch (error) {
      console.error("Error submitting work:", error);
      alert(`Failed to submit work: ${error.message}`);
    }
  };

  const handleSubmissionFormCancel = () => {
    setShowSubmissionForm(false);
    setSelectedAssignment(null);
    setStudentSubmission(null);
  };

  const handleSelectStudentSubmission = (submission) => {
    setSelectedStudentSubmission(submission);
  };

  const handleGradeSubmission = async (score, comment) => { 
    if (!selectedStudentSubmission) return;

    try {
      const response = await fetch(`${API_URL}/submission/grade/${selectedStudentSubmission.STUDENT_ID}/${selectedStudentSubmission.AS_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score: Number(score), teacher_comment: comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to grade submission: ${response.statusText}`);
      }

      alert('Submission graded successfully!');
      const updatedSubmissions = await fetchAssignmentSubmissions(selectedAssignment.AS_ID);
      setAssignmentSubmissions(updatedSubmissions);
      setSelectedStudentSubmission(null); 
    } catch (error) {
      console.error('Error grading submission:', error);
      alert(`Failed to grade submission: ${error.message}`);
    }
  };

  const submissionTableColumns = [
    { header: "ID Học viên", accessor: "STUDENT_ID" }, 
    { header: "Tên Học viên", accessor: "STUDENT_NAME" },
    { header: "Ngày nộp", accessor: "SUBMIT_DATE", render: (row) => formatDate(row.SUBMIT_DATE) },
    { header: "Mô tả", accessor: "DESCRIPTION" },
    {
      header: "File đính kèm",
      accessor: "FILE",
      render: (row) => (
        row.FILE ? <a href={`${API_URL}${row.FILE}`} target="_blank" rel="noopener noreferrer">Xem file</a> : "Không có"
      )
    },
    { header: "Điểm", accessor: "SCORE", render: (row) => row.SCORE !== null ? row.SCORE : "Chưa chấm" },
    { header: "Bình luận", accessor: "TEACHER_COMMENT", render: (row) => row.TEACHER_COMMENT || "Không có" },
    {
        header: "Action",
        render: (row) => (
            <button onClick={() => handleSelectStudentSubmission(row)} className="grade-button">
                {row.SCORE !== null ? 'Sửa điểm' : 'Chấm điểm'}
            </button>
        )
    }
  ];

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

  const assignmentCols = getAssignmentTableColumns(
    handleEditAssignment,
    handleDeleteAssignment,
    userRole,
    handleAssignmentRowClick 
  );

  const documentCols = getDocumentTableColumns(
    handleEditDocument,
    handleDeleteDocument,
    userRole
  );


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
      <BackButton type="button" onClick={handleGenericBack}>← Back</BackButton>

      {showResourceForm ? (
        <ResourceForm
          type={resourceFormType}
          initialData={editingResource}
          isEditMode={!!editingResource}
          onSubmit={handleResourceFormSubmit}
          onCancel={handleGenericBack}
        />
      ) : selectedAssignment && userRole === 'student' && showSubmissionForm ? (
        <div className="assignment-submission-view">
          
          <h3>{selectedAssignment.NAME}</h3>
          <p><strong>Mô tả:</strong> <span dangerouslySetInnerHTML={{ __html: selectedAssignment.DESCRIPTION }} /></p> {/* Render HTML from description */}
          <p><strong>Ngày bắt đầu:</strong> {formatDate(selectedAssignment.START_DATE)}</p>
          <p><strong>Ngày kết thúc:</strong> {formatDate(selectedAssignment.END_DATE)}</p>
          {selectedAssignment.FILE && (
            <p>
              <strong>File đính kèm:</strong>{" "}
              <a href={`${API_URL}${selectedAssignment.FILE}`} target="_blank" rel="noopener noreferrer">
                Xem file
              </a>
            </p>
          )}

          <SubmissionForm
            onSubmit={handleSubmissionFormSubmit}
            onCancel={handleSubmissionFormCancel}
            initialData={studentSubmission}
            isEditMode={!!studentSubmission}
          />
        </div>
      ) : selectedAssignment && userRole === 'teacher' && assignmentSubmissions.length >= 0 ? (
        <div className="assignment-review-view">
          <h3>Bài làm cho "{selectedAssignment.NAME}"</h3>
          {selectedStudentSubmission ? (
            <TeacherGradingInterface
              submission={selectedStudentSubmission}
              onGrade={handleGradeSubmission}
              onBack={handleGenericBack}
              API_URL={API_URL}
              assignmentName={selectedAssignment.NAME} 
            />
          ) : (
            <div>
              {assignmentSubmissions.length > 0 ? (
                <Table columns={submissionTableColumns} data={assignmentSubmissions} />
              ) : (
                <p>Chưa có bài làm nào cho bài tập này.</p>
              )}
            </div>
          )}
        </div>
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
                  <Table columns={assignmentCols} data={assignments} onRowClick={userRole === 'student' || userRole === 'teacher' ? handleAssignmentRowClick : null} />
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