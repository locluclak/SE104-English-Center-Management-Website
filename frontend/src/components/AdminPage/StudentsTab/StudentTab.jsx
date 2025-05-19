import React from 'react';
import StudentListFull from './StudentListFull';
import StudentListBasic from './StudentListBasic';
import './StudentTab.css';

const StudentTab = ({ students, selectedStatus }) => {
  return (
    <div className="student-tab-container">
      {selectedStatus === 'View All' && <StudentListFull students={students} />}

      {(selectedStatus === 'Enrolled' || selectedStatus === 'Unenroll') && (
        <StudentListBasic
          students={students.filter(
            (student) =>
              student.status.toLowerCase() === selectedStatus.toLowerCase()
          )}
        />
      )}
    </div>
  );
};

export default StudentTab;
