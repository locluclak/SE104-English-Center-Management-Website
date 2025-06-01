import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/layout/Header";
import SidebarSearch from "../components/layout/SidebarSearch";
import Table from "../components/common/Table/Table";
import DynamicForm from "../components/common/Form/DynamicForm";
import formConfigs from "../config/formConfig";
import { getStudentTableColumns, getTeacherTableColumns, getAccountantTableColumns } from "../config/tableConfig.jsx";
import { fetchStudents, fetchTeachers, fetchAccountants } from "../services/personService";
import { getAllCourses } from "../services/courseService";
import Card from "../components/common/Card/Card";

import "./Admin.css";

// Dữ liệu từ API chuẩn hóa về đúng định dạng table
const normalizeClasses = (classes) =>
  classes.map((cls) => ({
    id: cls.COURSE_ID,
    name: cls.NAME,
    description: cls.DESCRIPTION,
    startDate: cls.START_DATE,
    endDate: cls.END_DATE,
    minStu: cls.MIN_STU,
    maxStu: cls.MAX_STU,
    price: cls.PRICE,
    status: cls.STATUS || "waiting",
  }));

const normalizeStudents = (students) =>
  students.map((s) => ({
    id: s.ID,
    name: s.NAME,
    birthday: s.BIRTHDAY,
    email: s.EMAIL,
    status: s.STATUS,
  }));

const normalizeTeachers = (teachers) =>
  teachers.map((t) => ({
    id: t.ID,
    name: t.NAME,
    birthday: t.BIRTHDAY,
    email: t.EMAIL,
    subject: t.SUBJECT,
  }));

const normalizeAccountants = (accountants) =>
  accountants.map((a) => ({
    id: a.ID,
    name: a.NAME,
    birthday: a.BIRTHDAY,
    email: a.EMAIL,
    department: a.DEPARTMENT,
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

  const handleFormSubmitSuccess = (data, isEdit = false) => {
    const formConfig = getCurrentFormConfig();
    const type = formConfig?.type;
    if (!type) return;

    if (type === "Student") {
      setStudents((prev) =>
        isEdit ? prev.map((s) => (s.id === data.id ? data : s)) : [...prev, data]
      );
    } else if (type === "Teacher") {
      setTeachers((prev) =>
        isEdit ? prev.map((t) => (t.id === data.id ? data : t)) : [...prev, data]
      );
    } else if (type === "Accountant") {
      setAccountants((prev) =>
        isEdit ? prev.map((a) => (a.id === data.id ? data : a)) : [...prev, data]
      );
    } else if (type === "Class") {
      const newClass = { ...data, status: data.status || "waiting" };
      setClasses((prev) =>
        isEdit ? prev.map((cls) => (cls.id === newClass.id ? newClass : cls)) : [...prev, newClass]
      );
    }

    setShowForm(false);
    setEditingData(null);
  };

  const handleEdit = (data, type) => {
    setEditingData(data);
    setShowForm(true);
  };

  const handleDelete = (item, type) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${item.name} (ID: ${item.id})?`)) return;

    if (type === "Student") setStudents((prev) => prev.filter((s) => s.id !== item.id));
    else if (type === "Teacher") setTeachers((prev) => prev.filter((t) => t.id !== item.id));
    else if (type === "Accountant") setAccountants((prev) => prev.filter((a) => a.id !== item.id));
  };

  const filteredStudents =
    selectedStatus === "all"
      ? students
      : students.filter((student) => student.status?.toLowerCase() === selectedStatus);

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
              <div className="class-grid">
                {classes.map((cls) => (
                  <Card key={cls.id} title={cls.name}>
                    <p>
                      <strong>ID:</strong> {cls.id}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong> {cls.status}
                    </p>
                    <p>
                      <strong>Ngày bắt đầu:</strong> {cls.startDate}
                    </p>
                    <p>
                      <strong>Ngày kết thúc:</strong> {cls.endDate}
                    </p>
                    <p>
                      <strong>Mô tả:</strong> {cls.description || "Không có"}
                    </p>
                  </Card>
                ))}
              </div>
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
