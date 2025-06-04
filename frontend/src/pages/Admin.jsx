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
  fetchTeachers,
  fetchAccountants,
  updatePerson,
  deletePerson,
} from "../services/personService";
import {
  signup,
  createTeacher,
  createAccountant,
} from "../services/authService";
import { getAllCourses } from "../services/courseService";
import ClassesTab from "../components/AdminPage/ClassesTab/ClassTab.jsx";
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

// Dữ liệu từ API chuẩn hóa về đúng định dạng table
const normalizeClasses = (classes) =>
  classes.map((cls) => {
    const match = cls.DESCRIPTION?.match(/^\[Giáo viên:\s*(.*?)\]\s*/);
    const teacherName = match ? match[1] : "Không rõ";
    const cleanDescription = cls.DESCRIPTION?.replace(
      /^\[Giáo viên:\s*.*?\]\s*/,
      ""
    );

    return {
      id: cls.COURSE_ID,
      name: cls.NAME,
      description: cleanDescription,
      teacherName,
      startDate: formatDate(cls.START_DATE),
      endDate: formatDate(cls.END_DATE),
      startDateRaw: cls.START_DATE,
      endDateRaw: cls.END_DATE,
      minStu: cls.MIN_STU,
      maxStu: cls.MAX_STU,
      price: cls.PRICE,
      status: cls.STATUS || "waiting",
    };
  });

// Admin.jsx
const normalizeStudents = (students) =>
  students.map((s) => ({
    id: s.ID,
    name: s.NAME,
    birthday: formatDate(s.DATE_OF_BIRTH),
    email: s.EMAIL,
    status: s.STATUS,
    phone_number: s.PHONE_NUMBER || "",
    date_of_birth: s.DATE_OF_BIRTH,
  }));

const normalizeTeachers = (teachers) =>
  teachers.map((t) => ({
    id: t.ID,
    name: t.NAME,
    birthday: formatDate(t.DATE_OF_BIRTH),
    email: t.EMAIL,
    subject: t.SUBJECT,
    phone_number: t.PHONE_NUMBER || "",
    date_of_birth: t.DATE_OF_BIRTH,
  }));

