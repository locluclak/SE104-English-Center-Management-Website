// AdminPage.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SidebarSearch from '../components/SidebarSearch';
import ClassesTab from '../components/AdminPage/ClassesTab';
import StaffsTab from '../components/AdminPage/StaffsTab';
import AddTeacherForm from '../components/AdminPage/AddTeacherForm';
import AddAccountantForm from '../components/AdminPage/AddAccountantForm';
import AddClassForm from '../components/AdminPage/AddClassForm'; // Đảm bảo đã import
import StudentListFull from '../components/AdminPage/StudentListFull';
import StudentListBasic from '../components/AdminPage/StudentListBasic';
import './Admin.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [selectedClassFilter, setSelectedClassFilter] = useState('current');
  const [selectedStudentStatus, setSelectedStudentStatus] = useState('');

  // SỬA Ở ĐÂY: Khởi tạo các state show...Form là false
  const [showClassForm, setShowClassForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showAccountantForm, setShowAccountantForm] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [accountants, setAccountants] = useState([]);
  // const [classes, setClasses] = useState([]); // Bạn sẽ cần state này để truyền data cho ClassesTab
  const mockStudents = [
    { id: 'S001', name: 'Alice Nguyen', email: 'alice@example.com', status: 'Enrolled' },
    { id: 'S002', name: 'Bob Tran', email: 'bob@example.com', status: 'Unenroll' },
  ];

  const adminLinks = [
    { key: 'classes', name: 'Classes' },
    { key: 'students', name: 'Students' },
    { key: 'staffs', name: 'Staffs' },
  ];

  const staffSubNavigationItems = [
    { key: 'teachers', name: 'Teacher' },
    { key: 'accountants', name: 'Accountant' },
  ];

  const classFilterItems = [
    { key: 'current', name: 'Current Classes' },
    { key: 'waiting', name: 'Waiting List' },
    { key: 'finished', name: 'Finished Classes' },
  ];

  const studentStatusFilters = [
    { key: 'View All', name: 'View All' },
    { key: 'Enrolled', name: 'Enrolled' },
    { key: 'Unenroll', name: 'Unenroll' },
  ];

  useEffect(() => {
    setTeachers([
      { id: 'T001', name: 'Dr. Smith', email: 'smith@example.com', specialization: 'Physics' },
      { id: 'T002', name: 'Ms. Jones', email: 'jones@example.com', specialization: 'Literature' },
    ]);
    setAccountants([
      { id: 'A001', name: 'Mr. Brown', email: 'brown@example.com', department: 'Payroll' },
      { id: 'A002', name: 'Mrs. Davis', email: 'davis@example.com', department: 'Receivables' },
    ]);
    // TODO: Fetch classes data
    // setClasses([...]);
  }, []);

  useEffect(() => {
    if (activeTab === 'staffs') {
      setActiveTab('teachers');
    }
    // Đảm bảo rằng khi chuyển tab, các form sẽ bị ẩn, trừ khi form đó thuộc tab hiện tại và đang được mở
    // Ví dụ, nếu đang ở tab 'classes' và showClassForm là true, nó không nên bị đóng
    // Cách đơn giản hơn là chỉ đóng form nếu activeTab *không phải* là tab của form đó
    if (activeTab !== 'classes') setShowClassForm(false);
    if (activeTab !== 'teachers') setShowTeacherForm(false);
    if (activeTab !== 'accountants') setShowAccountantForm(false);

  }, [activeTab]);

  const handleNew = () => {
    // Đóng tất cả các form khác trước khi mở form mới
    if (activeTab !== 'classes') setShowClassForm(false);
    if (activeTab !== 'teachers') setShowTeacherForm(false);
    if (activeTab !== 'accountants') setShowAccountantForm(false);
    
    // Mở form cho tab hiện tại
    if (activeTab === 'classes') setShowClassForm(true);
    else if (activeTab === 'students') alert('Thêm mới Student (form chưa triển khai)');
    else if (activeTab === 'teachers') setShowTeacherForm(true);
    else if (activeTab === 'accountants') setShowAccountantForm(true);
    else alert('Thêm mới không xác định.');
  };

  const getNavbarActiveKey = () => {
    if (['teachers', 'accountants'].includes(activeTab)) return 'staffs';
    if (classFilterItems.some(item => item.key === activeTab) && activeTab !== 'classes') return 'classes';
    return activeTab;
  };

  const handleStaffSubCategorySelect = (tabKey) => setActiveTab(tabKey);

  const handleClassFilterSelect = (filterKey) => {
    setSelectedClassFilter(filterKey);
    // Khi chọn filter, đảm bảo không hiển thị form thêm mới (nếu đang mở)
    setShowClassForm(false); 
    console.log('Class filter selected:', filterKey);
  };

  const handleStudentStatusSelect = (statusKey) => {
    setSelectedStudentStatus(statusKey);
    console.log('Student status selected:', statusKey);
  };

  const handleFormSubmitSuccess = (type) => {
    console.log(`${type} data saved!`);
    if (type === 'Teacher') setShowTeacherForm(false);
    if (type === 'Accountant') setShowAccountantForm(false);
    if (type === 'Class') setShowClassForm(false);
    // TODO: Fetch lại dữ liệu cho `type` tương ứng
  };

  const handleEditStaff = (id, staffType) => alert(`Edit ${staffType} ID: ${id}`);
  const handleDeleteStaff = (id, staffType) => alert(`Delete ${staffType} ID: ${id}`);

  return (
    <div className="admin-container">
      <Navbar
        role="admin"
        links={adminLinks}
        activeTab={getNavbarActiveKey()}
        setActiveTab={setActiveTab}
      />
      <div className="admin-body">
        <SidebarSearch
          activeTabKeyForSidebar={getNavbarActiveKey()}
          classFilterItems={classFilterItems}
          selectedClassFilter={selectedClassFilter}
          onSelectClassFilter={handleClassFilterSelect}
          studentStatusFilters={studentStatusFilters}
          selectedStudentStatus={selectedStudentStatus}
          onSelectStudentStatus={handleStudentStatusSelect}
          staffSubNavigationItems={staffSubNavigationItems}
          selectedStaffSubCategory={activeTab}
          onSelectStaffSubCategory={handleStaffSubCategorySelect}
          onNew={handleNew}
        />
        <div className="content">
          {/* SỬA Ở ĐÂY: Logic render cho CLASSES TAB & FORM */}
          {getNavbarActiveKey() === 'classes' && !showClassForm && (
            <ClassesTab
              activeFilter={selectedClassFilter}
              // data={classes} // Bạn sẽ truyền dữ liệu lớp học thực tế ở đây
              // Thêm các props khác nếu ClassesTab cần, ví dụ: onEditClass, onDeleteClass
            />
          )}
          {getNavbarActiveKey() === 'classes' && showClassForm && (
            <AddClassForm
              onClose={() => setShowClassForm(false)}
              onSubmitSuccess={() => handleFormSubmitSuccess('Class')}
            />
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
             <>
              {selectedStudentStatus === 'View All' || !selectedStudentStatus ?
                <StudentListFull students={mockStudents} /> :
                <StudentListBasic students={mockStudents.filter((s) => s.status === selectedStudentStatus)} />
              }
            </>
          )}

          {/* TEACHERS TAB / FORM */}
          {activeTab === 'teachers' && !showTeacherForm && (
            <StaffsTab staffType="teachers" data={teachers} onEdit={handleEditStaff} onDelete={handleDeleteStaff} />
          )}
          {activeTab === 'teachers' && showTeacherForm && (
            <AddTeacherForm onClose={() => setShowTeacherForm(false)} onSubmitSuccess={() => handleFormSubmitSuccess('Teacher')} />
          )}

          {/* ACCOUNTANTS TAB / FORM */}
          {activeTab === 'accountants' && !showAccountantForm && (
            <StaffsTab staffType="accountants" data={accountants} onEdit={handleEditStaff} onDelete={handleDeleteStaff} />
          )}
          {activeTab === 'accountants' && showAccountantForm && (
            <AddAccountantForm onClose={() => setShowAccountantForm(false)} onSubmitSuccess={() => handleFormSubmitSuccess('Accountant')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;