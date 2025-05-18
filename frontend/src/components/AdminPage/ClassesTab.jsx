import React, { useState } from 'react';
import AddClassForm from './AddClassForm';
import ClassList from './ClassList';
import ClassDetail from './ClassDetail';

const mockClasses = [
  { id: 'A', name: 'Class A', teacher: 'Mr. A', description: 'Basic TOEIC class' },
  { id: 'B', name: 'Class B', teacher: 'Ms. B', description: 'Intermediate TOEIC class' },
  { id: 'C', name: 'Class C', teacher: 'Mrs. C', description: 'Advanced TOEIC class' },
];

const ClassesTab = ({ selectedStatus, showClassForm, setShowClassForm }) => {
  const [selectedClass, setSelectedClass] = useState(null);

  return (
    <div className="class-management-page">
      {showClassForm ? (
        <AddClassForm onClose={() => setShowClassForm(false)} />
      ) : selectedClass ? (
        // ✅ Truyền selectedStatus vào đây
        <ClassDetail
          classData={selectedClass}
          selectedStatus={selectedStatus}
          onBack={() => setSelectedClass(null)}
        />
      ) : (
        <>
          <h2>
            {selectedStatus
              ? `${selectedStatus} Classes`
              : 'Please select a category (Waiting, Current, End)'}
          </h2>

          {selectedStatus && (
            <div>
              <p>
                List of <strong>{selectedStatus.toLowerCase()}</strong> classes will appear here.
              </p>
              <ClassList classList={mockClasses} onSelectClass={setSelectedClass} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClassesTab;
