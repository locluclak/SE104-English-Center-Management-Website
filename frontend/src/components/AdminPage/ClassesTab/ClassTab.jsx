import React, { useState } from 'react';
import AddClassForm from './AddClassForm';
import ClassList from './ClassList';
import ClassDetail from './ClassDetail';

const ClassesTab = ({ selectedStatus, showClassForm, setShowClassForm, classes = [] }) => {
  const [selectedClass, setSelectedClass] = useState(null);

  // Lọc classes theo selectedStatus nếu cần (ví dụ bạn có trường status hoặc category trong class)
  const filteredClasses = selectedStatus
    ? classes.filter(cls => cls.status === selectedStatus) // hoặc tùy filter phù hợp dữ liệu thật
    : classes;

  return (
    <div className="class-management-page">
      {showClassForm ? (
        <AddClassForm onClose={() => setShowClassForm(false)} />
      ) : selectedClass ? (
        <ClassDetail
          classData={selectedClass}
          selectedStatus={selectedStatus}
          onBack={() => setSelectedClass(null)}
        />
      ) : (
        <>
          <h2>
            {selectedStatus
              ? `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Classes`
              : 'Please select a category (Waiting, Current, End)'}
          </h2>

          {filteredClasses.length > 0 ? (
            <ClassList classList={filteredClasses} onSelectClass={setSelectedClass} />
          ) : (
            <p>No classes available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ClassesTab;