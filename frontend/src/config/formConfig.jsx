export const formConfigs = {
  classes: {
    type: 'Class',
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
        options: []
      },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
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
      { name: "id", label: "Teacher ID", type: "text", required: true, placeholder: "Teacher ID" },
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Full Name" },
      { name: "date_of_birth", label: "Birthday", type: "date", required: true },
      { name: "phone_number", label: "Phone Number", type: "text", required: true, placeholder: "Phone Number"},
      { name: "email", label: "Email", type: "email", required: true, placeholder: "Email" },
      { name: "password", label: "Password", type: "password", required: true, placeholder: "Password" }, 
      { name: "hire_day", lable: "HireDay", type: "date", required: true}
    ]
  },

  staffs_accountant: {
    type: 'Accountant',
    title: "Add Accountant",
    fields: [
      { name: "id", label: "Accountant ID", type: "text", required: true, placeholder: "Accountant ID" },
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Full Name" },
      { name: "date_of_birth", label: "Birthday", type: "date", required: true },
      { name: "phone_number", label: "Phone Number", type: "text", required: true, placeholder: "Phone Number"},
      { name: "email", label: "Email", type: "email", required: true, placeholder: "Email" },
      { name: "password", label: "Password", type: "password", required: true, placeholder: "Password" },
      { name: "hire_day", lable: "HireDay", type: "date", required: true}
    ]
  },

  students: {
    type: 'Student',
    title: "Add Student",
    fields: [
      { name: "id", label: "Student ID", type: "text", required: true, placeholder: "Student ID" },
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Full Name" },
      { name: "date_of_birth", label: "Birthday", type: "date", required: true },
      { name: "phone_number", label: "Phone Number", type: "text", required: true, placeholder: "Phone Number"},
      { name: "email", label: "Email", type: "email", required: true, placeholder: "Email" },
      { name: "password", label: "Password", type: "password", required: true, placeholder: "Password" },
      { name: "statuses", label: "Status", type: "select", options: ["Enrolled", "Unenroll"], required: true }
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