const normalizeAccountants = (accountants) =>
  accountants.map((a) => ({
    id: a.ID,
    name: a.NAME,
    birthday: formatDate(a.DATE_OF_BIRTH),
    email: a.EMAIL,
    department: a.DEPARTMENT,
    phone_number: a.PHONE_NUMBER || "",
    date_of_birth: a.DATE_OF_BIRTH,
  }));

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedStatus, setSelectedStatus] = useState("teacher");
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [students, setStudents] = useState([]);

  // Load staffs
  useEffect(() => {
    const fetchStaffData = async () => {
      if (activeTab !== "staffs") return;
      try {
        if (selectedStatus === "teacher") {
          const data = await fetchTeachers();
          setTeachers(normalizeTeachers(data));
        } else if (selectedStatus === "accountant") {
          const data = await fetchAccountants();
          setAccountants(normalizeAccountants(data));
        }
      } catch (err) {
        console.error("Failed to fetch staff:", err);
        setTeachers([]);
        setAccountants([]);
      }
    };

    fetchStaffData();
  }, [activeTab, selectedStatus]);

  // Load students
  useEffect(() => {
    const fetchStudentData = async () => {
      if (activeTab !== "students") return;
      try {
        const data = await fetchStudents();
        setStudents(normalizeStudents(data));
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setStudents([]);
      }
    };

    fetchStudentData();
  }, [activeTab]);

  // Load classes
  useEffect(() => {
    const fetchClassData = async () => {
      if (activeTab !== "classes") return;
      try {
        const data = await getAllCourses();
        const normalized = normalizeClasses(data);
        setClasses(normalized);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setClasses([]);
      }
    };

    fetchClassData();
  }, [activeTab]);

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

  const getCurrentFormConfig = useCallback(() => {
    if (activeTab === "staffs") {
      if (selectedStatus === "teacher") return formConfigs.staffs_teacher;
      if (selectedStatus === "accountant") return formConfigs.staffs_accountant;
      return null;
    }
    return formConfigs[activeTab];
  }, [activeTab, selectedStatus]);

  const handleFormSubmitSuccess = async (data, isEdit = false) => {
    const formConfig = getCurrentFormConfig();
    const type = formConfig?.type;
    if (!data.staff_type) {
      data.staff_type = selectedStatus.toUpperCase(); // Gán staff_type từ selectedStatus
    }

    const missingFields = [];

    // Kiểm tra từng trường dữ liệu
    if (!isEdit && !data.hire_day) {
      missingFields.push("hire_day");
    }
    if (!data.name) missingFields.push("name");
    if (!data.email) missingFields.push("email");
    if (!data.phone_number) missingFields.push("phone_number");
    if (!data.date_of_birth) missingFields.push("date_of_birth");
    if (!data.staff_type) missingFields.push("staff_type");

    // Nếu có trường thiếu, hiển thị thông báo lỗi
    if (missingFields.length > 0) {
      alert(`Thiếu các trường thông tin: ${missingFields.join(", ")}`);
      return;
    }
    if (!type) return;

    try {
      let newData = data;

      // Admin.jsx
      const formatDateForAPI = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateStr;
        }
        const parts = dateStr.split("/");
        if (parts.length !== 3) {
          console.error("Invalid date format:", dateStr); // Thêm log để dễ debug
          return null;
        }

        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      };

      if (isEdit) {
        const updatePayload = {
          name: data.name,
          birthday: formatDateForAPI(data.date_of_birth),
          phone_number: data.phone_number,
          email: data.email,
          password: data.password || "",
        };

        await updatePerson(data.id, updatePayload);

        newData = {
          ...data,
          date_of_birth: formatDateForAPI(data.date_of_birth),
        };
      } else {
        // Tạo mới
        if (type === "Student") {
          const result = await signup({
            name: data.name,
            email: data.email,
            password: data.password,
            phoneNumber: data.phone_number,
            dateOfBirth: formatDateForAPI(data.date_of_birth), // Chuyển đổi cho backend
            role: "STUDENT",
          });
          newData = normalizeStudents([{ ...data, id: result.id }])[0];
          setStudents((prev) => [...prev, newData]);
        } else if (type === "Teacher") {
          const result = await createTeacher({
            name: data.name,
            email: data.email,
            password: data.password,
            phoneNumber: data.phone_number,
            dateOfBirth: formatDateForAPI(data.date_of_birth),
            hire_day: formatDateForAPI(data.hire_day),
            staff_type: data.staff_type,
          });
          newData = normalizeTeachers([{ ...data }])[0];
          alert(
            `Giáo viên đã được tạo.\nEmail: ${data.email}\nMật khẩu: ${data.password}`
          );
          setTeachers((prev) => [...prev, newData]);
        } else if (type === "Accountant") {
          const result = await createAccountant({
            name: data.name,
            email: data.email,
            password: data.password,
            phoneNumber: data.phone_number,
            dateOfBirth: formatDateForAPI(data.date_of_birth),
            hire_day: formatDateForAPI(data.hire_day),
            staff_type: data.staff_type,
          });
          newData = normalizeAccountants([{ ...data }])[0];
          alert(
            `Kế toán đã được tạo.\nEmail: ${data.email}\nMật khẩu: ${data.password}`
          );
          setAccountants((prev) => [...prev, newData]);
        }
      }

      // Cập nhật lại state cho UI
      if (type === "Student") {
        setStudents((prev) =>
          isEdit
            ? prev.map((s) => (s.id === newData.id ? newData : s))
            : [...prev, newData]
        );
      } else if (type === "Teacher") {
        setTeachers((prev) =>
          isEdit
            ? prev.map((t) => (t.id === newData.id ? newData : t))
            : [...prev, newData]
        );
      } else if (type === "Accountant") {
        setAccountants((prev) =>
          isEdit
            ? prev.map((a) => (a.id === newData.id ? newData : a))
            : [...prev, newData]
        );
      }

      setShowForm(false);
      setEditingData(null);
    } catch (err) {
      console.error(`Lỗi khi xử lý ${type}:`, err);
      alert(
        `Không thể ${isEdit ? "cập nhật" : "tạo mới"} ${type.toLowerCase()}!`
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
    } catch (error) {
      alert("Xóa không thành công.");
      console.error(error);
    }
  };

  const handleEdit = (data, type) => {
    setEditingData(data);
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
