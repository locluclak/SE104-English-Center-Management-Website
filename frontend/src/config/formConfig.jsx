const formConfigs = {
  addClass: {
    title: 'Create New Class',
    fields: [
      { 
        name: 'id', label: 'Class ID', type: 'text', 
        required: true, placeholder: 'ID',
      },
      {
        name: 'name', label: 'Class Name', type: 'text',
        required: true, placeholder: 'Class Name',
      },
      {
        name: 'description', label: 'Description', type: 'textarea',
        rows: 3, placeholder: 'Enter class description...',
      },
      {
        name: 'teacher', label: 'Teacher', type: 'select',
        options: ['Mr. A', 'Ms. B', 'Mrs. C'], // Có thể cập nhật động nếu cần
      },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      {
        name: 'students', label: 'Students Enrolled', type: 'dynamicList',
        fields: [
          { name: 'studentId', placeholder: 'ID', type: 'text' },
          { name: 'name', placeholder: 'Student Name', type: 'text' },
          { name: 'email', placeholder: 'Email', type: 'email' },
        ],
      },
    ],
  },

  // Bạn có thể thêm các form khác như:
  // addExercise: { ... }
  // addMaterial: { ... }
};

export default formConfigs;
