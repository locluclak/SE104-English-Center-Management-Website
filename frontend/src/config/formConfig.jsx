export const formConfigs = {
  classes: {
    type: 'Course',
    title: 'Create New Class',
    fields: [
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
        options: [],
        required: true,
      },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'End Date', type: 'date', required: true },
      { name: 'minStu', label: 'Min Students', type: 'number', required: true, placeholder: 'Minimum Students' },
      { name: 'maxStu', label: 'Max Students', type: 'number', required: true, placeholder: 'Maximum Students' },
      { name: 'price', label: 'Price', type: 'number', required: true, placeholder: 'Price' },
      {
        name: 'students', label: 'Students Enrolled', type: 'select',
        isMulti: true,
        options: [],
        displayFields: [
          { name: 'id', label: 'ID', placeholder: 'ID' },
          { name: 'name', label: 'Student Name', placeholder: 'Student Name' },
          { name: 'email', label: 'Email', placeholder: 'Email' },
        ],
      },
      { name: "status", type: "hidden", defaultValue: "waiting" },
    ],
  },

  staffs_teacher: {
    type: 'Teacher',
    title: "Add Teacher",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Full Name" },
      { name: "date_of_birth", label: "Birthday", type: "date", required: true },
      { name: "phone_number", label: "Phone Number", type: "text", required: true, placeholder: "Phone Number"},
      { name: "email", label: "Email", type: "email", required: true, placeholder: "Email" },
      { name: "password", label: "Password", type: "password", required: true, placeholder: "Password" }, 
      { name: "hire_day", label: "Hire Day", type: "date", required: true}
    ]
  },

  staffs_accountant: {
    type: 'Accountant',
    title: "Add Accountant",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Full Name" },
      { name: "date_of_birth", label: "Birthday", type: "date", required: true },
      { name: "phone_number", label: "Phone Number", type: "text", required: true, placeholder: "Phone Number"},
      { name: "email", label: "Email", type: "email", required: true, placeholder: "Email" },
      { name: "password", label: "Password", type: "password", required: true, placeholder: "Password" },
      { name: "hire_day", label: "Hire Day", type: "date", required: true}
    ]
  },

  students: {
    type: 'Student',
    title: "Add Student",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Full Name" },
      { name: "date_of_birth", label: "Birthday", type: "date", required: true },
      { name: "phone_number", label: "Phone Number", type: "text", required: true, placeholder: "Phone Number"},
      { name: "email", label: "Email", type: "email", required: true, placeholder: "Email" },
      { name: "password", label: "Password", type: "password", required: true, placeholder: "Password" },
    ]
  },

  addStudent: {
    title: 'Thêm học viên',
    fields: [
      { name: 'name', label: 'Tên học viên', type: 'text', required: true, placeholder: 'Nguyen Van A' },
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'a@example.com' }
    ]
  },

};

export default formConfigs;