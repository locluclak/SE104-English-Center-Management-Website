import React, { useState, useEffect } from 'react';
import './CourseDetail.css';
import BackButton from "../../../common/Button/BackButton";
import Table from "../../../common/Table/Table";
import { assignmentTableColumns, documentTableColumns } from "../../../../config/tableConfig";
// IMPORT CÁC HÀM TỪ SERVICE
import { getCourseById } from '../../../../services/courseService'; // Đã có sẵn
// Cần thêm các hàm cho assignments và documents nếu có
// Giả sử bạn có các hàm này trong một service riêng hoặc thêm vào courseService.js
// Ví dụ:
// import { getAssignmentsByCourseId } from '../../../../services/assignmentService';
// import { getDocumentsByCourseId } from '../../../../services/documentService';
// TẠM THỜI SỬ DỤNG TRỰC TIẾP URL ĐỂ SỬA LỖI 404 VỚI CÁC ROUTE NÀY NẾU CHƯA CÓ SERVICE DEDICATED
const API_URL = "http://localhost:3000"; // Định nghĩa lại API_URL ở đây cho các fetch trực tiếp

const CourseDetail = ({ clsId, onBack }) => {
    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [activeTab, setActiveTab] = useState("students");
    const [showConfirm, setShowConfirm] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(true);

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
        return new Intl.DateTimeFormat("vi-VN", { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    };

    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!clsId) {
                setLoadingDetails(false);
                return;
            }

            setLoadingDetails(true);
            try {
                // 1. Fetch thông tin chi tiết khóa học SỬ DỤNG courseService
                const courseData = await getCourseById(clsId); // <-- SỬA Ở ĐÂY
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

                // 3. Fetch danh sách bài tập cho khóa học này (API riêng)
                // SỬ DỤNG API_URL ĐỂ ĐẢM BẢO ĐƯỜNG DẪN ĐẦY ĐỦ
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

                // 4. Fetch danh sách tài liệu cho khóa học này (API riêng)
                // SỬ DỤNG API_URL ĐỂ ĐẢM BẢO ĐƯỜNG DẪN ĐẦY ĐỦ
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
    }, [clsId]);

    const extractTeacherName = (description) => {
        const match = description.match(/\[Giáo viên:\s*([^\]]+)\]/);
        return match ? match[1] : null;
    };

    const removeTeacherNameFromDescription = (description) => {
        return description.replace(/\[Giáo viên:\s*[^\]]+\]\s*/, '').trim();
    };

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
            <BackButton type="button" onClick={onBack}>← Quay lại</BackButton>
            <div className="course-detail-main">
                <div className="course-info">
                    <div className="info-header">
                        <h2>{classInfo.name}</h2>
                    </div>
                    <p><strong>Tên khóa học:</strong> {classInfo.name}</p>
                    <p><strong>Giáo viên:</strong> {classInfo.teacherName}</p>
                    <p><strong>Mô tả:</strong> {classInfo.description}</p>
                    <p><strong>Ngày bắt đầu:</strong> {formatDate(classInfo.startDate)}</p>
                    <p><strong>Ngày kết thúc:</strong> {formatDate(classInfo.endDate)}</p>
                    <p><strong>Số học viên tối thiểu:</strong> {classInfo.minStu}</p>
                    <p><strong>Số học viên tối đa:</strong> {classInfo.maxStu}</p>
                    <p><strong>Học phí:</strong> {classInfo.price?.toLocaleString('vi-VN')}đ</p>
                </div>

                <div className="tabs">
                    <button
                        className={activeTab === "students" ? "active" : ""}
                        onClick={() => setActiveTab("students")}
                    >
                        Học viên
                    </button>
                    <button
                        className={activeTab === "assignment" ? "active" : ""}
                        onClick={() => setActiveTab("assignment")}
                    >
                        Bài tập
                    </button>
                    <button
                        className={activeTab === "doc" ? "active" : ""}
                        onClick={() => setActiveTab("doc")}
                    >
                        Tài liệu
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
                            <h3>Danh sách Bài tập</h3>
                            {assignments.length > 0 ? (
                                <Table columns={assignmentTableColumns} data={assignments} />
                            ) : (
                                <p>Không có bài tập nào cho khóa học này.</p>
                            )}
                        </div>
                    )}

                    {activeTab === "doc" && (
                        <div>
                            <h3>Danh sách Tài liệu</h3>
                            {documents.length > 0 ? (
                                <Table columns={documentTableColumns} data={documents} />
                            ) : (
                                <p>Không có tài liệu nào cho khóa học này.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;