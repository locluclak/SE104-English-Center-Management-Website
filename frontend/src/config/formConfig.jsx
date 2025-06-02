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
        options: ['Mr. A', 'Ms. B', 'Mrs. C'],
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
      { name: "status", type: "hidden", defaultValue: "waiting" },
    ],
  },

  staffs_teacher: {
    type: 'Teacher',
    title: "Add Teacher",
    fields: [
      { name: "id", label: "Teacher ID", type: "text", required: true, placeholder: "Teacher ID" },
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Full Name" },
      { name: "birthday", label: "Birthday", type: "date", required: true },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "Email" },
      { name: "password", label: "Password", type: "password", required: true, placeholder: "Password" }, 
      { name: "specialization", label: "Specialization", type: "text", placeholder: "e.g., Math, Science" }
    ]
  },

  staffs_accountant: {
    type: 'Accountant',
    title: "Add Accountant",
    fields: [
      { name: "id", label: "Accountant ID", type: "text", required: true, placeholder: "Accountant ID" },
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Full Name" },
      { name: "birthday", label: "Birthday", type: "date", required: true },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "Email" },
      { name: "password", label: "Password", type: "password", required: true, placeholder: "Password" },
      { name: "department", label: "Department/Role", type: "text", placeholder: "e.g., Payroll, General Ledger" }
    ]
  },

  students: {
    type: 'Student',
    title: "Add Student",
    fields: [
      { name: "id", label: "Student ID", type: "text", required: true, placeholder: "Student ID" },
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Full Name" },
      { name: "birthday", label: "Birthday", type: "date", required: true },
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
