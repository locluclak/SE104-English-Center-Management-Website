import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/layout/Header";
import Navbar from "../components/Navbar";
import SidebarSearch from "../components/layout/SidebarSearch";
import Table from "../components/common/Table/Table";
import ClassesTab from "../components/AdminPage/ClassesTab/ClassTab";
import StaffsTab from "../components/AdminPage/StaffsTab/StaffsTab";
import StudentTab from "../components/AdminPage/StudentsTab/StudentTab";
import DynamicForm from "../components/common/Form/DynamicForm";
import AddTeacherForm from "../components/AdminPage/StaffsTab/AddTeacherForm";
import AddAccountantForm from "../components/AdminPage/StaffsTab/AddAccountantForm";
import AddStudentForm from "../components/AdminPage/StudentsTab/AddStudentForm";
import formConfigs from "../config/formConfig";
import {
  getStudentTableColumns,
  getTeacherTableColumns,
  getAccountantTableColumns,
} from "../config/tableConfig.jsx";
import { fetchTeachers, fetchAccountants } from "../services/personService";
import "./Admin.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedStatus, setSelectedStatus] = useState("teacher");
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (activeTab !== "staffs") return;
      try {
        if (selectedStatus === "teacher") {
          const data = await fetchTeachers();
          setTeachers(data);
        } else if (selectedStatus === "accountant") {
          const data = await fetchAccountants();
          setAccountants(data);
        }
      } catch (err) {
        console.error("Failed to fetch staff:", err);
        selectedStatus === "teacher" ? setTeachers([]) : setAccountants([]);
      }
    };
    fetchStaffData();
  }, [activeTab, selectedStatus]);

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
      setStudents(prev => isEdit ? prev.map(s => s.id === data.id ? data : s) : [...prev, data]);
    } else if (type === "Teacher") {
      setTeachers(prev => isEdit ? prev.map(t => t.ID === data.ID ? data : t) : [...prev, data]);
    } else if (type === "Accountant") {
      setAccountants(prev => isEdit ? prev.map(a => a.ID === data.ID ? data : a) : [...prev, data]);
    } else if (type === "Class") {
      const newClass = { ...data, status: data.status || "waiting" };
      setClasses(prev => isEdit ? prev.map(cls => cls.id === newClass.id ? newClass : cls) : [...prev, newClass]);
    }

    setShowForm(false);
    setEditingData(null);
  };

  const handleEdit = (data, type) => {
    setEditingData(data);
    setShowForm(true);
  };

  const handleDelete = (item, type) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${item.name || item.NAME} (ID: ${item.id || item.ID})?`)) return;

    if (type === "Student") setStudents(prev => prev.filter(s => s.id !== item.id));
    else if (type === "Teacher") setTeachers(prev => prev.filter(t => t.ID !== item.ID));
    else if (type === "Accountant") setAccountants(prev => prev.filter(a => a.ID !== item.ID));
  };

  const filteredStudents = selectedStatus === "all"
    ? students
    : students.filter(student => student.status?.toLowerCase() === selectedStatus);

  return (
    <div className="admin-container">
      <Navbar role="admin" activeTab={activeTab} setActiveTab={setActiveTab} />

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
                selectedStatus={selectedStatus}
                classes={classes}
                setClasses={setClasses}
              />
            )}

            {!showForm && activeTab === "students" && (
              <StudentTab
                students={filteredStudents}
                selectedStatus={selectedStatus}
                onEditStudent={(student) => handleEdit(student, "Student")}
                onDeleteStudent={(student) => handleDelete(student, "Student")}
              />
            )}

            {!showForm && activeTab === "staffs" && (
              <>
                {selectedStatus === "teacher" && (
                  <StaffsTab
                    staffType="teachers"
                    data={teachers}
                    onEdit={(staff) => handleEdit(staff, "Teacher")}
                    onDelete={(staff) => handleDelete(staff, "Teacher")}
                  />
                )}
                {selectedStatus === "accountant" && (
                  <StaffsTab
                    staffType="accountants"
                    data={accountants}
                    onEdit={(staff) => handleEdit(staff, "Accountant")}
                    onDelete={(staff) => handleDelete(staff, "Accountant")}
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
