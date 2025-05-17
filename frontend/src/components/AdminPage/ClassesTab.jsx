import React from 'react';
import AddClassForm from './AddClassForm';

const ClassesTab = ({ selectedStatus, showClassForm, setShowClassForm }) => {
  return (
    <div className="class-management-page">
      {showClassForm ? (
        <AddClassForm onClose={() => setShowClassForm(false)} />
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
                List of <strong>{selectedStatus.toLowerCase()}</strong> classes
                will appear here.
              </p>

              {/* Sau này sẽ fetch danh sách từ API */}
              <ul>
                {/* Đây là mock data, sau sẽ thay bằng fetch thực */}
                {['Class A', 'Class B', 'Class C'].map((className, index) => (
                  <li key={index}>{className}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClassesTab;
