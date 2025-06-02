export const formConfigs = {
  classes: {
    type: 'Class',
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
        options: []
      },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'minStu', label: 'Min Students', type: 'number', required: true },
      { name: 'maxStu', label: 'Max Students', type: 'number', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
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
  type: "Teacher",
  title: "Add Teacher",
  fields: [
    { name: "name", label: "Họ tên", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Mật khẩu", type: "password", required: true },
    { name: "phone_number", label: "Số điện thoại", type: "text", required: true },
    { name: "date_of_birth", label: "Ngày sinh", type: "date", required: true },
    { name: "hireDay", label: "Ngày tuyển dụng", type: "date", required: true }
  ],
},


 staffs_accountant: {
  type: "Accountant",
  title: "Add Accountant",
  fields: [
    { name: "name", label: "Họ tên", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Mật khẩu", type: "password", required: true },
    { name: "phone_number", label: "Số điện thoại", type: "text", required: true },
    { name: "date_of_birth", label: "Ngày sinh", type: "date", required: true },
    { name: "hireDay", label: "Hire Day", type: "date", required: true }
  ],
},


  students: {
    type: 'Student',
    title: "Add Student",
    fields: [
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