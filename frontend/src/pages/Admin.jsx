import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/layout/Header/Header";
import SidebarSearch from "../components/layout/Sidebar/SidebarSearch";
import Table from "../components/common/Table/Table";
import DynamicForm from "../components/common/Form/DynamicForm";
import formConfigs from "../config/formConfig";
import {
  getStudentTableColumns,
  getTeacherTableColumns,
  getAccountantTableColumns,
} from "../config/tableConfig.jsx";
import {
  fetchStudents,
  fetchTeachers, // Đảm bảo import fetchTeachers
  fetchAccountants,
  updatePerson,
  deletePerson,
} from "../services/personService";
import {
  signup,
  createTeacher,
  createAccountant,
} from "../services/authService";
import { 
    getAllCourses, 
    createCourse, 
    updateCourse, 
    addStudentToCourse 
} from "../services/courseService";
import ClassesTab from "../components/layout/ClassesTab/AdminPage/ClassTab.jsx";
import { format } from "date-fns";

import "./Admin.css";

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

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedStatus, setSelectedStatus] = useState("teacher");
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]); // State để lưu danh sách giáo viên
  const [accountants, setAccountants] = useState([]);
  const [students, setStudents] = useState([]);

  // Hàm chuẩn hóa dữ liệu lớp học (ĐÃ SỬA)
  const normalizeClasses = useCallback((classesData) => // KHÔNG CẦN availableTeachers nữa
  classesData.map((cls) => {
    // ✅ Trực tiếp lấy tên giáo viên từ trường mới trả về từ Backend
    const teacherName = cls.TEACHER_NAME_FROM_DB || "Không rõ"; 

    // Xóa logic regex cũ và không cần cleanDescription nữa
    const cleanDescription = cls.DESCRIPTION; 

    return {
      id: cls.COURSE_ID,
      name: cls.NAME,
      description: cleanDescription,
      teacherName: teacherName, // Sử dụng tên giáo viên trực tiếp từ backend
      startDate: formatDate(cls.START_DATE),
      endDate: formatDate(cls.END_DATE),
      startDateRaw: cls.START_DATE,
      endDateRaw: cls.END_DATE,
      minStu: cls.MIN_STU,
      maxStu: cls.MAX_STU,
      price: cls.PRICE,
      teacherId: cls.TEACHER_ID // Vẫn giữ teacherId để edit form
    };
  }),
  [] // dependency array rỗng
  );

  const normalizeStudents = useCallback((studentsData) =>
    studentsData.map((s) => ({
      id: s.ID,
      name: s.NAME,
      birthday: formatDate(s.DATE_OF_BIRTH),
      email: s.EMAIL,
      status: s.STATUS,
      phone_number: s.PHONE_NUMBER || "",
      date_of_birth: s.DATE_OF_BIRTH,
    })),
    []
  );

  const normalizeTeachers = useCallback((teachersData) =>
    teachersData.map((t) => ({
      id: t.ID,
      name: t.NAME,
      birthday: formatDate(t.DATE_OF_BIRTH),
      email: t.EMAIL,
      phone_number: t.PHONE_NUMBER || "",
      date_of_birth: t.DATE_OF_BIRTH,
    })),
    []
  );

  const normalizeAccountants = useCallback((accountantsData) =>
    accountantsData.map((a) => ({
      id: a.ID,
      name: a.NAME,
      birthday: formatDate(a.DATE_OF_BIRTH),
      email: a.EMAIL,
      phone_number: a.PHONE_NUMBER || "",
      date_of_birth: a.DATE_OF_BIRTH,
    })),
    []
  );

  // --- Fetch Data Effects ---

  // Load teachers initially and whenever relevant (e.g., staffs tab or for classes)
  useEffect(() => {
    const fetchTeachersData = async () => {
      try {
        const data = await fetchTeachers();
        setTeachers(normalizeTeachers(data));
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
        setTeachers([]);
      }
    };
    fetchTeachersData(); // Fetch teachers ngay khi component mount
  }, [normalizeTeachers]);


  // Load staff (teachers/accountants) based on activeTab and selectedStatus
  useEffect(() => {
    const fetchStaffsData = async () => {
      if (activeTab !== "staffs") return; // Only fetch if on staffs tab
      try {
        if (selectedStatus === "teacher") {
          // Giáo viên đã được fetch ở useEffect riêng, chỉ cần cập nhật
          const data = await fetchTeachers(); // Hoặc dùng lại state teachers nếu không cần refresh
          setTeachers(normalizeTeachers(data));
        } else if (selectedStatus === "accountant") {
          const data = await fetchAccountants();
          setAccountants(normalizeAccountants(data));
        }
      } catch (err) {
        console.error("Failed to fetch staffs:", err);
        setTeachers([]);
        setAccountants([]);
      }
    };
    fetchStaffsData();
  }, [activeTab, selectedStatus, normalizeTeachers, normalizeAccountants]); // Add normalize funcs to dependencies

  // Load students (needed for both 'students' and 'classes' forms)
  useEffect(() => {
    const fetchStudentData = async () => {
      if (activeTab !== "students" && activeTab !== "classes") return;
      try {
        const data = await fetchStudents();
        setStudents(normalizeStudents(data));
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setStudents([]);
      }
    };
    fetchStudentData();
  }, [activeTab, normalizeStudents]);

  // Sửa lại useEffect load classes:
useEffect(() => {
  const fetchClassData = async () => {
    if (activeTab !== "classes") return; // Không cần chờ teachers.length > 0 nữa
    try {
      const data = await getAllCourses();
      const normalized = normalizeClasses(data); // KHÔNG CẦN TRUYỀN teachers nữa
      setClasses(normalized);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      setClasses([]);
    }
  };
  fetchClassData();
}, [activeTab, normalizeClasses]); 

  // ... (các useEffect khác không thay đổi)

  useEffect(() => {
    setShowForm(false);
    setEditingData(null);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "classes") setSelectedStatus("waiting");
    else if (activeTab === "dashboard") setSelectedStatus("calendar");
    else if (activeTab === "students") setSelectedStatus("all");
    else if (activeTab === "staffs") setSelectedStatus("teacher");
  }, [activeTab]);

  const handleStatusSelect = useCallback((key) => setSelectedStatus(key), []);

  const handleNew = () => {
    setShowForm(true);
    setEditingData(null);
  };

  // Sửa lại getCurrentFormConfig để vẫn truyền options cho teacher
  const getCurrentFormConfig = useCallback(() => {
    if (activeTab === "staffs") {
      if (selectedStatus === "teacher") return formConfigs.staffs_teacher;
      if (selectedStatus === "accountant") return formConfigs.staffs_accountant;
      return null;
    }
    // Khi lấy form config cho classes, cần truyền options giáo viên và học viên
    if (activeTab === "classes") {
        return {
            ...formConfigs.classes,
            fields: formConfigs.classes.fields.map(field => {
                if (field.name === "teacher") {
                    return {
                        ...field,
                        options: teachers.map(t => ({ value: t.id, label: t.name, id: t.id, name: t.name, email: t.email }))
                    };
                }
                if (field.name === "students") {
                    return {
                        ...field,
                        options: students.map(s => ({ value: s.id, label: `${s.name} (${s.email})`, id: s.id, name: s.name, email: s.email }))
                    };
                }
                return field;
            })
        };
    }
    return formConfigs[activeTab];
  }, [activeTab, selectedStatus, teachers, students]);


  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    const parts = dateStr.split("/");
    if (parts.length !== 3) {
      console.error("Invalid date format for API:", dateStr); 
      return null;
    }
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const handleFormSubmitSuccess = async (data, isEdit = false) => {
    const formConfig = getCurrentFormConfig();
    const type = formConfig?.type;

    console.log("handleFormSubmitSuccess - Data received:", data);
    console.log("handleFormSubmitSuccess - Form Type:", type);

    if (!type) {
        console.error("handleFormSubmitSuccess: Không tìm thấy loại form.");
        alert("Lỗi: Không xác định được loại form để xử lý.");
        return;
    }

    if (activeTab === "staffs" && !data.staff_type) {
        data.staff_type = selectedStatus.toUpperCase();
    }

    try {
        let newData = data;

        if (isEdit) {
            if (type === "Course") {
                console.log("Cập nhật khóa học với dữ liệu:", data);
                const updatePayload = {
                    name: data.name,
                    description: data.description || "",
                    startDate: formatDateForAPI(data.startDate),
                    endDate: formatDateForAPI(data.endDate),
                    minStu: data.minStu,
                    maxStu: data.maxStu,
                    price: data.price,
                    teacherId: data.teacher,
                };
                await updateCourse(data.id, updatePayload);
                alert(`Khóa học "${data.name}" đã được cập nhật thành công!`);
                
                const updatedClasses = await getAllCourses();
                setClasses(normalizeClasses(updatedClasses)); // <<<<<<< BỎ 'teachers' Ở ĐÂY LUÔN <<<<<<<
                
            } else {
                const updatePayload = {
                    name: data.name,
                    date_of_birth: formatDateForAPI(data.date_of_birth),
                    phone_number: data.phone_number,
                    email: data.email,
                };
                await updatePerson(data.id, updatePayload);
                if (type === "Student") {
                    const updatedStudents = await fetchStudents();
                    setStudents(normalizeStudents(updatedStudents));
                } else if (type === "Teacher") {
                    const updatedTeachers = await fetchTeachers();
                    setTeachers(normalizeTeachers(updatedTeachers));
                } else if (type === "Accountant") {
                    const updatedAccountants = await fetchAccountants();
                    setAccountants(normalizeAccountants(updatedAccountants));
                }
                alert(`Thông tin ${type.toLowerCase()} đã được cập nhật thành công!`);
            }
        } else { // Tạo mới
            if (type === "Student") {
                const result = await signup({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    phone_number: data.phone_number,
                    date_of_birth: formatDateForAPI(data.date_of_birth),
                    role: "STUDENT",
                });
                const updatedStudents = await fetchStudents(); 
                setStudents(normalizeStudents(updatedStudents));
                alert(`Học viên ${data.name} đã được tạo thành công!`);
            } else if (type === "Teacher") {
                const result = await createTeacher({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    phone_number: data.phone_number,
                    date_of_birth: formatDateForAPI(data.date_of_birth),
                    hire_day: formatDateForAPI(data.hire_day),
                    staff_type: data.staff_type,
                });
                const updatedTeachers = await fetchTeachers(); 
                setTeachers(normalizeTeachers(updatedTeachers));
                alert(`Giáo viên đã được tạo.\nEmail: ${data.email}\nMật khẩu: ${result.password}`);
            } else if (type === "Accountant") {
                const result = await createAccountant({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    phone_number: data.phone_number,
                    date_of_birth: formatDateForAPI(data.date_of_birth),
                    hire_day: formatDateForAPI(data.hire_day),
                    staff_type: data.staff_type,
                });
                const updatedAccountants = await fetchAccountants();
                setAccountants(normalizeAccountants(updatedAccountants));
                alert(`Kế toán đã được tạo.\nEmail: ${data.email}\nMật khẩu: ${result.password}`);
            }
            else if (type === "Course") {
                const coursePayload = {
                    name: data.name,
                    description: data.description || "",
                    startDate: formatDateForAPI(data.startDate),
                    endDate: formatDateForAPI(data.endDate),
                    minStu: data.minStu,
                    maxStu: data.maxStu,
                    price: data.price,
                    teacherId: data.teacher,
                };
                
                const result = await createCourse(coursePayload);
                alert(`Khóa học "${data.name}" đã được tạo thành công! ID: ${result.courseId}`);

                if (data.students && data.students.length > 0) {
                    console.log(`Đang thêm ${data.students.length} học viên vào khóa học ${result.courseId}`);
                    for (const student of data.students) {
                        try {
                            await addStudentToCourse({ 
                                studentId: student.id, 
                                courseId: result.courseId, 
                                paymentType: 'UNPAID', 
                                paymentDescription: `Đăng ký khóa học ${data.name}`
                            });
                            console.log(`Đã thêm học viên ${student.name} (ID: ${student.id}) vào khóa học ${data.name}`);
                        } catch (addStudentError) {
                            console.error(`Lỗi khi thêm học viên ${student.name} (ID: ${student.id}) vào khóa học ${data.name}:`, addStudentError);
                        }
                    }
                }

                const updatedClasses = await getAllCourses();
                setClasses(normalizeClasses(updatedClasses)); // <<<<<<< BỎ 'teachers' Ở ĐÂY LUÔN <<<<<<<
            }
        }

        setShowForm(false);
        setEditingData(null);
    } catch (err) {
        console.error(`Lỗi khi xử lý ${type}:`, err);
        alert(
            `Không thể ${isEdit ? "cập nhật" : "tạo mới"} ${type.toLowerCase()}! Lỗi: ${err.message || "Lỗi không xác định"}`
        );
    }
  };

  const handleDelete = async (item, type) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${item.name} (ID: ${item.id})?`
      )
    )
      return;

    try {
      await deletePerson(item.id);
      if (type === "Student")
        setStudents((prev) => prev.filter((s) => s.id !== item.id));
      else if (type === "Teacher")
        setTeachers((prev) => prev.filter((t) => t.id !== item.id));
      else if (type === "Accountant")
        setAccountants((prev) => prev.filter((a) => a.id !== item.id));
      alert(`${item.name} đã được xóa thành công!`);
    } catch (error) {
      alert("Xóa không thành công.");
      console.error(error);
    }
  };

  const handleEdit = (data, type) => {
    if (type === "Course") {
        setEditingData({
            ...data,
            teacher: data.teacherId 
        });
    } else {
        setEditingData(data);
    }
    setShowForm(true);
  };

  const filteredStudents =
    selectedStatus === "all"
      ? students
      : students.filter(
          (student) => student.status?.toLowerCase() === selectedStatus
        );

  return (
    <div className="admin-container">
      <Header role="admin" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="admin-body">
        <SidebarSearch
          role="admin"
          activeTab={activeTab}
          onSearch={handleStatusSelect}
          onNew={handleNew}
        />

        <div className="content">
          <div className="admin-display-area">
            {showForm && (
              <DynamicForm
                formConfig={getCurrentFormConfig()}
                initialData={editingData}
                onClose={() => setShowForm(false)}
                onSubmitSuccess={handleFormSubmitSuccess}
              />
            )}

            {!showForm && activeTab === "classes" && (
              <ClassesTab
                classes={classes}
                selectedStatus={selectedStatus}
                onSelect={(cls) => console.log("Selected class:", cls)}
                onEdit={(row) => handleEdit(row, "Course")}
                onDelete={(row) => handleDelete(row, "Course")}
              />
            )}

            {!showForm && activeTab === "students" && (
              <Table
                columns={getStudentTableColumns(
                  (row) => handleEdit(row, "Student"),
                  (row) => handleDelete(row, "Student")
                )}
                data={filteredStudents}
              />
            )}

            {!showForm && activeTab === "staffs" && (
              <>
                {selectedStatus === "teacher" && (
                  <Table
                    columns={getTeacherTableColumns(
                      (row) => handleEdit(row, "Teacher"),
                      (row) => handleDelete(row, "Teacher")
                    )}
                    data={teachers}
                  />
                )}
                {selectedStatus === "accountant" && (
                  <Table
                    columns={getAccountantTableColumns(
                      (row) => handleEdit(row, "Accountant"),
                      (row) => handleDelete(row, "Accountant")
                    )}
                    data={accountants}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;