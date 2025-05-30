import React, { useState } from 'react';
import ClassDetail from './ClassDetail';
import Card from '../../common/Card/Card';
import formConfigs from '../../../config/formConfig';
import DynamicForm from '../../common/Form/DynamicForm';

const mockClasses = [
  { id: 'A', name: 'Class A', teacher: 'Mr. A', description: 'Basic TOEIC class' },
  { id: 'B', name: 'Class B', teacher: 'Ms. B', description: 'Intermediate TOEIC class' },
  { id: 'C', name: 'Class C', teacher: 'Mrs. C', description: 'Advanced TOEIC class' },
];

const ClassesTab = ({ selectedStatus, showClassForm, setShowClassForm }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const classFormConfig = formConfigs.addClass;

  return (
    <div className="class-management-page">
      {showClassForm ? (
        <DynamicForm
          formConfig={classFormConfig}
          onSubmit={(data) => {
            console.log('Submitted class:', data);
            setShowClassForm(false);
          }}
          onCancel={() => setShowClassForm(false)}
        />
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

          {selectedStatus && (
            <div className="class-grid">
              {mockClasses.map(cls => (
                <Card
                  key={cls.id}
                  title={cls.name}
                  onClick={() => setSelectedClass(cls)}
                >
                  <p><strong>Teacher:</strong> {cls.teacher}</p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClassesTab;
