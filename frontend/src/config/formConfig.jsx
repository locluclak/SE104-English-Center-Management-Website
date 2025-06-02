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
        options: ['Mr. A', 'Ms. B', 'Mrs. C'].map(t => ({ value: t, label: t })),
      },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      {
        name: 'students', label: 'Students Enrolled', type: 'select', 
        isMulti: true,
        options: [
          { value: 'S01', label: 'John Doe (S01)', id: 'S01', name: 'John Doe', email: 'john@example.com' },
          { value: 'S02', label: 'Jane Smith (S02)', id: 'S02', name: 'Jane Smith', email: 'jane@example.com' },
          { value: 'S03', label: 'Bob Lee (S03)', id: 'S03', name: 'Bob Lee', email: 'bob@example.com' }
          // Thêm danh sách học viên ở đây
        ],
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
      { name: "status", label: "Status", type: "select", options: ["Enrolled", "Unenroll"], required: true }
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
