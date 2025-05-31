import React, { useState } from 'react';
import ClassDetail from './ClassDetail';
import Card from '../../common/Card/Card';
import formConfigs from '../../../config/formConfig';
import DynamicForm from '../../common/Form/DynamicForm';

const ClassesTab = ({ selectedStatus, showClassForm, setShowClassForm, classes, setClasses }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const classFormConfig = formConfigs.addClass;

  const filteredClasses = classes.filter(cls => cls.status === selectedStatus);

  return (
    <div className="class-management-page">
      {showClassForm ? (
        <DynamicForm
          formConfig={classFormConfig}
          onSubmit={(data) => {
            console.log('Submitted class:', data);
            setClasses(prev => [...prev, newClass]);
            setShowClassForm(false);
          }}
          onClose={() => setShowClassForm(false)}
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
              {filteredClasses.map(cls => (
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